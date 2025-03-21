
// Sincronización con otras pestañas de contactos favoritos
window.addEventListener('storage', (event)=>{
    // Si el evento no es respecto a contact_pref o el nuevo valor es none
    if(event.key !== 'contact_pref' || event.newValue === 'none')
        return 0;
    
    let isMyContacts; // myContacts.htm?
    let isUserInContacts; // El usuario está en myContacts

    // Si la app es myContacts
    if(location.href.endsWith('myContacts.htm')){
        isMyContacts = true;
    }

    const usernames_H2 = document.getElementsByTagName('h2');

    // Se selecciona el usuario en los diferentes iframes
    for(let username_H2 of usernames_H2){
        if(username_H2.innerText === event.newValue){
            // Si estamos en myContacts.htm, borra el elemento article del usuario
            if(isMyContacts){
                username_H2.closest('article').remove();
                isUserInContacts = true;
            }

            username_H2.closest('article').classList.toggle('selected');
    
            
        }
    }

    if(!isUserInContacts && isMyContacts){
        let userTargets = document.createElement('article');

        let userProfile = document.createElement('img');
        userProfile.setAttribute('src', '../../assets/img/profile.svg');
        userTargets.appendChild(userProfile);

        // Añadimos el nombre de usuario y email
        const infoUser = document.createElement('p');
        const username = document.createElement('h2');
        username.innerHTML = event.newValue;

        infoUser.appendChild(username);
        infoUser.innerHTML += '\n' + 'asdfjdasñ';
        userTargets.appendChild(infoUser);

        // Añadimos el módulo del usuario
        document.getElementsByTagName('main')[0].appendChild(userTargets);
    }


})