import guests from '@/assets/storage/guests.json';

export const fetchGuests = () => {
    return fetch('https://raw.githubusercontent.com/LavaExcess/Vue-app-and-barcode-scanner/refs/heads/driver/src/assets/storage/guests.json')
        .then(resp => resp.json())
        .catch((err) => {
            console.warn(err);
            return guests;
        })
}
