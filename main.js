const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')

const createWindow = () => {
	const win = new BrowserWindow({
        width: 600,
        height: 900,
        minWidth: 375,
        minHeight: 768,
        show: true,
        roundedCorners: true,
		webPreferences: {
			preload: path.join(__dirname, 'js/preload.js')
		} 
	})
	win.loadFile('./index.html')
}

app.whenReady().then(() => {
	createWindow()
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

/** FUNCTION CHIAMATA DI TEST */
ipcMain.handle('ping', (event,data)=>{ return 'pong'; })
