const { ipcRenderer } = require('electron')

document.addEventListener('DOMContentLoaded', () => {

    const currentUrl = window.location.href;
    if (currentUrl.includes('https://supermarketsimulator.zalgo.fr/restock')) {
        const textbox = document.querySelector('.input_api_key');
        const api_key = document.querySelector('.api_key');
        const welcome = document.querySelector('.welcome p');
        
        ipcRenderer.send('api_key', textbox.value);

        welcome.style.display = 'none';
        api_key.style.display = 'none';
    }
});