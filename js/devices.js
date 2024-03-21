const {ipcRenderer} = require('electron');

window.addEventListener('DOMContentLoaded', () => {
	const discoverBTN = document.getElementById("discoverBTN");
    const containerHtml = document.getElementById("containerHtml");
    
    let devices = [];

    if(containerHtml){
        ipcRenderer.send('database:device', {})
    }
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
        discoverBTN.setAttribute("disabled", true)
        const timer = setTimeout(()=>{
            spinner.classList.add("d-none");
            discoverBTN.removeAttribute("disabled")
            ipcRenderer.send('discoverDevice:stop',"");
        }, 5000);
    }

	ipcRenderer.on('responseDevices',(e,data)=>{
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
            let url = data.type+'://';
            
            if(device = devices.find((element) => element.device_id === data.txt.id)){
                console.log(device);
                if(device.user) {
                    url +=device.user+':'+device.password+'@';
                }
                if(device.name) {
                    var em = document.createElement('em');
                    em.appendChild(document.createTextNode(device.name));
                    h5.appendChild(document.createElement("hr"));
                    h5.appendChild(em);
                }

                var anchorEdit = document.createElement('a');
                anchorEdit.classList.add("btn");
                anchorEdit.classList.add("btn-secondary");
                anchorEdit.classList.add("float-end");
                anchorEdit.onclick = function() { 
                        ipcRenderer.send('openEdit',data.txt.id);
                };
                anchorEdit.appendChild(document.createTextNode("Modifica"));
                cardbody.appendChild(anchorEdit);
            }
            else {               
                var anchorAdd = document.createElement('a');
                anchorAdd.classList.add("btn");
                anchorAdd.classList.add("btn-info");
                anchorAdd.classList.add("float-end");
                anchorAdd.onclick = function() { 
                        let query = 'INSERT  INTO devices VALUES(null,"'+data.txt.id+'","","","device","'+data.type+'","'+data.host+'","'+data.txt.app+'");';
                        ipcRenderer.send('database:add', query);
                        ipcRenderer.send('changePage','html/devices.html');
                };
                anchorAdd.appendChild(document.createTextNode("Aggiungi"));
                cardbody.appendChild(anchorAdd);                    
            }

            url += data.host;            
            anchorOpen.classList.add("btn");
            anchorOpen.classList.add("btn-primary");
            console.log(url)
            anchorOpen.onclick = function() { 
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

    if(discoverBTN)    
        discoverBTN.addEventListener('click', ()=>{
            loadDevices();
        });

});