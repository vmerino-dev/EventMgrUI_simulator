
setTimeout(()=>{
    let elem = document.createElement("h3");
    elem.innerHTML = Object.keys(window.parent.userMgr.users);
    document.body.appendChild(elem);
}, 2000)