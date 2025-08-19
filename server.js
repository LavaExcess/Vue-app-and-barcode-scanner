import { createServer } from 'http';
import { Server } from 'socket.io';
import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

const guestsFilePath = join(__dirname, 'src', 'assets', 'storage', 'guests.json');

let guests = [];
try {
  const data = await readFile(guestsFilePath, 'utf8');
  guests = JSON.parse(data);
  console.log('✅ Гости загружены:', guests.length);
} catch (error) {
  console.error('❌ Ошибка загрузки guests.json:', error);
}

io.on('connection', (socket) => {
  console.log('✅ Новое соединение установлено. ID:', socket.id);
  socket.emit('message', 'Вы подключены к серверу проверки гостей');

  // Обработка входящих сообщений
  socket.on('message', (rawData) => {
    try {
      console.log('📨 Получено сообщение:', rawData);

      // Парсим данные (Postman отправляет как строку)
      const parsedData = JSON.parse(rawData);

      // Обрабатываем формат ["check_guest", {"guestId": 1}]
      if (Array.isArray(parsedData) && parsedData.length === 2) {
        const [eventName, eventData] = parsedData;

        if (eventName === 'check_guest' && eventData.guestId) {
          console.log('🔍 Команда check_guest получена для ID:', eventData.guestId);
          checkGuest(socket, eventData.guestId);
          return;
        }
      }

      // Обрабатываем простой формат {"guestId": 1}
      if (parsedData.guestId) {
        console.log('🔍 Команда получена для ID:', parsedData.guestId);
        checkGuest(socket, parsedData.guestId);
        return;
      }

      console.log('❌ Неизвестный формат данных:', parsedData);

    } catch (error) {
      console.log('❌ Ошибка парсинга JSON:', rawData, error);
      socket.emit('error', { message: 'Неверный формат данных' });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Соединение закрыто. ID:', socket.id);
  });
});

// Функция проверки гостя
function checkGuest(socket, guestId) {
  const guest = guests.find(g => g.id === guestId);

  if (guest) {
    console.log('✅ Гость найден:', guest.name);
    socket.emit('guest_checked', {
      success: true,
      message: `Гость найден: ${guest.name}`,
      guest: guest
    });
  } else {
    console.log('❌ Гость не найден с ID:', guestId);
    socket.emit('guest_checked', {
      success: false,
      message: `Гость с ID ${guestId} не найден`
    });
  }
}

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Сервер проверки гостей запущен на http://localhost:${PORT}`);
});