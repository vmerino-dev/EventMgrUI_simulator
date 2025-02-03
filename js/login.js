"use strict";

import { PasswdError } from "./errors/eventErrors.js";
/*********************
*   Importaciones
*********************/

import logs from "./logs.js";
import { IDBUsersEvents, ldDB_ValidInputs, idbUsrEvnt, userMgr, userMgrSerial } from "./idb.js";

/**
 *  dbAccessLogIn()
 * 
 *  Sincronizar procesos IDB con login
 */

dbAccessLogIn();

async function dbAccessLogIn(){
    /**
     * try-catch
     * 
     * Se intenta ejecutar el siguiente código, si hay un error en la inicialización de la DB o la carga
     * del gestor de usuarios, se lanzará mediante las promesas devueltas para la sincronización.
     */
    try {
        // Cargamos la db
        await ldDB_ValidInputs(); // Función asíncrona de idb.js para inicializar db

        // Obtenemos los campos input del usuario y la passwd
        const inputs = document.getElementsByTagName("input");

        document.getElementsByTagName("button")[0]
            .addEventListener("click", (event)=>{ // Eventos button

            event.preventDefault();


            let [ username, passwd ] = Array.from(inputs).map(input => input.value);

            try {
                userMgr.logIn(username, passwd);
            } catch(error) {
                if(error instanceof UserError || error instanceof PasswdError){
                    console.error(`${logs.getLogDate()} [LOGIN ERROR] The user or passwd are not correct`);

                    const fieldset = document.getElementsByTagName("fieldset")[0];
                    fieldset.style.borderColor = "red";
                }
            }

            /*
            localStorage.setItem("userSession", idUser); // Almacenamos el usuario en sesión (id)
                
                
                idbUsrEvnt.storeUsers(userMgr) // Almacenamos los usuarios en la base de datos
                    .then(
                        idbUsrEvnt.closeDB(), // Se cierra la conexión con la DB antes de acceder al dashboard
                        window.location.href = "dashboard.html" // Accedemos al dashboard
                    )
                    .catch(
                        console.error(`${logs.getLogDate()} [DB ERROR] Error al almacenar los usuarios en la base de datos`)
                    )

            }*/
                
        });

    } catch(error) {

    }
}