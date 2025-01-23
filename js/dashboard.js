
const header = document.createElement("h1");
header.innerHTML = "SESIÓN DEL USUARIO " + localStorage.getItem("userSession");
document.body.appendChild(header);
