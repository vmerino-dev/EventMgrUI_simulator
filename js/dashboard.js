"using strict";

// Nos aseguraremos que ocultamos la barra de desplazamiento hasta que se cargue la página
document.body.style.overflow = "hidden";

import logs from "./log.js";
import { UserMgr, User } from "./classes/usrmsg.js";
//import { DASHBOARD_ELEMS } from "./utils.js";
import { IDBUsersEvents, ldDB_ValidInputs, idbUsrEvnt, userMgr, eventMgr, userMgrSerial, IDBDashboard } from "./idb.js";

// Obtenemos el id del usuario actual
let usrSessionId = localStorage.getItem("userSession");
let lastMenuElement; // Referencia al ultimo menu mostrado/ocultado

// DEBUGGING: const header = document.createElement("h1");

dbAccess();

async function dbAccess(){
    try {
        // Esperamos al acceso a la DB
        await ldDB_ValidInputs();

        // Si no hay excepciones, inicializan las propiedades de window para userMgr y eventMgr (para acceso desde iframes)
        window.userMgr = userMgr;
        window.eventMgr = eventMgr;

        /* DEBUGGING
        let userObj = userMgr.getUserId(usrSessionId) //userMgr.getUser("victor4"); 
        header.innerHTML = `username: ${userObj.username}; email: ${userObj.email}; passwd: ${userObj.passwd}, msgTH: ${userObj.msgThreads.length}`;
        document.body.appendChild(header);

        window.userObj2 = userObj;
        */

        // Código comprobación dashboard usuario mediante clase de IDB dashboard
        const idbDashboard = new IDBDashboard(1, usrSessionId);
        const statusProm_dashb = await idbDashboard.init(); // Obtenemos el estado del dashboard del usuario

        // Estado del dashboard del usuario loggeado
        let dashb_state = statusProm_dashb.state;

        // Renderizamos el dashboard pasando el estado según el usuario
        renderDashboard(dashb_state);
        
        setTimeout(()=>{ // Simulamos una carga más longeva con 2 segundos al menos de carga (efecto estético)
            document.body.style.overflow = "auto";
            document.getElementById("loading").style.opacity = 0;
            document.getElementById("loading").style.zIndex = 0;
        },2000);


        idbUsrEvnt.closeDB(); // Cerramos la DB
    } catch(error){
        console.error(`${logs.getLogDate()} [DB ERROR] ${error.message}`);
        console.trace(error);
    }
}


/**
 * Función que renderiza el dashboard del usuario si ha sido modificado antes
 * 
 * @param {*} dashb_state Estado del dashboard obtenido del IDB 
 */
function renderDashboard(dashb_state){
    // El dashboard del usuario es diferente al original (por defecto)
    if(dashb_state !== 'default'){
        let elems_dashb = dashb_state.split(';'); // Array de elementos a renderizar

        elems_dashb.forEach((elem) => { // Ejemplo de elem: "1:4" --> Elemento 1 de tamaño 4 (cuadrado)
            // En base al formato de los elementos creamos elementos del DOM que luego se añadirán
            // Utilizamos el mapa DASHBOARD_ELEMS para obtener los enlaces de los iframes.
 


        });
    } // Si el dashboard es 'default', ya lo ha renderizado dashboard.html

}

// Muestra/Oculta el menú de un elemento del dashboard
function displayMenu(event){ // El desencadenante es un botón (div)
    // Si existe el último elemento se valida si el menú se está mostrando 
    if(lastMenuElement){
        if(lastMenuElement.classList.contains('conf__menu--on'))
            lastMenuElement.classList.remove('conf__menu--on');
    }

    const sectionDashb = event.target.closest('.main__module'); // Se obtiene el elemento padre con clase .main__module
    const menuSection = sectionDashb.querySelector('.conf__menu'); // Se obtiene el elemento menu
    const sphereContent = sectionDashb.querySelector('.conf__sphere-content'); // Obtenemos el contenedor de la esfera
    menuSection.classList.toggle('conf__menu--on'); // Se muestra/oculta el menú
    sphereContent.classList.toggle('conf__menu--on'); // Se muestra/oculta la esfera

    lastMenuElement = menuSection;
}

function moveSphere(event){
    const mainModule = event.target.closest('.main__module'); // Elemento padre main__module
    const sphere = mainModule.querySelector('.sphere-zone__sphere'); // Obtenemos la esfera

    // Posicionamos la esfera donde se sitúe el mouse
    sphere.style.left = `${event.layerX-17}px`;
    sphere.style.top = `${event.layerY-17}px`;
}

window.displayMenu = displayMenu;
window.moveSphere = moveSphere;