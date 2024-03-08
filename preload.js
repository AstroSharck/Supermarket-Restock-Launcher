const { ipcRenderer } = require('electron')

document.addEventListener('DOMContentLoaded', () => {

    const currentUrl = window.location.href;
    if (currentUrl.includes('https://supermarketsimulator.zalgo.fr/restock')) {
        const textbox = document.querySelector('.input_api_key');
        const apikey_reloadpage = document.querySelector('.apikey_reloadpage');
        const welcome = document.querySelector('.welcome p');
        
        ipcRenderer.send('api_key', textbox.value);

        welcome.style.display = 'none';
        apikey_reloadpage.style.display = 'none';
    }
});