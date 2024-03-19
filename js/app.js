
window.addEventListener('DOMContentLoaded', () => {
    const {ipcRenderer} = require('electron');
	const discoverBTN = document.getElementById("discoverBTN");
	const changePageBTN = document.getElementsByClassName("changePageBTN");
    const containerHtml = document.getElementById("containerHtml");
    let devices;

    ipcRenderer.send('database:device', {})
	ipcRenderer.on('responseDB',(e,data)=>{
        devices = data;
        if(containerHtml.children.length === 0) loadDevices();        
	});

    const loadDevices = (event,data)=>{
        const element = document.getElementById("containerHtml");
        if (element) element.innerHTML = "";
		ipcRenderer.send('discoverDevice:start',"");
        const spinner = document.getElementById("spinner");
        spinner.classList.remove("d-none");
        const timer = setTimeout(()=>{
            spinner.classList.add("d-none");
            ipcRenderer.send('discoverDevice:stop',"");
        }, 5000);
    }

	discoverBTN.addEventListener('click', ()=>{
        loadDevices();
	});

	ipcRenderer.on('responseDevice',(e,data)=>{
        if(data.txt.app){
            var col = document.createElement('div');
            var card = document.createElement('div');
            var cardbody = document.createElement('div');
            var h5 = document.createElement('h5');
            var p = document.createElement('p');
            var anchorOpen = document.createElement('a');

            card.classList.add("card");
            cardbody.classList.add("card-body");

            h5.classList.add("card-title");
            h5.appendChild(document.createTextNode(data.txt.app));

            p.classList.add("card-text");
            p.appendChild(document.createTextNode(data.txt.id));



            cardbody.appendChild(h5);
            cardbody.appendChild(p);
            let device;
            let url;

            if( device = devices.find((element) => element.device_id === data.txt.id)){
                console.log(device);
                if(device.user) {
                    url = data.type+'://';
                    url +=device.user+':'+device.password+'@';
                    url += data.host;
                }
                var anchorEdit = document.createElement('a');
                anchorEdit.classList.add("btn");
                anchorEdit.classList.add("btn-secondary");
                anchorEdit.classList.add("float-end");
                anchorEdit.onclick = function() { 
                        // var url = data.type+'://juice:Juicenet-2023@'+data.host;
                        // ipcRenderer.send('openModal',url);
                        alert(data.txt.id);
                };
                anchorEdit.appendChild(document.createTextNode("Modifica"));
                cardbody.appendChild(anchorEdit);
            }
            else {
                url = data.type+'://'+data.host;                
                var anchorAdd = document.createElement('a');
                anchorAdd.classList.add("btn");
                anchorAdd.classList.add("btn-info");
                anchorAdd.classList.add("float-end");
                anchorAdd.onclick = function() { 
                        // var url = data.type+'://juice:Juicenet-2023@'+data.host;
                        // ipcRenderer.send('openModal',url);
                        alert(data.txt.id);
                };
                anchorAdd.appendChild(document.createTextNode("Aggiungi"));
                cardbody.appendChild(anchorAdd);                    
            }
            
            anchorOpen.classList.add("btn");
            anchorOpen.classList.add("btn-primary");
            anchorOpen.onclick = function() { 
                    console.log(url);
                    ipcRenderer.send('openModal',url);
            };
            anchorOpen.appendChild(document.createTextNode("Apri"));             
            cardbody.appendChild(anchorOpen);
            card.appendChild(cardbody);
            col.appendChild(card);
            if (containerHtml){
                containerHtml.appendChild(col);
            }
        }
	});

    for (var i=0; i < changePageBTN.length; i++) {
        changePageBTN[i].onclick = function(){
            ipcRenderer.send('changePage',changePageBTN[i].attributes.href);
        }
    };

});

