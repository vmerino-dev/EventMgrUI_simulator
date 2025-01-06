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


// Creando gestor de usuarios y de eventos.
// Se tienen que cargar desde IndexedDB si existen y guardarse al final
let userMgr = new UserMgr();
let eventMgr = new EventMgr();
