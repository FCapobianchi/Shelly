const {ipcRenderer} = require('electron');
window.$ = window.jQuery = require('jquery');

window.addEventListener('DOMContentLoaded', () => {
    const containerHtml = document.getElementById("containerHtml");
    let btnTest = document.getElementById("btnTest");
    let relays = [];

    if(containerHtml){
        ipcRenderer.send('database:getRelays', {})
    }

	ipcRenderer.on('responseRelays',(e,relays,devices)=>{
		relays.sort((a, b) => (a.position > b.position) ? 1 : -1);
        for(relay of relays){
            let device = null;
            let cDevice = null;
            let cRelay = null;
        
            device = devices.find(obj => obj.device_id === relay.device_id);
            cDevice = device;
            cRelay = relay;                
            console.log(device);
            console.log(relay);
            let col = document.createElement('div');
            let card = document.createElement('div');
            let cardbody = document.createElement('div');
            let h5 = document.createElement('h5');
            let p = document.createElement('p');
            let em = document.createElement('em');
            let anchorOn = document.createElement('a');
            let anchorOff = document.createElement('a');
            let anchoStop = document.createElement('a');
            // var anchorEdit = document.createElement('a');
            // var anchorInfo = document.createElement('a');

            col.classList.add("column");
            col.setAttribute("draggable","true");

            card.classList.add("card");
            card.setAttribute("data-col-id",relay.id);
            card.setAttribute("data-col-pos",relay.id);			
            cardbody.classList.add("card-body");
    
            h5.classList.add("card-title");
            h5.appendChild(document.createTextNode(relay.name));
            cardbody.appendChild(h5);

            p.classList.add("card-text");
            p.appendChild(document.createTextNode(relay.id));
            em.appendChild(document.createTextNode(relay.default_state));
            h5.appendChild(document.createElement("hr"));
            h5.appendChild(em);
            cardbody.appendChild(p);

            if(cRelay.mode==="roller"){
                anchorOn.classList.add("btn");
                anchorOn.classList.add("btn-primary");
                anchorOn.onclick = function() { 
                    ipcRenderer.send('shellyApi:toggle',cRelay,cDevice,'open');
                };
                anchorOn.appendChild(document.createTextNode("OPEN"));  
                cardbody.appendChild(anchorOn);
                anchorOn = null;
    
                anchorOff.classList.add("btn");
                anchorOff.classList.add("btn-secondary");
                anchorOff.classList.add("float-end");
                anchorOff.classList.add("me-1");
                anchorOff.onclick = function() {               
                    ipcRenderer.send('shellyApi:toggle',cRelay,cDevice,'close');
                };
                anchorOff.appendChild(document.createTextNode("close"));
                cardbody.appendChild(anchorOff);
                anchorOff = null;

                anchoStop.classList.add("btn");
                anchoStop.classList.add("btn-info");
                anchoStop.classList.add("float-end");
                anchoStop.classList.add("me-1");
                anchoStop.onclick = function() {               
                    ipcRenderer.send('shellyApi:toggle',cRelay,cDevice,'stop');
                };
                anchoStop.appendChild(document.createTextNode("stop"));
                cardbody.appendChild(anchoStop);
                anchoStop = null;



            }
            else {
                anchorOn.classList.add("btn");
                anchorOn.classList.add("btn-primary");
                anchorOn.onclick = function() { 
                    ipcRenderer.send('shellyApi:toggle',cRelay,cDevice,'on');
                };
                anchorOn.appendChild(document.createTextNode("ON"));  
                cardbody.appendChild(anchorOn);
                anchorOn = null;
    
                anchorOff.classList.add("btn");
                anchorOff.classList.add("btn-secondary");
                anchorOff.classList.add("float-end");
                anchorOff.classList.add("me-1");
                anchorOff.onclick = function() {               
                    ipcRenderer.send('shellyApi:toggle',cRelay,cDevice,'off');
                };
                anchorOff.appendChild(document.createTextNode("OFF"));
                cardbody.appendChild(anchorOff);
                anchorOff = null;
            }



            // anchorInfo.classList.add("btn");
            // anchorInfo.classList.add("btn-info");
            // anchorInfo.classList.add("float-end");
            // anchorInfo.classList.add("me-1");
            // anchorInfo.onclick = function() { 
            //     ipcRenderer.send('openInfo',devId);
            // };
            // anchorInfo.appendChild(document.createTextNode("Info"));
            // cardbody.appendChild(anchorInfo);
            // anchorInfo = null;
            
            
            card.appendChild(cardbody);
            col.appendChild(card);
            if (containerHtml){
                containerHtml.appendChild(col);
            }
            //device = null;
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
			let query = 'UPDATE relays SET position = ? WHERE id = ?';
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
