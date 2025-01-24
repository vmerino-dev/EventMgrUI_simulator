"use strict";

import { UserMgr } from "./classes/usrmsg.js";
import { EventMgr } from "./classes/events.js";

/**
 * IDB
 * 
 * Clase que se encarga de gestionar las bases de datos IndexedDB de los usuarios
 * Si #request o #db son null, no se ha abierto aún la bbdd o ha habido un error
 */
export class IDB_Users {
    #request = null;
    #db = null;

    // Constructor
    constructor(dbName, dbVersion){
        let userMgr; // Almacenará el gestor de usuarios

        request = window.indexedDB.open(dbName, dbVersion);

        request.onerror = () => {
            console.log('Error al abrir la base de datos');
        }

        request.onupgradeneeded = (event) => {
            let db = request.result;

            if(!event.oldVersion){ // Si la bbdd no existe, creamos el objeto gestor de usuarios
                userMgr = new UserMgr();
            }
                

            if(!db.objectStoreNames.contains('userMgr')){
                db.createObjectStore('userMgr', {keyPath: "id"});
            }
        }

        request.onsuccess = () => {
            let db = request.result;

            db.onversionchange = () => {
                db.close(); // Si ha habido cambio de versión, cerramos la conexión
            }



            this.#request = request;
            this.#db = db;
        }

    }

    // getters
    get request(){
        return this.#request;
    }

    get db(){
        return this.#db;
    }
}