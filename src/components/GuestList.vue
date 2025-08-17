<template>
  <div class="container">
    <h1 class="hello">Список гостей</h1>
    <button class="download-all-btn" @click="downloadAllQRCodesZip">
      <transition name="fade-scale" mode="out-in">
        <span v-if="!allDownloaded" key="text">Скачать все QR (ZIP)</span>
        <span v-else key="check">✅ Все скачано</span>
      </transition>
    </button>
    <div class="guest-form">
      <div v-for="guest in guests" :key="guest.id" class="guest-card">
        <p>{{ guest.name }} {{ guest.surname }}</p>
        <button @click="downloadQRCode(guest)" :class="{ success: guest.downloaded }">
          <transition name="fade-scale" mode="out-in">
            <span v-if="!guest.downloaded" key="text">Скачать QR</span>
            <span v-else key="check">✅</span>
          </transition>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import QRCode from 'qrcode'
import { fetchGuests } from '@/util'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export default {
  name: 'GuestList',
  data() {
    return {
      guests: [],
      allDownloaded: false
    }
  },
  async mounted() {
    const guestData = await fetchGuests()
    console.log(`Successfully loaded ${guestData.length} guests to admin`)

    try {
      const withQRCodes = await Promise.all(
        guestData.map(async guest => {
          const qrDataUrl = await QRCode.toDataURL(JSON.stringify(guest))
          return { ...guest, qrCode: qrDataUrl, downloaded: false }
        })
      )
      this.guests = withQRCodes
    } catch (err) {
      console.warn('Ошибка при работе с guests.json:', err)
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

      guest.downloaded = true
    },
    async downloadAllQRCodesZip() {
      try {
        const zip = new JSZip()
        const folder = zip.folder('qr_codes')

        for (const guest of this.guests) {
          const base64Data = guest.qrCode.split(',')[1]
          folder.file(`${guest.name}_${guest.id}.png`, base64Data, { base64: true })
        }

        const content = await zip.generateAsync({ type: 'blob' })
        saveAs(content, 'qr_codes.zip')


        this.guests.forEach(g => g.downloaded = true)
        this.allDownloaded = true
      } catch (err) {
        console.error('Ошибка при создании ZIP:', err)
      }
    }
  }
}
</script>
<style>
.download-all-btn {
  padding: 10px 16px;
  margin: 20px;
  background-color: #C6DF9D;
  color: black;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.5s;
}
.download-all-btn:hover {
  background-color: #93c247;
}
.download-all-btn:active {
  transform: scale(0.97);
}
.guest-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
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
  height: 150px;
  justify-content: space-between;
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
  transition: background-color 0.2s, transform 0.1s;
}

.guest-card button:hover {
  background-color: #369870;
}

.guest-card button.success {
  background-color: #28a745;
}

.guest-card button:active {
  transform: scale(0.97);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.fade-scale-enter-to {
  opacity: 1;
  transform: scale(1);
}

.fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
