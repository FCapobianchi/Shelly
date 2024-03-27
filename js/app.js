const {ipcRenderer} = require('electron');
window.$ = window.jQuery = require('jquery');

window.addEventListener('DOMContentLoaded', () => {
    const containerHtml = document.getElementById("containerHtml");
    let btnTest = document.getElementById("btnTest");

    let devices = [];

    if(containerHtml){
        ipcRenderer.send('database:getDevices', {})
    }

	ipcRenderer.on('responseDB',(e,devices)=>{
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

            anchorEdit.classList.add("btn");
            anchorEdit.classList.add("btn-secondary");
            anchorEdit.classList.add("float-end");
            anchorEdit.onclick = function() { 
                ipcRenderer.send('openEdit',devId);
            };
            anchorEdit.appendChild(document.createTextNode("Edit"));
            cardbody.appendChild(anchorEdit);
            anchorEdit = null;

            card.appendChild(cardbody);
            col.appendChild(card);
            if (containerHtml){
                containerHtml.appendChild(col);
            }
        };        
        dragCol();
	});
	
	ipcRenderer.on('reloadPage',(e,data)=>{
		window.location.reload();
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
			ipcRenderer.send('database:updateDevice', {query: query, valori:[index,card.getAttribute("data-col-id")]});	
			window.location.reload();		
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
