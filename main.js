// Genero le variabili di ambiente
const { app, BrowserWindow, ipcMain } = require('electron/main');
const Store = require('electron-store')
const fs = require('fs');
const { event } = require('jquery');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();
const ct = fs.existsSync(path.join(app.getPath('userData'), 'shelly.db'))
const db = new sqlite3.Database(path.join(app.getPath('userData'), 'shelly.db'));
const http = require('http');
let bonjour = require('bonjour')();
let mainWindow;
let currentDevice;
let deviceInfo;
let message;
let store;

2
/** CHECK DELLA PRESENZA DEL DB */
if (!ct) {
    db.serialize(() => {
        db.run('CREATE TABLE "devices" ( "id" INTEGER, "position" INTEGER, "device_id" TEXT, "user" TEXT, "password" TEXT, "name" TEXT, "type" TEXT, "host" TEXT,"app" TEXT, PRIMARY KEY("id" AUTOINCREMENT) )');
    });
} 


/**  SEZIONE DI GESTIONE FUNCTION DI DEFAULT DELL'APP */
const createWindow = () => {
    store = new Store();
	mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
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
    mainWindow.setBounds(store.get('bounds'));
    mainWindow.on('close', () => {
        store.set('bounds', mainWindow.getBounds());
    });

}

app.whenReady().then(() => {
	createWindow();
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
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

ipcMain.on('openInfo', (event,device_id)=>{
    db.get("SELECT * FROM `devices` WHERE device_id = ?;",[device_id], (error, row) => {
        
        console.log(row);
        let url = new URL('http://'+row.host+'/settings');
        url.username = row.user;
        url.password = row.password;
    
        http.get(url, response => {
            let data = [];
            response.on('data', chunk => {
                data.push(chunk);
            });
            response.on('end', () => {
                const json = JSON.parse(Buffer.concat(data).toString());
                deviceInfo = json;
                mainWindow.loadFile('html/info.html');
            });
        }).on('error', error => {
            alert('Error: ', error.message);
        });
        
    });


});

ipcMain.on('closeApp', (event,data)=>{
    mainWindow.close();
	app.quit()
});



/** SEZIONE DI SCAMBIO DATI CON LE PAGINE */
ipcMain.on('getDevice', (event,{})=>{
    mainWindow.webContents.send('responseDevice',currentDevice);
});

ipcMain.on('getMessage', (event,{})=>{
    if(message!=null){
        let data = message;
        message = null;
        mainWindow.webContents.send('showMessages',data);
    }   
});

ipcMain.on('getDeviceInfo', (event,{})=>{
    mainWindow.webContents.send('deviceInfo',deviceInfo);  
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

});

ipcMain.on('database:add', (event,query)=>{

});

ipcMain.on('database:addDevice', (event,device)=>{
    db.get("SELECT MAX(id) as max FROM devices;", (error, row) => {
        let arrayValues = [row.max??1,device.txt.id,device.type,device.host,device.txt.app]
        let query = 'INSERT INTO devices VALUES(null,?,?,"","","device",?,?,?);';
        db.run(query,arrayValues,(error) => { 
            http.get('http://'+device.host+'/shelly', response => {
                let data = [];
                response.on('data', chunk => {
                    data.push(chunk);
                });
                response.on('end', () => {
                    const json = JSON.parse(Buffer.concat(data).toString());
                    db.get("SELECT * FROM `devices` WHERE device_id = ?;",[device.txt.id], (error, row) => {
                        currentDevice = row;
                        if(json.auth){
                            message = {text:"Basic Auth present, please enter user and password",type:"warning"};
                            mainWindow.loadFile('html/edit.html');
                        }
                        else {
                            mainWindow.loadFile('html/devices.html');
                        } 
                    });
                });
            }).on('error', error => {
                alert('Error: ', error.message);
            });

        });
    });
});

ipcMain.on('database:updateDevice', (event,data)=>{
    db.run(data.query,data.valori,(error) => { });
});

ipcMain.on('database:update', (event,data)=>{
    db.run(data.query,data.valori,(error) => { 
        if(data.changePage) {
            mainWindow.loadFile(data.changePage);
        }
    });
});

ipcMain.on('database:getDevices', (event, data) => {
    db.all("SELECT * FROM devices ORDER BY position ASC;", (error, rows) => {
        mainWindow.webContents.send('responseDB',rows);
    });
});

ipcMain.on('shellyApi:settings', (event, data) => {
    let url = new URL(data.url+'/settings');
    url.username = "juice";
    url.password = "Juicenet-2023";

    http.get(url, response => {
        let data = [];
        response.on('data', chunk => {
            data.push(chunk);
        });
        response.on('end', () => {
            const json = JSON.parse(Buffer.concat(data).toString());
            console.log(json);
        });
    }).on('error', error => {
        alert('Error: ', error.message);
    });
});
