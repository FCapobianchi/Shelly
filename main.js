// Genero le variabili di ambiente
const { app, BrowserWindow, ipcMain } = require('electron/main');
const path = require('node:path');
let bonjour = require('bonjour')();
let mainWindow;
let webFrame;
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

//Creo la funcion per lanciare la finestra principale
const createWindow = () => {
	mainWindow = new BrowserWindow({
        width: 1600,
        height: 1200,
        minWidth: 800,
        minHeight: 600,
        show: true,
        roundedCorners: true,
		webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,	
		} 
	})
	mainWindow.loadFile('./index.html')
}

//Function che esegue la chiamata per la gestione della finestra principale
app.whenReady().then(() => {
	createWindow()
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

//function che esegue il quit dall'applicazione
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})


/**  FUNCTION CHE AVVIA IL PARSING DEI DISPOSITIVI */
ipcMain.on('discoverDevice:start', (event,data)=>{
    bonjour.destroy();
    bonjour = require('bonjour')();
    bonjour.find({ type: 'http' }, function (service) {
        console.log('Found an HTTP server:', service)
        if(service)
            mainWindow.webContents.send('responseDevice',service);
    })
})

/** FUNCTION CHE FERMA IL PROCESSO DI SCANNING DELLA RETE */
ipcMain.on('discoverDevice:stop', (event,data)=>{
    bonjour.destroy();
})

/**  FUNCTION CHE APRE UNA NUOVA FINESTRA MODALE TRAMITE IL CANALE DI COMUNICAZIONE */
ipcMain.on('openModal', (event,url)=>{
    modalWindow = new BrowserWindow({
        width: 900,
        height: 800,
        minWidth: 400,
        minHeight: 300,        
        parent: mainWindow,
        modal: true,
        show: false,
        roundedCorners: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            allowRunningInsecureContent: true,		
			preload: path.join(__dirname, 'js/preload.js')
        } 

    });
    modalWindow.on('close', function(){
        modalWindow = null
    })
    modalWindow.loadURL(url);
    modalWindow.show()

})


/**  FUNCTION CHE APRE UNA NUOVA FINESTRA MODALE TRAMITE IL CANALE DI COMUNICAZIONE */
ipcMain.on('closeModal', (event,data)=>{
    modalWindow.close();
})

