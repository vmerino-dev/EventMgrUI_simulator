"use strict";

/*********************
*   Importaciones
*********************/

import logs from "./log.js";
import { userMgr, eventMgr } from "./main.js";
import { UserMgr, User } from "./classes/usrmsg.js";
import { UserError } from "./errors/eventErrors.js";
logs.verbosity = "vvv"; // TEST

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

let validarInputs = (fields) => {
    let [username, email, passwd, passwdRepeat] = Array.from(fields).map(field => field.value);

    console.log(username, email, passwd, passwdRepeat);
    if(passwd !== passwdRepeat){ // Se compara passwd con passwd repeat
        throw new UserError("La contraseña no coincide", fields[0].value, fields[1].value,);
    }

    return userMgr.addUser(username, email, passwd); // Se intenta validar el usuario
}

for(let input of inputs){
    input.addEventListener("blur", ()=>{
        if(input.value === "")
            return 0;

        try {
            validarInputs(inputs); // Solo queremos validar, no obtener el usuario
     
        } catch(error){
            if(error instanceof UserError){
                console.error(error.message, error.username, error.email, error.passwd);
            }
        } finally {
            console.log(input.value);
        }
    });
}