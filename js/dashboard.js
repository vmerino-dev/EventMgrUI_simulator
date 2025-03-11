"using strict";

// Nos aseguaremos que ocultamos la barra de desplazamiento hasta que se cargue la página
document.body.style.overflow = "hidden";

import logs from "./log.js";
import { UserMgr, User } from "./classes/usrmsg.js";
import { IDBUsersEvents, ldDB_ValidInputs, idbUsrEvnt, userMgr, eventMgr, userMgrSerial, IDBDashboard } from "./idb.js";

// Obtenemos el id del usuario actual
let usrSessionId = localStorage.getItem("userSession");

const header = document.createElement("h1");

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
        const statusProm_dashb = idbDashboard.init(); // Obtenemos el estado del dashboard del usuario

        let dashb_status; // Estado que dependerá del valor de depuración devuelto por la promesa

        // 
        if(statusProm_dashb.includes('exists')){
            dashb_status = statusProm_dashb.match(/<([^>]+)>/); // Devolvemos el contenido entre <> devuelto por la promesa (estado del dashboard)
        
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
    // El dashboard del usuario es diferente al renderizado
    if(dashb_status !== 'default'){
        let elems_dashb = dashb_status.split(';'); // Array de elementos a renderizar
    }

}

