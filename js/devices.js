const {ipcRenderer} = require('electron');
window.$ = window.jQuery = require('jquery');

window.addEventListener('DOMContentLoaded', () => {
	const discoverBTN = document.getElementById("discoverBTN");
    const containerHtml = document.getElementById("containerHtml");
    const containerNewHtml = document.getElementById("containerNewHtml");
    
    let devices;

    if(containerNewHtml){
        ipcRenderer.send('database:getDevices', {})
    }

	ipcRenderer.on('responseDB',(e,data)=>{
        devices = (data !== undefined)?data:new Array();
		devices.sort((a, b) => (a.position > b.position) ? 1 : -1);
        for(device of devices){
            var col = document.createElement('div');
            var card = document.createElement('div');
            var cardbody = document.createElement('div');
            var h5 = document.createElement('h5');
            var p = document.createElement('p');
            var em = document.createElement('em');
            var anchorOpen = document.createElement('a');
            var anchorEdit = document.createElement('a');
            var anchorInfo = document.createElement('a');
            var anchorDelete = document.createElement('a');

            col.classList.add("column");
            col.setAttribute("draggable","true");

            card.classList.add("card");
            card.setAttribute("data-col-id",device.id);
            card.setAttribute("data-col-pos",device.id);			
            cardbody.classList.add("card-body");
    
            h5.classList.add("card-title");
            h5.appendChild(document.createTextNode(device.name));
            cardbody.appendChild(h5);

            p.classList.add("card-text");
            p.appendChild(document.createTextNode(device.device_id));
            em.appendChild(document.createTextNode(device.app));
            h5.appendChild(document.createElement("hr"));
            h5.appendChild(em);
            cardbody.appendChild(p);

            let url = device.type+'://';
            if(device.user) {
                url +=device.user+':'+device.password+'@';
            }
            url += device.host;            
            anchorOpen.classList.add("btn");
            anchorOpen.classList.add("btn-primary");
            anchorOpen.onclick = function() { 
                ipcRenderer.send('openModal',url);
            };
            anchorOpen.appendChild(document.createTextNode("Open view"));  
            cardbody.appendChild(anchorOpen);

            let devId = device.device_id;
            
            anchorInfo.classList.add("btn");
            anchorInfo.classList.add("btn-info");
            anchorInfo.classList.add("float-end");
            anchorInfo.classList.add("me-1");
            anchorInfo.onclick = function() { 
                ipcRenderer.send('openInfo',devId);
            };
            anchorInfo.appendChild(document.createTextNode("Info"));
            cardbody.appendChild(anchorInfo);
            anchorInfo = null;

            anchorEdit.classList.add("btn");
            anchorEdit.classList.add("btn-secondary");
            anchorEdit.classList.add("float-end");
            anchorEdit.classList.add("me-1");
            anchorEdit.onclick = function() { 
                ipcRenderer.send('openEdit',devId);
            };
            anchorEdit.appendChild(document.createTextNode("Edit"));
            cardbody.appendChild(anchorEdit);
            anchorEdit = null;

            anchorDelete.classList.add("btn");
            anchorDelete.classList.add("btn-danger");
            anchorDelete.classList.add("float-end");
            anchorDelete.classList.add("me-1");
            anchorDelete.onclick = function() { 
                ipcRenderer.send('database:deleteDevice',{devId:devId});
            };
            anchorDelete.appendChild(document.createTextNode("Delete"));
            cardbody.appendChild(anchorDelete);
            anchorDelete = null;

            card.appendChild(cardbody);
            col.appendChild(card);
            if (containerHtml){
                containerHtml.appendChild(col);
            }
        };        
        dragCol();
        if(containerHtml.children.length === 0) findDevices();
	});
	
	ipcRenderer.on('reloadPage',(e,data)=>{
		window.location.reload();
	});

    const findDevices = (event,data)=>{
        containerNewHtml.innerHTML = "";
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
        let device = devices.find(obj => obj.device_id === data.txt.id);
        console.log(device);
        console.log(data.txt.id);
        
        if(device === undefined && data.txt.id !== undefined){
            var col = document.createElement('div');
            var card = document.createElement('div');
            var cardbody = document.createElement('div');
            var h5 = document.createElement('h5');
            var p = document.createElement('p');
            
            card.classList.add("card");
            cardbody.classList.add("card-body");

            h5.classList.add("card-title");
            h5.appendChild(document.createTextNode(data.txt.app));

            p.classList.add("card-text");
            p.appendChild(document.createTextNode(data.txt.id));

            cardbody.appendChild(h5);
            cardbody.appendChild(p);

            var anchorAdd = document.createElement('a');
            anchorAdd.classList.add("btn");
            anchorAdd.classList.add("btn-info");
            anchorAdd.classList.add("float-end");
            anchorAdd.onclick = function() { 
                let valori = data;
                ipcRenderer.send('database:addDevice', valori);                    
            };
            anchorAdd.appendChild(document.createTextNode("Add"));
            cardbody.appendChild(anchorAdd);                    
            anchorAdd = null;

            var anchorOpen = document.createElement('a');                
            anchorOpen.classList.add("btn");
            anchorOpen.classList.add("btn-primary");
            let url = data.type+'://'+data.host;
            anchorOpen.onclick = function() { 
                ipcRenderer.send('openModal',url);
            };
            anchorOpen.appendChild(document.createTextNode("Open view"));    
            cardbody.appendChild(anchorOpen);
            anchorOpen = null;
            
            card.appendChild(cardbody);
            col.appendChild(card);
            if (containerNewHtml){
                containerNewHtml.appendChild(col);
            }
        }
	});

    if(discoverBTN)    
    discoverBTN.addEventListener('click', ()=>{
        findDevices();
    });

});


