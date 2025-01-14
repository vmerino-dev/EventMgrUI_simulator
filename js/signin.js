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
 */
let validarInputs = (field, numField) => {

    switch(numField){
        case USERN:
            userMgr.userCorrect(field); break;

        case EMAIL:
            userMgr.emailCorrect(field); break;
        
        case PASSWD:
        case PASSWDREP:
            if(passwd !== passwdRepeat) // Se compara passwd con passwd repeat
            throw new PasswdError("La contraseña no coincide", fields[0].value, fields[1].value,);   
        
            userMgr.passwdCorrect(passwd); // Validación passwd
    }    
}

// Obtención de los valores de los campos (input value)
let fields_string = Array.from(inputs).map(input => input.value);

for(let i=0;i<fields_string.length;i++){
    inputs[i].addEventListener("blur", ()=>{ // Evento de validación cuando se pierde el foco en un input
        if(inputs[i].value === "") // Si el input está vacío, no validar
            return 0;

        try {
            // Validamos con el input value recibido e indicamos el número de campo en 2o param.
            validarInputs(fields_string[i], i);
     
        } catch(error){
            // Se tratarán los errores de UserError si algún campo no está vacío
            if (error instanceof UserError && !inputs.every(input => input.value !== "")){
                console.error("MESG", error.message);

            // Se tratarán los errores de passwd si el campo no está vacío
            } else if (error instanceof PasswdError && inputs[3].value !== "") {
                console.error("MESG", error.message);
            
            } else if(error instanceof EmailError) //etc
        }
    });
}