/*
****************************************************
*                    main.js
*      Importaremos el resto de scripts desde main
****************************************************
*/

"use strict";

/*********************
*   Importaciones
*********************/

import logs from "log.js";
import { UserMgr } from "classes/usrmsg.js";
import { EventMgr } from "classes/events.js";


// 📃 [===== LOG_VV =====] 
if(logs.verbosity >= 2){
    logs.vv_warn("La feature de logs ha sido cargada")
    logs.vv_warn("La API crypto será necesaria para un correcto funcionamiento")
    logs.vv_warn("Los datos serán guardados mediante IndexedDB y Web Storage")
    logs.vv_warn("El almacenamiento de los datos será local. No existe backend")
    logs.vv_warn("Esto es un simulador de UI, no un gestor de eventos real")
}

// Creando gestor de usuarios y de eventos.
// Se tienen que cargar desde IndexedDB si existen y guardarse al final
let userMgr = new UserMgr();
let eventMgr = new EventMgr();
