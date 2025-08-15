<template>
  <div class="container">
    <h1 class="hello">Список гостей</h1>
    <div class="guest-form ">
      <div v-for="guest in guests" :key="guest.id" class="guest-card">
        <p>{{ guest.name }} {{ guest.surname }}</p>
        <p>ID: {{ guest.id }}</p>
        <img :src="guest.qrCode" alt="QR Code" />
        <button @click="downloadQRCode(guest)">Скачать QR</button>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'
import guestData from '@/assets/storage/guests.json'

export default {
  name: 'GuestList',
  data() {
    return {
      guests: []
    }
  },
  async mounted() {
    try {
      const withQRCodes = await Promise.all(
        guestData.map(async guest => {
          const qrDataUrl = await QRCode.toDataURL(JSON.stringify(guest))
          return { ...guest, qrCode: qrDataUrl }
        })
      )
      this.guests = withQRCodes
    } catch (err) {
      console.error('Ошибка при работе с guests.json:', err)
    }
  },
  methods: {
    downloadQRCode(guest) {
      const link = document.createElement('a')
      link.href = guest.qrCode
      link.download = `${guest.name}_${guest.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}
</script>

<style>
.guest-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
}

.guest-card {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}



.guest-card img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.guest-card p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.guest-card button {
  padding: 8px 12px;
  background-color: #42b983;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.guest-card button:hover {
  background-color: #369870;
}

@media (max-width: 768px) {
  .guest-form {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .guest-card img {
    width: 100px;
    height: 100px;
  }

  .guest-card p {
    font-size: 14px;
  }

  .guest-card button {
    font-size: 14px;
    padding: 6px 10px;
  }
}
</style>
