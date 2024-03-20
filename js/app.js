
window.addEventListener('DOMContentLoaded', () => {
    const {ipcRenderer} = require('electron');
	const discoverBTN = document.getElementById("discoverBTN");
	const changePageBTN = document.getElementsByClassName("changePageBTN");
    const containerHtml = document.getElementById("containerHtml");
    const editForm = document.getElementById("editForm");
    let devices = [];

    //const rows = await ipcRenderer.invoke('db-query', "SELECT * FROM Users");

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
        const timer = setTimeout(()=>{
            spinner.classList.add("d-none");
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
                        let query = 'INSERT  INTO devices VALUES(null,"'+data.txt.id+'","","","new device");';
                        ipcRenderer.send('database:add', query);
                        ipcRenderer.send('changePage','html/index.html');
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

    if(changePageBTN.length)
    for (var i=0; i < changePageBTN.length; i++) {
        changePageBTN[i].onclick = function(){
            ipcRenderer.send('changePage',changePageBTN[i].attributes.href);
        }
    };

    if(editForm) {
        ipcRenderer.send('getDevice',{});
        let submitForm = document.getElementById("submitForm");
        submitForm.addEventListener('click', (event)=>{
            event.preventDefault();
            event.stopPropagation();
            let valori = [];
            let query = 'UPDATE devices SET ';
            for(element of editForm.elements){
                if(element && element.type !== "submit" && element.name !== "id"){
                    query += element.name +'= ?, ';
                    valori.push(element.value);
                }
            };
            query = query.slice(0, -2)+' WHERE id = '+editForm.elements[0].value+';';
            console.log(query);
            ipcRenderer.send('database:update', {query: query, valori:valori});
            ipcRenderer.send('changePage','html/index.html');
            return false;
                                   
        });
    }
    ipcRenderer.on('responseDevice',(e,device)=>{ 
        // console.log(device);
        // console.log(editForm.elements);
        for(element of editForm.elements){
            console.log(element.name);
            console.log(element.type);
            if(element && element.type !== "submit")
                element.value = Object.getOwnPropertyDescriptor(device, element.name).value??null;
        };
        
    });




});