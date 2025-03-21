
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
        addUserTarget(event.newValue);
    }


})

// Añade en el DOM del iframe un usuario
function addUserTarget(username){
    // Obtenemos el userMgr
    const users = window.parent.userMgr;

    // A través del usermgr, obtenemos el email mediante el objeto del usuario
    const email = users.getUser(username).email;

    let main = document.getElementsByTagName('main')[0]; // main del documento
    let userTargets = document.createElement('article'); // Creamos un target para el user

    // Añadimos la img del perfil del usuario
    let userProfile = document.createElement('img');
    userProfile.setAttribute('src', '../../assets/img/profile.svg');
    userTargets.appendChild(userProfile);

    // Añadimos el nombre de usuario y email
    const infoUser = document.createElement('p');
    const usernameElem = document.createElement('h2');
    usernameElem.innerHTML = username;

    infoUser.appendChild(usernameElem);
    infoUser.innerHTML += '\n' + email;
    userTargets.appendChild(infoUser);

    // Añadimos el módulo del usuario
    main.appendChild(userTargets);

    return userTargets; // para añadir listeners
}