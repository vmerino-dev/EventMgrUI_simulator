"use strict";

const passwd1Input = document.getElementById("passwd1-input");
const passwd2 = document.getElementById("passwd-2");

passwd1Input.addEventListener("focus", () => {
    passwd2.classList.add("field__info--pshow");
});