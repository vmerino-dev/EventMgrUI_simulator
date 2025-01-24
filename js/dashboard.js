
// Carga del userMgr
let usrSessionId = localStorage.getItem("userSession");

const header = document.createElement("h1");
header.innerHTML = `username: ${usrSessionObj.username}; email: ${usrSessionId}`;
document.body.appendChild(header);
