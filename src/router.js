import { createRouter, createWebHistory } from 'vue-router';
import Authorization from './components/Authorization.vue';
import Guest from './components/GuestList.vue';
const routes = [
    {
        path: '/',
        component: Authorization,
    },
    {
        path: '/admin',
        component: Guest,
    },
    {
        path: '/test',
        component: Authorization,
        props: {
            isOnTesting: true,
        }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;