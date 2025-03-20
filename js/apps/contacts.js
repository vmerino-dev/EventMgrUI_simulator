
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

                // Enviamos el usuario establecido como preferido
                localStorage.setItem('contact_pref', usernameh2.innerText);
            


                // Si la key del storage no es de un contacts.js o la ventana actual es un iframe
                /*if((event.key !== 'contact_pref') || (window !== window.top))
                    return -1;

                const usernameh2 = event.newValue;
                const contactIframes = window.document.querySelectorAll('iframe[src="apps/contacts.htm"]');

                // Buscamos los contactos de cada iframe si el contacto del iframe original coincide
                for(let iframe of contactIframes){
                    const all_h2_iframe = iframe.contentDocument.getElementsByTagName('h2');

                    for(let h2 of all_h2_iframe){
                        if(h2.innerText === usernameh2){
                            h2.closest('article').classList.toggle('selected');
                        }
                    }
                }*/

            });

            // Añadimos el módulo del usuario
            main.appendChild(userTargets);
            
        }
    }
}
,2000)