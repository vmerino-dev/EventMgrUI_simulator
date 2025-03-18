
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
                event.currentTarget.classList.toggle('selected');

                /* Seleccionamos el usuario en los iframes del mismo tipo */
                // Obtenemos el nombre de usuario
                let usernameh2 = event.currentTarget.getElementsByTagName('h2')[0];

                // Enviamos mensaje a todos los demás iframes del mismo tipo con el usuario seleccionado
                const contactIframes = window.parent.document.querySelectorAll('iframe[src="apps/contacts.htm"]');

                console.log(contactIframes);

                for(let iframe of contactIframes){
                    const h2_iframe = iframe.contentDocument.getElementsByTagName('h2')[0];

                    if(h2_iframe.innerHTML === usernameh2.innerHTML){
                        h2_iframe.closest('article').classList.toggle('selected');
                        break;
                    }
                }

            });

            // Añadimos el módulo del usuario
            main.appendChild(userTargets);
            
        }
    }
}
,2000)