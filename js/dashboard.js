
import { IDBUsersEvents } from "./idb.js";

// Carga del userMgr
let usrSessionId = localStorage.getItem("userSession");

const header = document.createElement("h1");

ldDB_ValidInputs();

async function ldDB_ValidInputs(){
    try{
        const idbUsrEvnt = new IDBUsersEvents(1); // Creación de la base de datos IndexedDB
        await idbUsrEvnt.init(); // Inicialización de la base de datos

        const userMgr = await idbUsrEvnt.loadUsers(); // Carga del gestor de usuarios      
        
        let userObj = userMgr.getUserId(usrSessionId)

        header.innerHTML = `username: ${userObj.name}; email: ${userObj.email}`;

        document.body.appendChild(header);

        idbUsrEvnt.closeDB();

    } catch(error){
        console.error(error);
    }
}



