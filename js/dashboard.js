"using strict";

// Nos aseguaremos que ocultamos la barra de desplazamiento hasta que se cargue la página
document.body.style.overflow = "hidden";

import logs from "./log.js";
import { UserMgr, User } from "./classes/usrmsg.js";
import { IDBUsersEvents, ldDB_ValidInputs, idbUsrEvnt, userMgr, eventMgr, userMgrSerial } from "./idb.js";

// Carga del userMgr
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

        setTimeout(()=>{ // Simulamos una carga más longeva con 2 segundo al menos de carga (efecto estético)
            document.body.style.overflow = "auto";
            document.getElementById("loading").style.opacity = 0;
        },2000);

        idbUsrEvnt.closeDB(); // Cerramos la DB
    } catch(error){
        console.error(`${logs.getLogDate()} [DB ERROR] ${error.message}`);
    }
}


