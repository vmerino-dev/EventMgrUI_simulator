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

        return new Promise((resolve, reject) => {
            request.onerror = () => {
                reject('Error al abrir la base de datos' + request);
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

                    Promise.all([
                        this.#addUserMgr(userMgrObjSt, usermgrIDB),
                        this.#addEventMgr(userMgrObjSt, eventmgrIDB)
                    ])
                    .then(
                        this.#request = request,
                        this.#db = db,
    
                        resolve(db)
                    )
                    .catch((error) => {
                        reject(error)
                    });

                } else {
                    // Guardamos el db y el request para poder ser accedidos y manipulados desde fuera
                    this.#request = request;
                    this.#db = db;

                    resolve(db);
                }
            }
        });
    }

    #addUserMgr(userMgrObjSt, userMgr){
        let requestTransaccionUser = userMgrObjSt.add(userMgr);

        return new Promise((resolve, reject) => {
            requestTransaccionUser.onsuccess = (event) => {
                resolve(event.target.result);

            }

            requestTransaccionUser.onerror = (event) => {
                reject(event.target.error);

            }
        });
    }

    #addEventMgr(userMgrObjSt, eventMgr){
        let requestTransaccionEvent = userMgrObjSt.add(eventMgr);

        return new Promise((resolve, reject) => {
            requestTransaccionEvent.onsuccess = (event) => {
                resolve(event.target.result);
            }
    
            requestTransaccionEvent.onerror = (event) => {
                reject(event.target.error);
            }
        });
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
     * Función que generaliza el almacenamiento de objetos en la base de datos
     * 
     * @param {*} userMgr true si es userMgr, false si es eventMgrs
     * @param {*} mgr El segundo parámetro es el objeto a almacenar
     */
    #store(userMgr = true, mgr){
        if(this.#db === null)
            throw new IDBError('No se ha abierto la base de datos');

        let eventmgrIDB;
        let usermgrIDB;

        if(!userMgr){ // Si se desea almacenar el gestor de eventos
            eventmgrIDB = {
                id: 'userMgr',
                userMgr: mgr
            }

        } else {
            usermgrIDB = {
                id: 'userMgr',
                userMgr: mgr
            }
        }

        const transaccion = this.#db.transaction('userEventMgr', 'readwrite'); // Transacción de lectura/escritura
        const ObjSt = transaccion.objectStore('userEventMgr'); // Obtenemos almacen objetos de users

        let requestTransaccion;

        if(!userMgr){
            requestTransaccion = ObjSt.put(eventmgrIDB); // Se actualiza el gestor de eventos

        } else {
            requestTransaccion = ObjSt.put(usermgrIDB); // Se actualiza el gestor de usuarios

        }

        return new Promise((resolve, reject) => { // Se resuelve al actualizar el objeto o se rechaza si hay error
            requestTransaccion.onsuccess = (event) => {
                resolve(event.target.result);
            }

            requestTransaccion.onerror = (event) => {
                reject(event.target.error);
            }
        });
    }

    /**
     * Almacena el gestor de usuarios (probablemente actualizado)
     */
    storeUsers(userMgr){
        return this.#store(true, userMgr); // Retornamos la promesa para ser tratada desde fuera
    }

    /**
     * Almacena el gestor de eventos (probablemente actualizado)
     */
    storeEvents(eventMgr){
        return this.#store(true, eventMgr); // Retornamos la promesa para ser tratada desde fuera
    }


    /**
     * Función que generaliza la carga de objetos de la base de datos
     * 
     * @param {*} objectToLoad Objeto a cargar (userMgr o eventMgr) en string
     */
    #load(objectToLoad){
        if(this.#db === null)
            throw new IDBError('No se ha abierto la base de datos');
        
        let transaccion = this.#db.transaction('userEventMgr', 'readonly'); // Transacción de lectura
        let userMgrObjSt = transaccion.objectStore('userEventMgr'); // Obtenemos almacen objetos de users

        let requestTransaccion = userMgrObjSt.get(objectToLoad);

        return new Promise((resolve, reject) => {
            requestTransaccion.onsuccess = (event) => {
                resolve(event.target.result);

            }
    
            requestTransaccion.onerror = (event) => {
                reject(event.target.error);

            }
        });
    }

    /**
     * Carga el gestor de usuarios
     * @param {UserMgr} userMgr Gestor de usuarios
     */
    loadUsers(){
        return this.#load('userMgr');
    }

    /**
     * Carga el gestor de eventos
     * @param {EventMgr} eventMgr Gestor de eventos
     */
    loadEvents(){
        return this.#load('eventMgr');
    }
}