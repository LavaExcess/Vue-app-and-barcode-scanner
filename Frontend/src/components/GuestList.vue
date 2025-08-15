<template>
  <div class="container">
    <h1>Гостевая книга</h1>
    <div class="guest-form">
      <form @submit.prevent="addGuest">
        <input v-model="newGuestName" type="text" placeholder="Введите имя гостя" required />
        <button type="submit">Создать QR-код</button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
      <h2>Проверка QR-кода</h2>
      <input type="file" @change="handleFileUpload" accept="image/*" />
      <p v-if="scanResult">Результат: {{ scanResult }}</p>
      <p v-if="scanError" class="error">{{ scanError }}</p>
    </div>
    <h2>Список гостей</h2>
    <div class="guests-list">
      <div v-for="guest in guests" :key="guest.id" class="guest-card">
        <div class="guest-name">{{ guest.name }}</div>
        <img v-if="guest.qrCodePath" :src="guest.qrCodePath" alt="QR Code" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jsQR from 'jsqr';

export default {
  name: 'GuestList',
  data() {
    return {
      guests: [],
      newGuestName: '',
      error: null,
      scanResult: null,
      scanError: null
    };
  },
  async mounted() {
    await this.loadGuests();
  },
  methods: {
    async loadGuests() {
      try {
        const { data } = await axios.get('http://localhost:3000/guests');
        this.guests = data.map(guest => ({
          ...guest,
          qrCodePath: `/qrcodes/${guest.id}_${guest.name.replace(/\s+/g, '_')}.png`
        }));
      } catch (error) {
        console.error('Ошибка загрузки гостей:', error);
        this.error = 'Не удалось загрузить список гостей';
      }
    },
    async addGuest() {
      if (!this.newGuestName.trim()) {
        this.error = 'Имя не может быть пустым';
        return;
      }
      try {
        const { data } = await axios.post('http://localhost:3000/add-guest', { name: this.newGuestName.trim() });
        await this.loadGuests();
        this.newGuestName = '';
        this.error = null;
      } catch (error) {
        console.error('Ошибка добавления гостя:', error);
        this.error = 'Не удалось добавить гостя';
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          try {
            const qrData = JSON.parse(code.data);
            const guest = this.guests.find(g => g.id === qrData.id && g.name === qrData.name);
            this.scanResult = guest ? `Гость подтвержден: ${qrData.name} (ID: ${qrData.id})` : null;
            this.scanError = guest ? null : 'Гость не найден';
          } catch (e) {
            this.scanResult = null;
            this.scanError = 'Неверный формат данных QR-кода';
          }
        } else {
          this.scanResult = null;
          this.scanError = 'QR-код не распознан';
        }
        URL.revokeObjectURL(img.src);
      };
    }
  }
};
</script>

<style>
.guest-form {
  display: flex;
  gap: 10px;
}

.guests-list {
  margin-top: 50px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.guest-card {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.guest-name {
  text-align: center;
}
</style>