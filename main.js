// Genero le variabili di ambiente
const { app, BrowserWindow, ipcMain } = require('electron/main');
const fs = require('fs');
const { event } = require('jquery');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();
const ct = fs.existsSync(path.join(app.getPath('userData'), 'shelly.db'))
const db = new sqlite3.Database(path.join(app.getPath('userData'), 'shelly.db'));
let bonjour = require('bonjour')();
let mainWindow;
let currentDevice;

if (!ct) {
    db.serialize(() => {
        db.run('CREATE TABLE "devices" ( "id" INTEGER, "device_id" TEXT, "user" TEXT, "password" TEXT, "name" TEXT, "type" TEXT, "host" TEXT,"app" TEXT, PRIMARY KEY("id" AUTOINCREMENT) )');
    });
} 

/**  SEZIONE DI GESTIONE FUNCTION DI DEFAULT DELL'APP */
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
	mainWindow.loadFile('./html/app.html');
}

app.whenReady().then(() => {
	createWindow();
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	})
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

/**  SEZIONE DI GESTIONE DELLE FINESTRE */
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

});

ipcMain.on('closeModal', (event,data)=>{
    modalWindow.close();
});

ipcMain.on('changePage', (event,data)=>{
    mainWindow.loadFile(data);
});

ipcMain.on('openEdit', (event,device_id)=>{
    console.log(device_id);
    db.get("SELECT * FROM `devices` WHERE device_id = ?;",[device_id], (error, row) => {
        currentDevice = row;
        mainWindow.loadFile('html/edit.html');
    });
});

ipcMain.on('closeApp', (event,data)=>{
    mainWindow.close();
	app.quit()
});

ipcMain.on('getDevice', (event,{})=>{
    mainWindow.webContents.send('responseDevice',currentDevice);
});


/** DISCOVERY SECTION VIA BONJOUR */
ipcMain.on('discoverDevice:start', (event,data)=>{
    bonjour.destroy();
    bonjour = require('bonjour')();
    bonjour.find({ type: 'http' }, function (service) {
        if(service)
            mainWindow.webContents.send('responseDevices',service);
    });
});

ipcMain.on('discoverDevice:stop', (event,data)=>{
    bonjour.destroy();
});


/** DATABASE SECTION  */
ipcMain.on('database:get', (event,data)=>{
    // var record = db.get("SELECT * FROM `devices` WHERE id = 1;");
    // console.log(record);
});

ipcMain.on('database:add', (event,query)=>{
    var record = db.run(query);
});

ipcMain.on('database:update', (event,data)=>{
    db.run(data.query,data.valori,(error) => { });
});

ipcMain.on('database:device', (event, data) => {
    db.all("SELECT * FROM devices", (error, rows) => {
        mainWindow.webContents.send('responseDB',rows);
    });
});
