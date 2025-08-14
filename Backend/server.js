const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3000;
const JSON_FILE = path.join(__dirname, 'guests.json');

app.use(cors()); 
app.use(express.json()); 


if (!fs.pathExistsSync(JSON_FILE)) {
    fs.writeJsonSync(JSON_FILE, []);
}

app.post('/api/guests', async (req, res) => {
    try {
        const newGuest = req.body; 

        if (!newGuest.name || !newGuest.surname || !newGuest.id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const guests = await fs.readJson(JSON_FILE);

        if (guests.some(g => g.id === newGuest.id)) {
            return res.status(409).json({ error: 'ID already exists' });
        }

        guests.push(newGuest);

        await fs.writeJson(JSON_FILE, guests, { spaces: 2 });

        res.status(201).json({ message: 'Guest added successfully', guest: newGuest });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/guests', async (req, res) => {
    try {
        const guests = await fs.readJson(JSON_FILE);
        res.json(guests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});