<template>
    <div class="container">
        <div class="gradient-circle"></div>
        <div class="container-image">
            <SVGx5 class="logo" />
            <div v-if="currentState === 'waiting'">
                <div class="wrapper">
                    <h2 class="hello">Отсканируйте<br>своё приглашение</h2>
                    <input
                        v-if="props.isOnTesting"
                        v-model="barcode"
                        type="text"
                        placeholder="QR-Код для теста"
                        @input="handleScan"
                    />
                    <input
                        v-else
                        v-model="barcode"
                        ref="barcodeInput"
                        type="text"
                        style="opacity: 0; position: absolute; left: -9999px;"
                        @input="handleScan"
                        placeholder=""
                    />
                </div>
            </div>
            <div v-else-if="currentState === 'greeting'">
                <div class="wrapper">
                    <h3 class="hello">{{ greetingMessage }}, рады<br>Вас видеть в</h3>
                    <div class="rectangle">
                        <div class="rectangle-green">
                            <h2 class=" text-x5">Х5</h2>
                        </div>
                        <div class="rectangle-gradient">
                            <h2 class="text-podsobke">ПОДСОБКЕ</h2>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else-if="currentState === 'error'">
                <div class="wrapper">
                    <h3 class="hello">Дорогой гость,<br>рады видеть Вас в</h3>
                    <div class="rectangle">
                        <div class="rectangle-green">
                            <h2 class=" text-x5">Х5</h2>
                        </div>
                        <div class="rectangle-gradient">
                            <h2 class="text-podsobke">ПОДСОБКЕ</h2>
                        </div>
                    </div>
                    <p class="notification">
                        Для внесения в список <br> вам необходимо обратиться <br> к администратору зала
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { io } from 'socket.io-client';
import { ref, onMounted, defineProps } from 'vue';
import { fetchGuests } from '@/util';
import SVGx5 from '@/components/svg/SVGx5.vue';

const socket = io('http://localhost:9092')
const currentState = ref('waiting');
const barcode = ref('');
const greetingMessage = ref('');
const timeoutSeconds = ref(1);
let timeoutId = null;

socket.on('connect', ()=> {
    console.log('Succesfully connect to Socket.IO')
})

socket.on('scannerData', (payload) => {
    console.log(JSON.stringify(payload));
    checkGuest(payload.data);
})

const props = defineProps({
    isOnTesting: Boolean
})

const handleScan = () => {
    console.log(barcode.value);
    if (barcode.value.length >= 1) {
        checkGuest(barcode.value);
        barcode.value = '';
    }
};

const checkGuest = (id) => {
    const scannedId = String(id).trim();
    const guest = guests.find(g => String(g.id).trim() === scannedId);

    if (guest) {
        if (guest.name && guest.name.trim() !== '') {
            greetingMessage.value = guest.name.trim();
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
var guests;
onMounted(async () => {
    if (props.isOnTesting) {
        console.warn("App is in TESTING mode!")
    }
    (async () => {
        guests = await fetchGuests();
        console.log(`Successfully loaded ${guests.length} guests to check`);
    })();
    resetToWaiting();
});
</script>
<style>
.container {
    width: 100%;
    height: 100%;
    min-height: 1920px;
    background-color: #003E14;
}
.logo {
    position: relative;
    top: 107px;
    left: 50%;
    transform: translateX(-50%);
}
.container-image {
    width: 100%;
    height: 1920px;
    position: relative;
    user-select: none;
    background-image: url("@/assets/img/layer1.png");
    background-size: cover;
    overflow: visible;
}
.gradient-circle {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 50%;
    top: -50%;
    transform: translateX(-50%);
    background: radial-gradient(circle at center,
            rgba(13, 103, 6, 0.138) 0%,
            rgba(0, 50, 16, 0.46) 100%);
    filter: blur(27.1px);
    border-radius: 1000px;
    pointer-events: none;
}
.wrapper {
    position: relative;
    top: 200px;
    width: 80%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 30px
}
.hello {
    font-size: 82px;
    text-align: center;
}
@media (max-width: 700px) {
    .hello {
        font-size: calc(var(--index)*3.5);
    }
}
.rectangle {
    display: flex;
    height: 135px;
}
.rectangle-green {
    position: relative;
    left: 60px;
    width: 310px;
    background: #5FAF2D;
    border-radius: 74.35px;
}
.rectangle-gradient {
    position: relative;
    left: -60px;
    width: 570.45px;
    background: linear-gradient(rgba(24, 25, 34, 0.3) 17.93%, rgba(95, 175, 45, 0.15) 100%);
    backdrop-filter: blur(8.5px);
    border-radius: 74.35px;
}
.text-x5 {
    position: relative;
    left: 15%;
    top: 15%;
    transform: translateX(-50%, -50%);
    font-size: 82px;
}
.text-podsobke {
    position: relative;
    left: 5%;
    top: 15%;
    transform: translateX(-50%, -50%);
    font-size: 82px;
}
.notification {
    position: relative;
    width: 80%;
    top: 50px;
    font-size: 44px;
    text-align: center;
    color: #FFFFFF;
    line-height: 0.9;
    margin: 0;
    padding: 0;
}
</style>