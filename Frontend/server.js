import express from 'express';
import QRCode from 'qrcode';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const jsonFilePath = path.join(__dirname, 'public/guests.json');
const outputDir = path.join(__dirname, 'public/qrcodes');

async function ensureOutputDir() {
    try {
        await fs.mkdir(outputDir, { recursive: true });
    } catch (error) {
        console.error('Ошибка при создании папки:', error.message);
    }
}
ensureOutputDir();

app.use(cors());
app.use(express.json());



async function loadGuests() {
    try {
        const data = await fs.readFile(jsonFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(jsonFilePath, '[]');
            return [];
        }
        throw error;
    }
}

async function saveGuests(guests) {
    await fs.writeFile(jsonFilePath, JSON.stringify(guests, null, 2));
}

function generateId() {
    return Math.floor(Math.random() * 99999).toString();
}

app.post('/add-guest', async (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Имя обязательно и должно быть строкой' });
    }

    try {
        const guests = await loadGuests();
        const id = generateId();
        const newGuest = { id, name: name.trim() };
        guests.push(newGuest);
        await saveGuests(guests);

        const qrData = JSON.stringify({ id, name });
        const fileName = `${id}_${name.replace(/\s+/g, '_')}.png`;
        const filePath = path.join(outputDir, fileName);
        await QRCode.toFile(filePath, qrData, {
            color: { dark: '#000000', light: '#ffffff' }
        });

        res.json({ guest: newGuest, qrCodePath: `/qrcodes/${fileName}` });
    } catch (error) {
        console.error('Ошибка:', error.message);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/guests', async (req, res) => {
    try {
        const guests = await loadGuests();
        res.json(guests);
    } catch (error) {
        console.error('Ошибка:', error.message);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});