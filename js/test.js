const {ipcRenderer} = require('electron');
window.$ = window.jQuery = require('jquery');

window.addEventListener('DOMContentLoaded', () => {
    const containerHtml = document.getElementById("containerHtml");
    $(".testSettings").each(function(event){


        console.log($(this).attr("href"));
        $(this).on('click',function(event){
            event.preventDefault();
            event.stopPropagation();    
            console.log("Click");        
        });

    });

});