// Full example
let dragCol = (function() {
	var id_ = 'containerHtml';
	var cols_ = document.querySelectorAll('#' + id_ + ' .column');
	var dragSrcEl_ = null;

	$("#containerHtml div.column").each(function(i){ });

	this.handleDragStart = function(e) {
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/html', this.innerHTML);

		dragSrcEl_ = this;

		// this/e.target is the source node.
		this.classList.add('moving');
	};

	this.handleDragOver = function(e) {
		if (e.preventDefault) {
			e.preventDefault(); // Allows us to drop.
		}

		e.dataTransfer.dropEffect = 'move';

		return false;
	};

	this.handleDragEnter = function(e) {
		this.classList.add('over');
	};

	this.handleDragLeave = function(e) {
		// this/e.target is previous target element.
		this.classList.remove('over');
	};

	this.handleDrop = function(e) {
		// this/e.target is current target element.
		// Don't do anything if we're dropping on the same column we're dragging.
        
		if (dragSrcEl_ != this) {
			dragSrcEl_.innerHTML = this.innerHTML;
			this.innerHTML = e.dataTransfer.getData('text/html');
		}

	};

	this.handleDragEnd = function(e) {
		// this/e.target is the source node.

		[].forEach.call(cols_, function(col,index) {
			col.classList.remove('over');
			col.classList.remove('moving');
			let card = col.querySelector('.card');
			let query = 'UPDATE devices SET position = ? WHERE id = ?';
			ipcRenderer.send('database:update', {query: query, valori:[index,card.getAttribute("data-col-id")]});	
			//window.location.reload();		
		});
	};

	[].forEach.call(cols_, function(col) {
		col.setAttribute('draggable', 'true'); // Enable columns to be draggable.
		col.addEventListener('dragstart', this.handleDragStart, false);
		col.addEventListener('dragenter', this.handleDragEnter, false);
		col.addEventListener('dragover', this.handleDragOver, false);
		col.addEventListener('dragleave', this.handleDragLeave, false);
		col.addEventListener('drop', this.handleDrop, false);
		col.addEventListener('dragend', this.handleDragEnd, false);
	});
});