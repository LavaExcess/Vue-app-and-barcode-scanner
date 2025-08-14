<template>
    <div class="container">
        <h1>Гостевая книга</h1>
        <div class="guest-form">
            <input v-model="newGuest.name" placeholder="Имя" class="inp">
            <input v-model="newGuest.surname" placeholder="Фамилия" class="inp">
            <button @click="addGuest" class="button">Добавить гостя</button>
        </div>

        <div class="guests-list">
            <div v-for="guest in guests" :key="guest.id" class="guest-card">
                <h3>{{ guest.name }} {{ guest.surname }}</h3>
                <QrcodeVue :value="qrText(guest)" :size="100" class="qrcode" />
                <p class="guest-id">ID: {{ guest.id }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'
const guests = ref([])
const newGuest = ref({
    name: '',
    surname: '',
    id: null
})
const qrText = (guest) => {
    return `Гость: ${guest.name} ${guest.surname}\nID: ${guest.id}`
}
const fetchGuests = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/guests')
        guests.value = response.data
    } catch (error) {
        console.error('Ошибка загрузки:', error)
    }
}
const addGuest = async () => {
    if (!newGuest.value.name || !newGuest.value.surname) {
        alert('Заполните все поля')
        return
    }
    try {
        const guestData = {
            name: newGuest.value.name,
            surname: newGuest.value.surname,
            id: Date.now()
        }

        const response = await axios.post('http://localhost:3000/api/guests', guestData)
        guests.value.push(response.data.guest)
        newGuest.value.name = ''
        newGuest.value.surname = ''
    } catch (error) {
        console.error('Ошибка добавления:', error)
    }
}

onMounted(fetchGuests)
</script>

<style>
.guest-form {
    display: flex;
    gap: 10px;
}

.inp {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    flex-grow: 1;
}

.button {
    padding: 8px 16px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
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
}

.qrcode {
    margin: 10px auto;
    display: block;
}

.guest-id {
    color: #666;
    font-size: 0.9em;
}
</style>