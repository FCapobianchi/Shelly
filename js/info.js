const {ipcRenderer} = require('electron');
window.$ = window.jQuery = require('jquery');

window.addEventListener('DOMContentLoaded', () => {
    const containerHtml = document.getElementById("containerHtml");
    ipcRenderer.send("getDeviceInfo",{});
	ipcRenderer.on('deviceInfo',(e,device)=>{
        console.log(device);
        containerHtml.innerText = JSON.stringify(device, undefined, 2);
	});    
});

