// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')
const path = require('node:path')
const fs = require('fs');
const axios = require('axios');
const Store = require('electron-store');
/* const { autoUpdater, AppUpdater } = require("electron-updater"); */


const store = new Store();
/* autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.forceDevUpdateConfig = true */

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1281,
    height: 824,
    title: 'Supermarket Restock',
    icon: './icon.ico',
    minHeight: 824,
    minWidth: 1281,
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
  mainWindow.loadFile('public/index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
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
          GetSaveData().then(() => {
            setTimeout(() => {
              mainWindow.reload();
            }, 1000);
          })
        }
      });
      createWindow()
      /* autoUpdater.checkForUpdates() */
    }
  } catch (error) {
    console.log(error)
    dialog.showMessageBox({
      type: 'error',
      title: 'Erreur',
      message: 'Impossible de récupérer la sauvegarde de Supermarket Simulator.',
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


/* autoUpdater.on('update-not-available', (info) => {
  dispatch('Update not available.')
})

autoUpdater.on("update-available", (info) => {
  curWindow.showMessage(`Update available. Current version ${app.getVersion()}`);
  let pth = autoUpdater.downloadUpdate();
  curWindow.showMessage(pth);
});

autoUpdater.on('download-progress', (progressObj) => {
    win.webContents.send('download-progress', progressObj.percent)
}) */





/* Function */

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