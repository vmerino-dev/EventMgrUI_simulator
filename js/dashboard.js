"using strict";

import logs from "./log.js";
import { UserMgr, User } from "./classes/usrmsg.js";
import { IDBUsersEvents, ldDB_ValidInputs, idbUsrEvnt, userMgr, userMgrSerial } from "./idb.js";


// Carga del userMgr
let usrSessionId = localStorage.getItem("userSession");

const header = document.createElement("h1");

dbAccess();

async function dbAccess(){
    try {
        await ldDB_ValidInputs();

        let userObj = userMgr.getUser("victor"); //userMgr.getUserId(usrSessionId)
        header.innerHTML = `username: ${userObj.username}; email: ${userObj.email}; passwd: ${userObj.passwd}, msgTH: ${userObj.msgThreads[0].messages}`;
        document.body.appendChild(header);
        idbUsrEvnt.closeDB();
        
    } catch(error){
        console.error(`${logs.getLogDate()} [DB ERROR] ${error.message}`);
    }
}



