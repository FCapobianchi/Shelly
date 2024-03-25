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
		
		$("#containerHtml").dragsort({
			dragEnd: saveOrder
		});
			
	});

});


function saveOrder() {
	// var data = $("#containerHtml div").map(function() { return $(this).children().html(); }).get();
	// console.log(data);
	$("#containerHtml div.column").each(function(i,e){
		console.log(i);
		console.log(2);
		console.log($(this).attr('data-col-id') +" - "+ $(this).attr('data-col-pos'));
	});
};