"using strict";

// Nos aseguaremos que ocultamos la barra de desplazamiento hasta que se cargue la página
document.body.style.overflow = "hidden";

import logs from "./log.js";
import { UserMgr, User } from "./classes/usrmsg.js";
//import { DASHBOARD_ELEMS } from "./utils.js";
import { IDBUsersEvents, ldDB_ValidInputs, idbUsrEvnt, userMgr, eventMgr, userMgrSerial, IDBDashboard } from "./idb.js";

// Obtenemos el id del usuario actual
let usrSessionId = localStorage.getItem("userSession");

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
        const idbDashboard = new IDBDashboard(1, userMgr, usrSessionId);
        const statusProm_dashb = await idbDashboard.init(); // Obtenemos el estado del dashboard del usuario

        let dashb_status; // Estado que dependerá del valor de depuración devuelto por la promesa

        // Si la DB no se acaba de crear o el usuario estaba en el obj. store dashboard, 
        if(statusProm_dashb.includes('exists')){ // El usuario "existe" dentro de la tabla
            // Ejemplo de dashb_status: "1:4;2:3". Los elementos del dashboard se delimitan por ;
            dashb_status = statusProm_dashb.match(/<([^>]+)>/); // Devolvemos el contenido entre <> devuelto por la promesa (estado del dashboard)
        
        } else { // Si la DB se acaba de crear (todos los usuarios = default) o el usuario tenía el dashboard en default
            dashb_status = 'default';
        }

        // Renderizamos el dashboard
        renderDashboard(dashb_status);

        
        setTimeout(()=>{ // Simulamos una carga más longeva con 2 segundos al menos de carga (efecto estético)
            document.body.style.overflow = "auto";
            document.getElementById("loading").style.opacity = 0;
            document.getElementById("loading").style.zIndex = 0;
        },2000);


        idbUsrEvnt.closeDB(); // Cerramos la DB
    } catch(error){
        console.error(`${logs.getLogDate()} [DB ERROR] ${error.message}`);
    }
}

function renderDashboard(dashb_status){
    // El dashboard del usuario es diferente al original (por defecto)
    if(dashb_status !== 'default'){
        let elems_dashb = dashb_status.split(';'); // Array de elementos a renderizar

        elems_dashb.forEach((elem) => { // Ejemplo de elem: "1:4" --> Elemento 1 de tamaño 4 (cuadrado)
            // En base al formato de los elementos creamos elementos del DOM que luego se añadirán
            // Utilizamos el mapa DASHBOARD_ELEMS para obtener los enlaces de los iframes.



        });
    } // Si el dashboard es 'default', ya lo ha renderizado dashboard.html

}

