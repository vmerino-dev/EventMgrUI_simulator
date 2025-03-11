"use strict";

import { UserMgr, MessageThread } from "./classes/usrmsg.js";
import { EventMgr } from "./classes/events.js";
import { DB_NAME } from "./utils.js";
import { IDBError } from "./errors/idbErrors.js";


// Exportaciones
export let idbUsrEvnt;
export let userMgr;
export let eventMgr;
export let userMgrSerial;

/**
 * IDB
 */

export class IDB {
    #dbVersion = null; // versión de la DB indicada en el constructor

    // Constructor
    constructor(dbVersion){
        this.#dbVersion = dbVersion;
    }

    get dbVersion(){
        return this.#dbVersion;
    }

    set dbVersion(dbVersion){
        this.#dbVersion = dbVersion;
    }
}


/**
 * IDBUsersEvents
 * 
 * Clase que se encarga de gestionar las bases de datos IndexedDB de los usuarios
 * Si #request o #db son null, no se ha abierto aún la bbdd o ha habido un error
 */
export class IDBUsersEvents extends IDB {
    #request = null;
    #db = null;
    #oldVersion = null;

    // Constructor
    constructor(dbVersion){
        super(dbVersion);
    }

    /** 
     * init()
     * 
     * Inicializa la DB y el object store. Si no existen ambos, los crea y añade el gestor de usuarios
     * y el gestor de eventos.
     * 
     * @returns {Promise} Promesa que se resuelve al abrir la base de datos o se rechaza si hay error
    */
    init(){
        let userMgr; // Almacenará el gestor de usuarios
        let eventMgr; // Almacenará el gestor de eventos

        let request = window.indexedDB.open(DB_NAME, this.dbVersion);

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


    /**
     * Permite añadir el gestor de usuarios al objeto store
     * @param {*} userMgrObjSt 
     * @param {*} userMgr 
     * @returns {Promise}
     */
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

    /**
     * Permite añadir el gestor de eventos al objeto store
     * @param {*} userMgrObjSt
     * @param {*} eventMgr
     * @returns {Promise}
     */
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
                resolve(event.target.result[objectToLoad]);

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

export async function ldDB_ValidInputs(){
    /**
     * try-catch
     * 
     * Se intenta ejecutar el siguiente código, si hay un error en la inicialización de la DB o la carga
     * del gestor de usuarios, se lanzará mediante las promesas devueltas para la sincronización.
     */
    const idbUsrEvntTemp = new IDBUsersEvents(1); // Creación de la base de datos IndexedDB
    await idbUsrEvntTemp.init(); // Inicialización de la base de datos
    
    const userMgrSerialTemp = await idbUsrEvntTemp.loadUsers(); // Carga del gestor de usuarios
    const [userMgrDB, eventMgrDB] = UserMgr.createInstanceFromIDB(userMgrSerialTemp.users); // Instanciamos los objetos obtenidos de IDB para acceder a métodos de clase
    
    userMgr = userMgrDB;
    eventMgr = eventMgrDB;
    idbUsrEvnt = idbUsrEvntTemp;
    userMgrSerial = userMgrSerialTemp;
}

/**
 * class IDBDashboard
 * 
 * Inicialización y control del dashboard en IDB
 * Se debe obtener userMgr antes de crear un obj. y pasarlo al constructor
 */

export class IDBDashboard extends IDB {
    #userMgr;
    #userSessionID;

    // Constructor
    constructor(dbVersion, userMgr, userSessionID){
        super(dbVersion);
        this.#userMgr = userMgr; // Gestor de usuarios
        this.#userSessionID = userSessionID;
    }

    /** 
     * init()
     * 
     * Inicializa la DB y el object store. Si no existen ambos, los crea.
     * 
     * @returns {Promise} Promesa que se resuelve al abrir la base de datos o se rechaza si hay error
    */
    init(){

        let isDBNew = false; // Pasará a true si la DB se acaba de crear
        let sem_success_compl = false; // Semáforo que pasará a true si onsuccess u oncompleted finalizan su ejecución

        // Abrimos la bbdd
        let request = window.indexedDB.open(DB_NAME, this.dbVersion);

        return new Promise((resolve, reject) => {
            request.onerror = () => {
                reject('Error al abrir la base de datos' + request);
            }

            request.onupgradeneeded = () => {
                let db = request.result;
                isDBNew = true; // La DB no existía

                if(!db.objectStoreNames.includes('dashboard')){
                    db.createObjectStore('dashboard', {keyPath: "userID"});

                    /*********************************
                    *  Añadir usuarios al dashboard  *
                    *********************************/

                    // Obtenemos todos los id de los usuarios en un vector
                    let users_id = Object.keys(this.#userMgr.users);


                    // Creamos una transacción a partir del obj. store dashboard y lo devolvemos
                    const transaccion = db.transaction('dashboard', 'readwrite');
                    const dashbObjSt = transaccion.objectStore('dashboard');
                    
                    // Añadimos usuarios al objectStore con valor default (default dashboard)
                    users_id.forEach(user_id => {
                        let dashB_register = {userID: user_id, state: 'default'}; // Creamos un registro con los campos id y estado
                        dashbObjSt.add(dashB_register); // Añadimos el registro al obj. store
                    });
                   
                
                    // Se completan todas las operaciones "add" de la transacción
                    transaccion.oncomplete = () => {
                        
                        // Si el evento onsuccess ha finalizado su ejecución antes, se resuelve la promesa
                        if(sem_success_compl) {
                            resolve("Dashboard loaded (new DB created)"); 
                        }

                        sem_success_compl = true;
                    }
                }
            }

            request.onsuccess = () => {
                let db = request.result;


                db.onversionchange = () => {
                    db.close(); // Si ha habido cambio de versión, cerramos la conexión
                }


                /* Verificamos si el ID del usuario es nuevo comparandolo con el resto de
                IDs (si no existe, es usuario nuevo -> ID_usuario = default) */

                /* Si la DB no se acaba de crear, se verifica el usuario actual y si no existe,
                se añade */
                if(!isDBNew){
                    // ** Validación de usuario en el Dashboard **
                    const transUser = db.transaction('dashboard', 'readonly');
                    const dashb_objSt = transUser.objectStore('dashboard');

                    let request_user = dashb_objSt.get(this.#userSessionID);

                    request_user.onsuccess = (event) => {
                        // El usuario existe y podemos renderizar su dashboard
                        if(event.target.result){
                            resolve(`Dashboard loaded (exists: <${event.target.result}>)`);

                        } else { // usuario = undefined (no existe)
                            // El usuario actual no existe y debemos crearlo en el dashboard estableciendo su estado en default
                            
                            // Creamos de nuevo una transacción y obtenemos obj. store
                            const transUser = db.transaction('dashboard', 'readwrite');
                            const dashb_objSt = transUser.objectStore('dashboard');

                            // Añadimos el usuario actual al dashboard
                            let request_user_add = dashb_objSt.add(
                                {userID: this.#userSessionID, state: 'default'}
                            );

                            request_user_add.onsuccess = (event) => {
                                resolve('Dashboard loaded (actual user added)');
                            }
                        }
                    }
                    

                } else { // La DB se acaba de crear (el evento onupgradeneeded ha sido desencadenado)
                    // Si se han añadido todos los usuarios al dashboard, se resuelve la promesa
                    if(sem_success_compl) {
                        // Resolvemos la promesa
                        resolve("Dashboard loaded (new DB created)");
                    }

                    // Los usuarios no han sido añadidos aún, se resolverá en evento oncomplete
                    sem_success_compl = true;
                    
                }
            }
        })
    }
}