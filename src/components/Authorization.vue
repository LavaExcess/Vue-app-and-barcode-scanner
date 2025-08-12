<template>
    <div class="Container">
        <div v-if="currentState === 'waiting'">
            <h2>Сканируйте штрих-код</h2>
            <input ref="barcodeInput" v-model="barcode" type="text"
                style="opacity: 0; position: absolute; left: -9999px;" @input="handleScan" placeholder="" />
            <!-- Удалить строку в релизе. Для тестов-->
            <input v-model="testBarcode" type="text" placeholder="QR-Код для теста" @input="handleTestInput" />
        </div>
        <div v-else-if="currentState === 'greeting'">
            <h2>{{ greetingMessage }}</h2>
        </div>
        <div v-else-if="currentState === 'error'">
            <h2>Ошибка, обратитесь на ресепшн</h2>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import guests from '@/assets/storage/guests.json';
const currentState = ref('waiting');
const barcode = ref('');
const testBarcode = ref('');   /*  Удалить строку в релизе. Для тестов*/
const greetingMessage = ref('');
const timeoutSeconds = ref(1);
let timeoutId = null;

const handleScan = () => {
    if (barcode.value.length >= 1) {
        checkGuest(barcode.value);
        barcode.value = '';
    }
};

/*  Удалить строку в релизе. Для тестов*/
const handleTestInput = () => {
    if (testBarcode.value.length >= 1) {
        checkGuest(testBarcode.value);
        testBarcode.value = '';
    }
};

const checkGuest = (code) => {
    const guest = guests.find(g => g.code === code);
    if (guest) {
        if (guest.name && guest.name.trim() !== '') {
            greetingMessage.value = `Привет, ${guest.name}`;
        } else {
            greetingMessage.value = 'Привет, гость';
        }
        currentState.value = 'greeting';
    } else {
        currentState.value = 'error';
    }
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        resetToWaiting();
    }, timeoutSeconds.value * 3000);
};

const resetToWaiting = () => {
    currentState.value = 'waiting';
    greetingMessage.value = '';
    if (barcodeInput.value) {
        barcodeInput.value.focus();
    }
};

const barcodeInput = ref(null);

onMounted(() => {
    resetToWaiting();
});
</script>

<style>
.Container {
    text-align: center;
    margin-top: 50px;
}

input {
    margin-top: 10px;
    padding: 8px;
    font-size: 16px;
}
</style>