
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

            // Añadimos el nombre de usuario
            const username = document.createElement('p');
            username.innerHTML = users[user].username;
            userTargets.appendChild(username);

            // Añadimos el módulo del usuario
            main.appendChild(userTargets);
            
        }
    }
}
,2000)