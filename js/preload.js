const {ipcRenderer} = require('electron');

window.addEventListener('DOMContentLoaded', () => { 
    const btn = document.createElement("BUTTON");
    btn.innerHTML = "X";
    btn.style.position = "absolute";
    btn.style.bottom = "5px";
    btn.style.right = "5px";
    btn.style.width = "50px";
    btn.style.height = "50px";
    btn.style.lineHeight = "25px";
    btn.style.opacity = 0.75;
    btn.style.borderRadius = "25px";
    btn.onclick = function() { 
        ipcRenderer.send('closeModal',{});
    };
    
    document.body.appendChild(btn);
});

window.addEventListener("dblclick", (event) => {
    ipcRenderer.send('closeModal',{});
});

// const {contextBridge} = require('electron')

// contextBridge.exposeInMainWorld('var', {
//     dbDevices: () => ipcRenderer.once('database:device'),
// })