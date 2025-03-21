
setTimeout(()=>{
    if(window.parent.userMgr.users){
        const main = document.getElementsByTagName('main')[0];
        users = window.parent.userMgr.users;

        for(let user in users){
            let userTargets;

            // Creamos un article para un usuario
            userTargets = document.createElement('article');

            // Añadimos el icono de usuario (en este simulador la foto de perfil no se puede modificar)
            let userProfile = document.createElement('img');
            userProfile.setAttribute('src', '../../assets/img/profile.svg');
            userTargets.appendChild(userProfile);

            // Añadimos el nombre de usuario y email
            const infoUser = document.createElement('p');
            const username = document.createElement('h2');
            username.innerHTML = users[user].username;

            infoUser.appendChild(username);
            infoUser.innerHTML += '\n' + users[user].email;
            userTargets.appendChild(infoUser);

            // Si se clica al usuario se selecciona como favorito
            userTargets.addEventListener('click', (event)=>{
                localStorage.setItem('same_window', window.top) // Referencia a ventana superior para no modificar de nuevo los article

                /* Seleccionamos el usuario en los iframes del mismo tipo */
                // Obtenemos el nombre de usuario
                let usernameh2 = event.currentTarget.getElementsByTagName('h2')[0];

                // Enviamos mensaje a todos los demás iframes del mismo tipo con el usuario seleccionado
                const contactIframes = window.parent.document.querySelectorAll('iframe[src="apps/contacts.htm"]');
                
                // Buscamos los contactos de cada iframe si el contacto del iframe original coincide
                for(let iframe of contactIframes){
                    const all_h2_iframe = iframe.contentDocument.getElementsByTagName('h2');

                    for(let h2 of all_h2_iframe){
                        if(h2.innerHTML === usernameh2.innerHTML){
                            h2.closest('article').classList.toggle('selected');
                        }
                    }
                }

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

            // Añadimos el módulo del usuario
            main.appendChild(userTargets);
            
        }
    }
}
,2000)


// Sincronización con otras pestañas de contactos favoritos
window.addEventListener('storage', (event)=>{
    let same_window = localStorage.getItem('same_window');

    console.log(same_window === window.top)

    /* Si el evento no es respecto a contact_pref, el nuevo valor es none o same_window
    es igual a la ventana superior (la ventana superior es común a los iframes en una misma
    pestaña)
    */
    if(event.key !== 'contact_pref' || event.newValue === 'none' || same_window === window.top)
        return 0;

    console.log('STORAGE')
    const usernames_H2 = document.getElementsByTagName('h2');

    for(let username_H2 of usernames_H2){
        if(username_H2.innerText === event.newValue){
            username_H2.closest('article').classList.toggle('selected');
        }
    }

})