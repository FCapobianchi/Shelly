const {ipcRenderer} = require('electron');
window.$ = window.jQuery = require('jquery');
// Shorthand for $( document ).ready()
$(function() {
    console.log( "ready!" );
});

window.addEventListener('DOMContentLoaded', () => {
    const containerHtml = document.getElementById("containerHtml");

    let devices = [];

    if(containerHtml){
        ipcRenderer.send('database:device', {})
    }
	ipcRenderer.on('responseDB',(e,devices)=>{
		devices.sort((a, b) => (a.position > b.position) ? 1 : -1);
        for(device of devices){
			console.log(device);
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
            col.setAttribute("data-col-id",device.id);
            col.setAttribute("data-col-pos",device.id);
            

            card.classList.add("card");
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
            anchorOpen.appendChild(document.createTextNode("Apri"));  
            cardbody.appendChild(anchorOpen);

            let devId = device.device_id;

            anchorEdit.classList.add("btn");
            anchorEdit.classList.add("btn-secondary");
            anchorEdit.classList.add("float-end");
            anchorEdit.onclick = function() { 
                console.log(device.device_id);
                console.log(devId);
                
                ipcRenderer.send('openEdit',devId);
            };
            anchorEdit.appendChild(document.createTextNode("Modifica"));
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

		if (e.stopPropagation) {
			e.stopPropagation(); // stops the browser from redirecting.
		}

		// Don't do anything if we're dropping on the same column we're dragging.
        
		if (dragSrcEl_ != this) {
			var id1 = dragSrcEl_.getAttribute("data-col-id");
			var pos1 = dragSrcEl_.getAttribute("data-col-pos");
			var id2 = this.getAttribute("data-col-id");
			var pos2 = this.getAttribute("data-col-pos");

			dragSrcEl_.innerHTML = this.innerHTML;
			this.innerHTML = e.dataTransfer.getData('text/html');

			let query = 'UPDATE devices SET position = ? WHERE id = ?';
			ipcRenderer.send('database:update', {query: query, valori:[pos2,id1],reload:false});

			let query2 = 'UPDATE devices SET position = ? WHERE id = ?';
			ipcRenderer.send('database:update', {query: query2, valori:[pos1,id2],reload:true});
			window.location.reload();
		}
        
		return false;
	};

	this.handleDragEnd = function(e) {
		// this/e.target is the source node.

		[].forEach.call(cols_, function(col) {
			col.classList.remove('over');
			col.classList.remove('moving');
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
