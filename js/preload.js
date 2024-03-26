const {ipcRenderer} = require('electron');
const {contextBridge} = require('electron');

window.addEventListener('DOMContentLoaded', () => { 
	const changePageBTN = document.getElementsByClassName("changePageBTN");
    const closeBTN = document.getElementById("closeBTN");

    if(changePageBTN.length)
        for (var i=0; i < changePageBTN.length; i++) {
            if(changePageBTN[i])
                changePageBTN[i].onclick = function(){
                    ipcRenderer.send('changePage',changePageBTN[i].attributes.href);
                }
        };

    if(closeBTN)
        closeBTN.addEventListener('click',(event)=>{
            event.preventDefault();
            event.stopPropagation();
            ipcRenderer.send('closeApp',{});
        });
       
});

