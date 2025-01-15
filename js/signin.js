"use strict";

/*********************
*   Importaciones
*********************/

import logs from "./log.js";
import { userMgr, eventMgr } from "./main.js";
import { UserMgr, User } from "./classes/usrmsg.js";
import { UserError, EmailError, PasswdError } from "./errors/eventErrors.js";


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


// *** Validación de inputs ***
const inputs = document.getElementsByTagName("input");

const [USERN, EMAIL, PASSWD, PASSWDREP] = [0, 1, 2, 3]; // Correspondencia de campos con orden numérico


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

for(let i=0;i<inputs.length;i++){ // Eventos input
    inputs[i].addEventListener("blur", ()=>{ // Evento de validación cuando se pierde el foco en un input
        if(inputs[i].value === ""){ // Si el input está vacío, no validar
            inputs[i].style.background = "";
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
            
        } catch(error){
            isError = true;

            inputs[i].style.background = "#c46062";
            inputs[i].style.background = "oklch(60.94% 0.1288 19.99)";

        } finally {
            if(!isError)
                inputs[i].style.background = "";
        }
    });
}

document.getElementsByTagName("button")[0]
    .addEventListener("click", (event)=>{ // Eventos button
    event.preventDefault();
});