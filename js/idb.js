"use strict";

import { UserMgr } from "./classes/usrmsg.js";
import { EventMgr } from "./classes/events.js";
import { DB_NAME } from "./utils.js";
import { IDBError } from "./errors/idbErrors.js";

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
    constructor(dbVersion){
        let userMgr; // Almacenará el gestor de usuarios
        let eventMgr; // Almacenará el gestor de eventos

        let request = window.indexedDB.open(DB_NAME, dbVersion);

        request.onerror = () => {
            throw new IDBError('Error al abrir la base de datos', request);
        }

        request.onupgradeneeded = (event) => {
            let db = request.result;

            if(event.oldVersion === 0){ // Si la bbdd no existe, creamos el objeto gestor de usuarios
                userMgr = new UserMgr();
                eventMgr = new EventMgr();

                this.#oldVersion = 0;
            }
                

            if(!db.objectStoreNames.contains('userEventMgr')){
                db.createObjectStore('userEventMgr', {keyPath: "id"});
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
                let transaccion = db.transaction('userEventMgr', 'readwrite');
                let userMgrObjSt = transaccion.objectStore('userEventMgr'); // Obtenemos almacen objetos de users


                let usermgrIDB = {
                    id: 'userMgr',
                    userMgr: userMgr
                }

                let eventmgrIDB = {
                    id: 'eventMgr',
                    eventMgr: eventMgr
                }

                let requestTransaccion = userMgrObjSt.add(usermgrIDB);
                requestTransaccion = userMgrObjSt.add(eventmgrIDB);

                requestTransaccion.onsuccess = (event) => {
                    console.log(`${event.target.result} añadido`);
                }

                requestTransaccion.onerror = () => {
                    console.log('Error al añadir los objetos');
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

    // Métodos

    /**
     * Cierra la conexión con la base de datos
     */
    closeDB(){
        this.#db.close();
    }



    /**
     * Carga los usuarios en el gestor de usuarios
     * @param {UserMgr} userMgr Gestor de usuarios
     */
    loadUsers()){

    }

    /**
     * Carga los eventos en el gestor de eventos
     * @param {EventMgr} eventMgr Gestor de eventos
     */
    loadEvents(){
    
    }

}