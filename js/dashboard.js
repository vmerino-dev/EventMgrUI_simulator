"using strict";

import { IDBUsersEvents } from "./idb.js";
import { UserMgr, User } from "./classes/usrmsg.js";


// Carga del userMgr
let usrSessionId = localStorage.getItem("userSession");

const header = document.createElement("h1");

ldDB_ValidInputs();

async function ldDB_ValidInputs(){
    try{
        const idbUsrEvnt = new IDBUsersEvents(1); // Creación de la base de datos IndexedDB
        await idbUsrEvnt.init(); // Inicialización de la base de datos

        const userMgrSerial = await idbUsrEvnt.loadUsers(); // Carga del gestor de usuarios
        const userMgr = UserMgr.createInstanceFromIDB(userMgrSerial.users); // Instanciamos los objetos obtenidos de IDB para acceder a métodos de clase
        
        let userObj = userMgr.getUserId(usrSessionId)

        header.innerHTML = `username: ${userObj.username}; email: ${userObj.email}`;

        document.body.appendChild(header);

        idbUsrEvnt.closeDB();

    } catch(error){
        console.error(error);
    }
}



