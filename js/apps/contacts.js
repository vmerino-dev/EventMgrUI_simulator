
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

                // Obtenemos el nombre de usuario
                let usernameh2 = event.currentTarget.getElementsByTagName('h2')[0];

                // Enviamos mensaje a todos los demás iframes del mismo tipo con el usuario seleccionado
                const contactIframes = document.querySelectorAll('iframe[src="apps/contacts.htm"]');
                contactIframes.forEach(iframe => iframe.contentWindow.postMessage(`${usernameh2}`, '*'));
            });

            

            // Añadimos el módulo del usuario
            main.appendChild(userTargets);
            
        }

        // Si recibimos mensaje de selección de usuario
        window.addEventListener('message', (event)=>{
            let h2Elems_users = main.getElementsByTagName('h2');

            for(let h2 of h2Elems_users){
                if(h2.innerHTML === event.data){
                    event.currentTarget.classList.toggle('selected');
                }
            }
        })
    }
}
,2000)