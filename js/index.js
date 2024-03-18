
window.addEventListener('DOMContentLoaded', () => {
    const {ipcRenderer} = require('electron');
	const discoverBTN = document.getElementById("discoverBTN");
	const openModal = document.getElementById("openModal");

	discoverBTN.addEventListener('click', ()=>{
        const element = document.getElementById("containerHtml");
        if (element) element.innerHTML = "";
		ipcRenderer.send('discoverDevice:start',"");
        const spinner = document.getElementById("spinner");
        spinner.classList.remove("d-none");
        const timer = setTimeout(()=>{
            spinner.classList.add("d-none");
            ipcRenderer.send('discoverDevice:stop',"");
        }, 5000);
	});

	// ipcRenderer.on('responseDevice',(e,data)=>{
	// 	console.log(JSON.stringify(data));
    //     if(data.txt.app){
    //         var li = document.createElement('li');
    //         var anchor = document.createElement('a');
    //         var linkText = document.createTextNode(data.txt.id+' '+data.txt.app);
    //         anchor.appendChild(linkText);
    //         anchor.title = linkText;
    //         anchor.onclick = function() { /*ipcRenderer.send('loadContent',data.type+'://juice:Juicenet-2023@'+data.host)*/
    //             var url = data.type+'://juice:Juicenet-2023@'+data.host;
    //             ipcRenderer.send('openModal',url);
    //         };
    //         li.appendChild(anchor);
    //         const element = document.getElementById("containerBtn");
    //         if (element){
    //             element.appendChild(li);
    //         }
    //     }

	// });


	ipcRenderer.on('responseDevice',(e,data)=>{
		console.log(JSON.stringify(data));
        if(data.txt.app){
            // var html =  '<div class="card">'+
            //                 '<div class="card-body">'+
            //                     '<h5 class="card-title">'+data.txt.app+'</h5>'+
            //                     '<p class="card-text">'+data.txt.id+'</p>'+
            //                     '<a href="#" onclick="myFunction()" class="btn btn-primary">Apri</a>'+
            //                 '</div>'
            //             '</div>';
            // console.log(html);

            var card = document.createElement('div');
            var cardbody = document.createElement('div');
            var h5 = document.createElement('h5');
            var p = document.createElement('p');
            var anchor = document.createElement('a');

            card.classList.add("card");
            //card.classList.add("w-50");
            //card.classList.add("border-secondary");
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
            const element = document.getElementById("containerHtml");
            if (element){
                element.appendChild(card);
            }
        }


	});

    const myFunction = (event,data)=>{
            //ipcRenderer.send("openModal",'+data.type+'://juice:Juicenet-2023@'+data.host+');
            alert("");
    }
});

