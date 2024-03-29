const {ipcRenderer} = require('electron');

window.addEventListener('DOMContentLoaded', () => { 
	const changePageBTN = document.getElementsByClassName("changePageBTN");
    const closeBTN = document.getElementById("closeBTN");
    const btnTest = document.getElementById("btnTest");

    if(changePageBTN.length)
        for (var i=0; i < changePageBTN.length; i++) {
            console.log(changePageBTN[i]);
            if(changePageBTN[i].attributes)
                changePageBTN[i].onclick = function(){
                    ipcRenderer.send('changePage',changePageBTN[i].attributes.href);
                }
        };

    if(closeBTN)
        closeBTN.addEventListener('click',(event)=>{
            event.preventDefault();
            event.stopPropagation();
            ipcRenderer.send('closeApp',{});
        });
        
    if(btnTest)
    btnTest.addEventListener('click',(event)=>{
            event.preventDefault();
            event.stopPropagation();
            ipcRenderer.send('changePage','html/test.html');
        });

    ipcRenderer.send('getMessage',{});
    ipcRenderer.on('showMessages',(e,data)=>{
        let messageDiv = document.getElementById("messageDiv");
        let messageText = document.getElementById("messageText");
        messageText.innerText = data.text;
        messageDiv.classList.add('alert-'+data.type);
        messageDiv.classList.remove('d-none');
    });

    $(".close").on("click", function(){
        $(this).closest(".alert").alert('close');
    });

});

