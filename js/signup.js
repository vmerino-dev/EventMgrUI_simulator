"use strict";

/*********************
*   Importaciones
*********************/

import logs from "./log.js";
import { UserMgr, User } from "./classes/usrmsg.js";
import { UserError, EmailError, PasswdError } from "./errors/eventErrors.js";
import { IDBUsersEvents } from "./idb.js";


const navbar = document.getElementsByTagName("nav")[0]; // nav
const footer = document.getElementsByTagName("footer")[0]; // footer
const passwd1Input = document.getElementById("passwd1-input");
const passwd2 = document.getElementById("passwd-2");

function addClass_pshow(passwd) {
    passwd.classList.add("field__info--pshow");
}

function removeClass_pshow(passwd) {
    passwd.classList.remove("field__info--pshow");
}

// Listener para añadir campo password
passwd1Input.addEventListener("focus", ()=>addClass_pshow(passwd2));

// Listeners para eliminar campo password
navbar.addEventListener("click", ()=>removeClass_pshow(passwd2));
footer.addEventListener("click", ()=>removeClass_pshow(passwd2));


/**
 * ldDB_ValidInputs()
 * 
 * Función asíncrona que no permite validar inputs hasta que la base de datos haya sido cargada
 */

ldDB_ValidInputs();

async function ldDB_ValidInputs(){
    /**
     * try-catch
     * 
     * Se intenta ejecutar el siguiente código, si hay un error en la inicialización de la DB o la carga
     * del gestor de usuarios, se lanzará mediante las promesas devueltas para la sincronización.
     */
    try {
        const idbUsrEvnt = new IDBUsersEvents(1); // Creación de la base de datos IndexedDB
        await idbUsrEvnt.init(); // Inicialización de la base de datos

        const userMgr = await idbUsrEvnt.loadUsers(); // Carga del gestor de usuarios

        // *** Validación de inputs ***
        const inputs = document.getElementsByTagName("input");

        const [USERN, EMAIL, PASSWD, PASSWDREP] = [0, 1, 2, 3]; // Correspondencia de campos con orden numérico

        const ERROR_COLOR = "#f0533a"; // Color utilizado en fuente y fondo de campos para los errores

        const erroresPrevios = [false, false, false, false]; // Indica si en la anterior validación inmediata de un campo hubo error
        const camposVacios = [true, true, true, true]; // Indica si existen campos vacíos (true -> campo vacío)

        /**
         * validarInputs()
         * 
         * @param {*} field: input value (string)
         * @param {*} numField: num. de input basado en el orden username, email, passwd, passwd_repeat
         * @param {*} passwd: Campo passwd en caso de estar validando passwdRepeat
         */
        let validarInputs = (field, numField, passwd = undefined) => {

            switch(numField){
                case USERN:
                    userMgr.userCorrect(field); break;

                case EMAIL:
                    userMgr.emailCorrect(field); break;
                
                case PASSWD:
                    userMgr.passwdCorrect(field); break; // Validación passwd

                case PASSWDREP:
                    if(field !== passwd) // Se compara passwd con passwd repeat
                        throw new PasswdError("La contraseña no coincide", passwd, field);   
                
            }    
        }

        function deleteErrorMessageDOM(input){
            // Borrado del msg de error
            let errorElem = input.nextElementSibling; // Elemento con msg de error

            if(errorElem)
                input.parentElement.removeChild(errorElem); // Lo borramos
        }

        for(let i=0;i<inputs.length;i++){ // Eventos input
            switch(i){
                case 0: inputs[i].setCustomValidity("Introduce un nombre de usuario"); break;
                case 1: inputs[i].setCustomValidity("Introduce un email"); break;
                case 2: inputs[i].setCustomValidity("Introduce una contraseña"); break;
                case 3: inputs[i].setCustomValidity("Repite la contraseña"); break;
            }

            inputs[i].addEventListener("blur", ()=>{ // Evento de validación cuando se pierde el foco en un input
                if(inputs[i].validity.valueMissing){ // Si el input está vacío, no validar
                    inputs[i].style.background = "";
                    deleteErrorMessageDOM(inputs[i]); // Borramos msg de error del dom si existe
                    
                    erroresPrevios[i] = false // En esta validación no ha habido errores.
                    camposVacios[i] = true; // El campo está vacío
                    return 0;
                }
                
                let isError = false;

                try {
                    // Validamos con el input value recibido e indicamos el número de campo en 2o param.
                    if(inputs[i].id === "passwd2-input"){ // Campo passwdRepeat
                        validarInputs(inputs[i].value, i, inputs[2].value); // 3er param -> passwd field
            
                    } else {
                        validarInputs(inputs[i].value, i);
                    }
                    
                    erroresPrevios[i] = false; // En esta validación no ha habido errores.
                    camposVacios[i] = false; // El campo no era vacío

                } catch(error){

                    isError = true; // Se ha lanzado un error
                    erroresPrevios[i] = true; // En esta validación ha habido errores.

                    camposVacios[i] = false; // El campo no era vacío


                    if(inputs[i].nextElementSibling){ // Si ya existe un elemento error lo borramos
                        deleteErrorMessageDOM(inputs[i]); // Borramos mensaje del HTML
                    }
                    // Obtenemos el elem. label y le añadimos el msg de error
                    let inputLabel = inputs[i].parentElement;
                    let errorElem = document.createElement("p");
                    errorElem.style.color = ERROR_COLOR;
                    errorElem.style.fontSize = ".65em";
                    errorElem.style.margin = "0 0 10px 10px";
                    errorElem.innerHTML = `${error.message}`;
                    
                    inputLabel.appendChild(errorElem);
                    
                    // Cambio de color del background a rojo
                    inputs[i].style.background = ERROR_COLOR;
                    
                } finally {
                    if(!isError){
                        inputs[i].style.background = ""; // El fondo vuelve a estar en blanco
                        deleteErrorMessageDOM(inputs[i]); // Borramos mensaje del HTML

                    }
                }
            });
        }

        document.getElementsByTagName("button")[0]
            .addEventListener("click", (event)=>{ // Eventos button

            event.preventDefault();

            if(erroresPrevios.every(hayError => !hayError) && camposVacios.every(campoVacio => !campoVacio)){
                // Obtenemos el string de los inputs y creamos el usuario
                let [ username, email, passwd ] = Array.from(inputs).map(input => input.value);
                let [idUser] = userMgr.addUser(username, email, passwd);

                localStorage.setItem("userSession", idUser); // Almacenamos el usuario en sesión (id)
                
                
                idbUsrEvnt.storeUsers(userMgr) // Almacenamos los usuarios en la base de datos
                    .then(
                        idbUsrEvnt.closeDB(), // Se cierra la conexión con la DB antes de acceder al dashboard
                        window.location.href = "dashboard.html" // Accedemos al dashboard
                    )
                    .catch(
                        console.error(`${logs.getLogDate()} [DB ERROR] Error al almacenar los usuarios en la base de datos`)
                    )

            } else {
                console.error("ERROR DE VALIDACIÓN DE USUARIO");
            }
                
        });

    } catch(error){
        console.error(`${logs.getLogDate()} [DB ERROR] ${error.message}`);
    }

}