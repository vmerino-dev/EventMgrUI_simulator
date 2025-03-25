
setTimeout(()=>{
    if(window.parent.userMgr.users){
        const main = document.getElementsByTagName('main')[0];
        const users = window.parent.userMgr.users;

        for(let user in users){
            const userTargets = addUserTarget(users[user].username);

            // Si se clica al usuario se selecciona como favorito
            userTargets.addEventListener('click', (event)=>{

                /* Seleccionamos el usuario en los iframes del mismo tipo */
                // Obtenemos el nombre de usuario
                let usernameh2 = event.currentTarget.getElementsByTagName('h2')[0];

                event.currentTarget.classList.toggle('selected');

                /**
                 * Sincronizamos el usuario establecido en preferido al resto de ventanas
                 **/

                // Comparamos si el usuario en localStorage es el mismo que hemos modificado para asegurar el envío del evento
                let usernameh2_localst = localStorage.getItem('contact_pref');

                // Si el usuario almacenado es el que está indicado en localStorage, modificamos el localstorage a none
                if(usernameh2_localst === usernameh2.innerText){
                    localStorage.setItem('contact_pref', 'none');
                    
                }

                localStorage.setItem('contact_pref', usernameh2.innerText);

            });
            
        }
    }
}
,2000)