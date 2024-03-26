const {ipcRenderer} = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById("editForm");
    
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
            ipcRenderer.send('database:update', {query: query, valori:valori, changePage:"html/app.html"});
            return false;
                                   
        });
    }
    ipcRenderer.on('responseDevice',(e,device)=>{ 
        for(element of editForm.elements){
            if(element && element.type !== "submit")
                element.value = Object.getOwnPropertyDescriptor(device, element.name).value??null;
        };
        
    });




});