
window.addEventListener('DOMContentLoaded', () => {
    const {ipcRenderer} = require('electron');
	const discoverBTN = document.getElementById("discoverBTN");
	const openModal = document.getElementById("openModal");
    const containerHtml = document.getElementById("containerHtml");

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

    if(containerHtml.children.length === 0)
        loadDevices();
        
	discoverBTN.addEventListener('click', ()=>{
        loadDevices();
	});

	ipcRenderer.on('responseDevice',(e,data)=>{
        if(data.txt.app){
            var card = document.createElement('div');
            var cardbody = document.createElement('div');
            var h5 = document.createElement('h5');
            var p = document.createElement('p');
            var anchor = document.createElement('a');

            card.classList.add("card");
            card.classList.add("mb-2");
            card.classList.add("p-2");
            cardbody.classList.add("card-body");

            h5.classList.add("card-title");
            h5.appendChild(document.createTextNode(data.txt.app));

            p.classList.add("card-text");
            p.appendChild(document.createTextNode(data.txt.id));

            anchor.classList.add("btn");
            anchor.classList.add("btn-primary");
            anchor.onclick = function() { 
                    var url = data.type+'://juice:Juicenet-2023@'+data.host;
                    ipcRenderer.send('openModal',url);
            };
            anchor.appendChild(document.createTextNode("Apri"));

            cardbody.appendChild(h5);
            cardbody.appendChild(p);
            cardbody.appendChild(anchor);
            card.appendChild(cardbody);

            if (containerHtml){
                containerHtml.appendChild(card);
            }
        }
	});


});

