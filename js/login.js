"use strict";

/*********************
*   Importaciones
*********************/

import logs from "./log.js";
import { UserError, PasswdError } from "./errors/eventErrors.js";
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

        const ERROR_COLOR = "#f0533a"; // Color utilizado en fuente y fondo de campos para los errores

        // Obtenemos los campos input del usuario y la passwd
        const inputs = document.getElementsByTagName("input");

        document.getElementsByTagName("button")[0]
            .addEventListener("click", (event)=>{ // Eventos button

            event.preventDefault();


            let [ username, passwd ] = Array.from(inputs).map(input => input.value);

            try {
                userMgr.logIn(username, passwd);

                const idUser = userMgr.getIdfromUser(username); // Obtenemos id de username
                localStorage.setItem("userSession", idUser); // Almacenamos el usuario en sesión (id)
                
                // Cerramos la DB y cargamos el dashboard
                idbUsrEvnt.closeDB();
                window.location.href = "dashboard.html"
                
            } catch(error) {
                if(error instanceof UserError || error instanceof PasswdError){
                    console.error(`${logs.getLogDate()} [LOGIN ERROR] The user or passwd are not correct`);

                    // Colores de error en fieldset y el botón de login
                    const fieldset = document.getElementsByTagName("fieldset")[0];
                    fieldset.style.borderColor = ERROR_COLOR;
                    event.target.style.backgroundColor = ERROR_COLOR;

                    // Elemento dialog para mostrar error de LogIn
                    const dialog = document.createElement("dialog");
                    
                    // Modificando el estilo del dialog
                    dialog.style.color = "azure";
                    dialog.style.fontSize = "1.1em"
                    dialog.style.backgroundColor = ERROR_COLOR;
                    dialog.style.borderRadius = "13px";
                    dialog.style.border = `0`;
                    dialog.style.padding = "30px";

                    // Posición del dialog
                    dialog.style.position = "fixed";
                    dialog.style.top = "300px";

                    dialog.innerHTML = "El usuario o la contraseña no son correctos";
                    document.body.appendChild(dialog);
                    dialog.setAttribute("open", ""); // Mostrando el dialog
                }
            }
            
        });

    } catch(error) {
        console.error(`${logs.getLogDate()} [DB ERROR] Error al cargar los usuarios de la base de datos`)

    }
}