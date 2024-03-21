// Genero le variabili di ambiente
const { app, BrowserWindow, ipcMain } = require('electron/main');
const fs = require('fs');
const { event } = require('jquery');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();
const ct = fs.existsSync(path.join(app.getPath('userData'), 'shelly.db'))
console.log(ct);
const db = new sqlite3.Database(path.join(app.getPath('userData'), 'shelly.db'));
let bonjour = require('bonjour')();
let mainWindow;
let currentDevice;
console.log(app.getPath('appData'));
console.log(app.getPath('userData'));
console.log(path.join(app.getPath('userData'), 'shelly.db'));


if (!ct) {
    db.serialize(() => {
        db.run('CREATE TABLE "devices" ( "id" INTEGER, "device_id" TEXT, "user" TEXT, "password" TEXT, "name" TEXT, "type" TEXT, "host" TEXT,"app" TEXT, PRIMARY KEY("id" AUTOINCREMENT) )');
    });
} 

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
            preload: path.join(__dirname, 'js/preload.js')

		} 
	})
	mainWindow.loadFile('./html/app.html')
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
			preload: path.join(__dirname, 'js/modal.js')
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

ipcMain.on('changePage', (event,data)=>{
    mainWindow.loadFile(data);
})

ipcMain.on('closeApp', (event,data)=>{
    console.log("closeApp");
    mainWindow.close();
	app.quit()
});


/**  FUNCTION CHE APRE UNA NUOVA FINESTRA MODALE TRAMITE IL CANALE DI COMUNICAZIONE */
ipcMain.on('openEdit', (event,device_id)=>{
    console.log(device_id);
    db.get("SELECT * FROM `devices` WHERE device_id = ?;",[device_id], (error, row) => {
        currentDevice = row;
        mainWindow.loadFile('html/edit.html');
    });
})


ipcMain.on('getDevice', (event,{})=>{
    mainWindow.webContents.send('responseDevice',currentDevice);
})


/**  FUNCTION CHE AVVIA IL PARSING DEI DISPOSITIVI */
ipcMain.on('discoverDevice:start', (event,data)=>{
    bonjour.destroy();
    bonjour = require('bonjour')();
    bonjour.find({ type: 'http' }, function (service) {
        //console.log('Found an HTTP server:', service)
        if(service)
            mainWindow.webContents.send('responseDevices',service);
    })
})


/** FUNCTION CHE FERMA IL PROCESSO DI SCANNING DELLA RETE */
ipcMain.on('discoverDevice:stop', (event,data)=>{
    bonjour.destroy();
})


ipcMain.on('database:get', (event,data)=>{
    // var record = db.get("SELECT * FROM `devices` WHERE id = 1;");
    // console.log(record);
})


ipcMain.on('database:add', (event,query)=>{
    var record = db.run(query);
    console.log(record)
})


ipcMain.on('database:update', (event,data)=>{
    console.log(data)
    db.run(data.query,data.valori,(error) => {
        console.log(error);
    });
})


ipcMain.on('database:device', (event, data) => {
    db.all("SELECT * FROM devices", (error, rows) => {
        mainWindow.webContents.send('responseDB',rows);
    });
})


ipcMain.handle('db-query', async (event, sqlQuery) => {
    return new Promise(res => {
        db.all(sqlQuery, (err, rows) => {
          res(rows);
        });
    });
});