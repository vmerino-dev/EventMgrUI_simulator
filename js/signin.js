"use strict";


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

