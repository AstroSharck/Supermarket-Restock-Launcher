// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')
const path = require('node:path')
const fs = require('fs');
const axios = require('axios');

const Store = require('electron-store');
const store = new Store();

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1281,
    height: 824,
    icon: './icon.png',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      enableRemoteModule: true,
      devTools: true
    }
  })
  Menu.setApplicationMenu(null)
  // and load the index.html of the app.
  mainWindow.loadURL('https://supermarketsimulator.zalgo.fr/')

  // Open the DevTools.
  /* ainWindow.webContents.openDevTools() */
}

ipcMain.on('api_key', (data, key) => {
  store.set('api_key', key);
  GetSaveData()
});

app.whenReady().then(() => {
  try {
    const localLowPath = path.join(process.env.APPDATA, '..', 'LocalLow', 'Nokta Games', 'Supermarket Simulator', 'SaveFile.es3')
    if (localLowPath) {
      fs.watch(localLowPath, (eventType, filename) => {
        if (eventType === 'change') {
          GetSaveData().then(() => { setTimeout(() => {
            mainWindow.reload();
          }, 1000); })
        }
      });
      createWindow()
      GetSaveData()
    }
  } catch (error) {
    console.log(error)
    dialog.showMessageBox({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de récupérer la sauvegarde de Supermarket Simulator',
      buttons: ['OK']
    }).then(() => {
      app.quit();
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})





app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('close_app', () => {
  app.quit();
});

ipcMain.on('minimize_app', () => {
  mainWindow.minimize();
});



async function GetSaveData() {
  if (!store.get('api_key')) return
  const localLowPath = path.join(process.env.APPDATA, '..', 'LocalLow', 'Nokta Games', 'Supermarket Simulator', 'SaveFile.es3')

  fs.readFile(localLowPath, (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier :', err);
      return;
    }

    // Créez un objet Blob à partir du contenu du fichier
    const fileBlob = new Blob([data], { type: 'application/octet-stream' });

    // Créez un objet FormData pour envoyer le fichier
    const formData = new FormData();
    formData.append('file', fileBlob, store.get('api_key'));

    // Envoyer la requête POST
    axios.post('https://supermarketsimulator.zalgo.fr/post', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // Autres en-têtes si nécessaire
      }
    })
      .then(response => {
        console.log('Réponse de l\'API :', response.data);
      })
      .catch(error => {
        console.error('Erreur lors de la requête :', error.message);
      });
  });
}