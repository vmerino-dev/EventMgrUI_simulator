"use strict";

import { UserMgr } from "./classes/usrmsg.js";
import { EventMgr } from "./classes/events.js";

import { IDBError } from "./errors/eventErrors.js";

/**
 * IDB
 * 
 * Clase que se encarga de gestionar las bases de datos IndexedDB de los usuarios
 * Si #request o #db son null, no se ha abierto aún la bbdd o ha habido un error
 */
export class IDBUsersEvents {
    #request = null;
    #db = null;
    #oldVersion = null;

    // Constructor
    constructor(dbName, dbVersion){
        let userMgr; // Almacenará el gestor de usuarios

        let request = window.indexedDB.open(dbName, dbVersion);

        request.onerror = () => {
            throw new IDBError('Error al abrir la base de datos', request);
        }

        request.onupgradeneeded = (event) => {
            let db = request.result;

            if(event.oldVersion === 0){ // Si la bbdd no existe, creamos el objeto gestor de usuarios
                userMgr = new UserMgr();
                this.#oldVersion = 0;
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


            // Si oldVersion = 0 añade userMgr al db
            if(this.#oldVersion === 0){
                // Transacciones
                let transaccion = db.transaction('userMgr', 'readwrite');
                let userMgrObjSt = transaccion.objectStore('userMgr'); // Obtenemos almacen objetos de users


                let usermgrIDB = {
                    id: 'userMgr',
                    userMgr: userMgr
                }

                let requestTransaccion = userMgrObjSt.add(usermgrIDB);

                requestTransaccion.onsuccess = () => {
                    console.log('UserMgr añadido');
                }

                requestTransaccion.onerror = () => {
                    console.log('Error al añadir el UserMgr');
                }

            }

            // Guardamos el db y el request para poder ser accedidos y manipulados desde fuera
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