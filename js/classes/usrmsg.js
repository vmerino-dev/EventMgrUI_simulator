"use strict";


/*
****************************************
        User Message Classes
****************************************

La verbosidad se controla con la variable verbose en main.js
Va desde v (verbose) a vvvv (muy verbose)

*/

/*********************
*   Importaciones
*********************/

import logs from "../log.js";


// En una sesión de un usuario debe haber una variable que almacene el id de ese usuario
export class UserMgr {
    #users = {}; // {id: user, id2: user2, ...}


    // getters
    get users() { // Devuelve un objeto con los usuarios. Deberá guardarse en IndexedDB
        return this.#users;
    }

    getUserId(id) { // Devuelve un usuario por su id
        // Validamos que exista user con ese id
        if(!Object.keys(this.#users).some(iden => iden === id)){
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("The user doesn't exist", `ID: ${id}`);
            throw new UserError(`El usuario con ID ${id} no existe`);
        }
            
        return this.#users[id];
    }

    getUser(username) { // Devuelve un usuario por su nombre de usuario (username)
        // Validamos que exista user con ese nombre
        this.userDontExists(username);

        return Object.values(this.#users).find(user => user.username === username);
    }

    // Métodos
    addUser(username, email, passwd) {

        // Validamos que exista el usuario y el email
        this.userExists(username); // Lanza excepción si el usuario ya existe

        if(Object.values(this.#users).some(user => user.email === email)){
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("The email is already in use", `email: ${email}`);
            throw new UserError("El email ya está en uso", username, email, passwd);
        }
            
        // Validamos la contraseña
        this.passwdCorrect(passwd); // Lanza excepción si la contraseña no es válida

        let user = new User(username, email, passwd);
        let id = Utils.createId(); // Generamos un UUID
        this.#users[id] = user;

        // 📃 [===== LOG_V =====] 
        if(logs.verbosity >= 1) logs.v_info("New user", `username: ${username}, email: ${email}`)
    }

    // Siempre que se deba modificar nombre de usuario, invocar este metodo, no setter de User (por la validación)
    modUsername(id, newUsername){ // Usuario con ${id} tiene nombre nuevo ${newUsername} 

        // 📃 [===== LOG_VV =====] 
        if(logs.verbosity >= 2) logs.vv_warn("This method will modify the username", `${id}`);
        
        // Validamos que el nuevo nombre de usuario no exista
        this.userExists(newUsername);

        this.#users[id].username = newUsername;
        
        // 📃 [===== LOG_V =====] 
        if(logs.verbosity >= 1) logs.v_info("User modified", `ID: ${id}, newUsername: ${newUsername}`)
    }

    // Siempre que se deba modificar nombre de usuario, invocar este metodo, no setter de User (por la validación)
    modPasswd(id, newPasswd){
        
        // 📃 [===== LOG_VV =====] 
        if(logs.verbosity >= 2) logs.vv_warn("This method will modify the passwd");

        // Validamos que el nuevo nombre de usuario no exista
        this.passwdCorrect(newPasswd);

        this.#users[id].passwd = newPasswd;

        
        // 📃 [===== LOG_V =====] 
        if(logs.verbosity >= 1) logs.v_info("Passwd modified", `ID: ${id}`)
    }

    deleteUser(id) {
        // 📃 [===== LOG_VV =====] 
        if(logs.verbosity >= 2) logs.vv_warn("This method will delete the user");

        this.userDontExists(this.#users[id].username); // Lanza excepción si el usuario no existe

        delete this.#users[id]; // Si existe lo eliminamos

         // 📃 [===== LOG_V =====] 
         if(logs.verbosity >= 1) logs.v_info("User deleted", `ID: ${id}`)
    }

    createMessageThread(id_src, user_dst) { // Creamos un hilo de mensajes entre el usuario con id_src y el usuario user
        // Validamos que el usuario destino exista. De lo contrario, devolvemos excepción
        this.userDontExists(user_dst.username);
        
        // Si existe se creará el hilo de mensajes con user_dst
        this.#users[id_src].createMessageThread(user_dst);

        // 📃 [===== LOG_V =====] 
        if(logs.verbosity >= 1) logs.v_info("Msg Thread created", `ID_src: ${id_src}, ID_dst: ${user_dst}`)
    }

    deleteMessageThread(id_src, user_dst) {
       // 📃 [===== LOG_VV =====] 
       if(logs.verbosity >= 2) logs.vv_warn("This method will delete a MessageThread");

       // Validamos que el usuario destino exista. De lo contrario, devolvemos excepción
       this.userDontExists(user_dst.username);

       // Si existe se eliminará el hilo de mensajes con user_dst
       this.#users[id_src].deleteMessageThread(user_dst);

       // 📃 [===== LOG_V =====] 
       if(logs.verbosity >= 1) logs.v_info("Msg Thread deleted", `ID_src: ${id_src}, ID_dst: ${user_dst}`)
    }

    // Métodos de validación
    userExists(username) { // Comprueba si el usuario ya existe con su nombre
        
        // 📃 [===== LOG_VV =====] 
        if(logs.verbosity >= 2) logs.vv_info("Validación de existencia de username", `username: ${username}`);
        
        if(Object.values(this.#users).some(user => user.username === username)){
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("User already exists", `username: ${username}`);
            throw new UserError(`El usuario con username ${username} ya existe`, username);
        }
            
    }

    userDontExists(username) { // Comprueba si el usuario no existe con su nombre
        
        // 📃 [===== LOG_VV =====] 
        if(logs.verbosity >= 2) logs.vv_info("Validación de no existencia de username", `username: ${username}`);
        
        if(!(Object.values(this.#users).some(user => user.username === username))){
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("User doesn't exist", `username: ${username}`);
            throw new UserError(`El usuario con username ${username} no existe`, username);
        }
    }

    passwdCorrect(passwd) {
        // Validamos la contraseña con errores personalizados según el caso
        if(!/[A-Z]/.test(passwd)){
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("Passwd need uppercase", `passwd: ${passwd}`);
            throw new UserError("La contraseña debe contener al menos una letra mayúscula", undefined, undefined, passwd);
        
        } else if(!/[a-z]/.test(passwd)){
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("Passwd need lowercase", `passwd: ${passwd}`);
            throw new UserError("La contraseña debe contener al menos una letra minúscula", undefined, undefined, passwd);
        
        } else if(!/[0-9]/.test(passwd)){
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("Passwd need a number", `passwd: ${passwd}`);
            throw new UserError("La contraseña debe contener al menos un número", undefined, undefined, passwd);
        
        } else if(!/[!@#$%^&*(),.?":{}|<>]/.test(passwd)){
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("Passwd need a special char", `passwd: ${passwd}`);
            throw new UserError("La contraseña debe contener al menos un carácter especial", undefined, undefined, passwd);
        }
    
        // 📃 [===== LOG_VV =====]
        if(logs.verbosity >= 2) logs.vv_info("Validación de passwd correcta", `passwd: ${passwd}`);
    }
}

export class User {
    // Propiedades privadas
    #username;
    #email;
    #passwd;

    #conferenceEvents = [];
    #worskhopEvents = [];
    #msgThreads = [];

    // Para cada obj Interaction solo puede haber una url de vídeo única por usuario
    #interacciones = []; // Lista de obj Interaction (interacciones con los vídeos)

    // Constructor
    constructor(username, email, passwd) {
        // Estos 3 campos se validan en la clase UserMgr en addUser()
        this.#username = username;
        this.#email = email;
        this.#passwd = passwd;
    }

    // getters
    get username() { // Devuelve el nombre de usuario
        return this.#username;
    }

    get email() { // Devuelve el email
        return this.#email;
    }

    get passwd(){ // Devuelve la contraseña
        return this.#passwd;
    }

    get conferenceEvents() { // Devuelve los eventos de conferencia
        return this.#conferenceEvents;
    }

    get workshopEvents() { // Devuelve los eventos de taller
        return this.#worskhopEvents;
    }

    get msgThreads() { // Devuelve los hilos de mensajes (conversaciones)
        return this.#msgThreads;
    }

    get interacciones() { // Devuelve las interacciones con los vídeos
        return this.#interacciones;
    }

    // setters

    // NO SE DEBE LLAMAR a este setter directamente. La validación se hace en UserMgr
    set username(username) { // Modificar el nombre de usuario
        this.#username = username;
    }

    // NO SE DEBE LLAMAR a este setter directamente. La validación se hace en UserMgr
    set passwd(passwd) { // Modificar la contraseña
        this.#passwd = passwd;
    }

    // Métodos
    addConfEvent(conferenceEvent) {
        this.#conferenceEvents.push(conferenceEvent);
        eventMgr.addConfEvent(conferenceEvent, this.#username); // Debe crearse el objeto para eventMgr (EventMgr)
        
        // 📃 [===== LOG_V =====] 
        if(logs.verbosity >= 1) logs.v_info("Conference event added", `username: ${this.#username}, email: ${this.#email}`)
    }
    addWorkEvent(workshopEvent) {
        this.#worskhopEvents.push(workshopEvent);
        eventMgr.addWorkEvent(workshopEvent, this.#username); // Debe crearse el objeto para eventMgr (EventMgr)
        
        // 📃 [===== LOG_V =====] 
        if(logs.verbosity >= 1) logs.v_info("Workshop event added", `username: ${this.#username}, email: ${this.#email}`)
    }

    // Este método se invoca desde UserMgr para validación
    createMessageThread(user_dst) { // user_dst es un objeto User

        // Validamos que no exista ya un hilo de mensajes con user_dst
        if(this.#msgThreads.some(thread => thread.user_dst === user_dst)){
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("MsgThread already exists", `username: ${this.#username}`);
            throw new MsgThreadError("Ya existe un hilo de mensajes con ese usuario", this.#username);
        }
            

        let msgThread = new MessageThread(this, user_dst);
        this.#msgThreads.push(msgThread); // Hilo de msgs en user_src
        user_dst.#msgThreads.push(msgThread); // Hilo de msgs en user_dst
    }
    deleteMessageThread(user_dst) {

        // Generalmente user_dst se obtendrá a partir de UserMgr, no debería lanzarse este error
        if(!(user_dst instanceof User)){ // Si usuario destino no es instancia User, lanzar error
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("user_dst is not an instance of User", `user_dst: ${user_dst}`);
            throw new UserError("El usuario no existe (user_dst no es instancia de User)")
        }

        // Validamos que existe un hilo de mensajes con user_dst
        if(!this.#msgThreads.some(thread => thread.user_dst === user_dst)){
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("MsgThread don't exist with that user", `username: ${this.#username}`);
            throw new MsgThreadError("No existe un hilo de mensajes con ese usuario", this.#username);
        }
            
        // Filtramos la conversación con el usuario user_dst
        let msgThread = this.#msgThreads.find(thread => thread.user_dst === user_dst);
        
        // Buscamos su índice dentro de la lista de hilos de mensajes
        let index = this.#msgThreads.indexOf(msgThread);

        // Eliminamos el hilo de mensajes
        this.#msgThreads.splice(index, 1);
    }

    // Métodos para interacciones

    /**
     * Crea una interacción de vídeo
     * 
     * @param {string} url - La url de un objeto Video 
     */
    newVideoInteraction(url) {
        
        // Validamos que no haya otra interacción con la misma url
        for(let interacAnterior of this.#interacciones) {
            if(interacAnterior.url === url){
                // 📃 [===== LOG_VVV =====] 
                if(logs.verbosity >= 3) logs.vvv_error("Interaction already exists with the actual video", `url: ${url}`);
                throw new VideoInteractionError("Ya existe una interacción con ese vídeo", url);    
            }
                
        }

        // La interacción es única, la añadimos. Esto quiere decir que el usuario no ha visitado antes el video
        const interaction = new Interaction(url, 0);

        this.#interacciones.push(interaction);

        // 📃 [===== LOG_VV =====] 
        if(logs.verbosity >= 2) logs.vv_info("Video Interaction added", `url: ${url}`);
    }

    /**
     * Crea una interacción de vídeo
     * 
     * @param {string} url - La url de un objeto Video
     * @param {float} time - El tiempo de la interacción en segundos, del objeto Video
     */

    modVideoInteraction(url, time) {
        // Validamos que exista una interacción con ese vídeo
        if(!(this.#interacciones.some(interac => interac.url === url))){
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("Interaction doesn't exist with the actual video", `url: ${url}}`);
        
            throw new VideoInteractionError("No existe una interacción con ese vídeo", url);
        }

        let interaccion = this.#interacciones.find(interac => interac.url === url);
        
        // Modificamos el tiempo de la interacción
        interaccion.time = time;

    }
}

export class MessageThread {
    #user_src;
    #user_dst;
    #messages = [];

    // Constructor
    constructor(user_src, user_dst) { // Instancias de User
        if(!(user_src instanceof User) || !(user_dst instanceof User)){
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("There are users that are not instance of User");
            throw new UserError("Hay usuarios que no son instancia de User");
        }

        this.#user_src = user_src;
        this.#user_dst = user_dst;
    }

    // getters
    get user_src() {
        return this.#user_src;
    }

    get user_dst() {
        return this.#user_dst;
    }

    get messages() {
        return this.#messages;
    }

    // Métodos
    addMessage(message, user) { // "user" es el propio usuario que envía/añade un mensaje
        if(user === this.#user_src) {
            message = 's' + message;

        } else if(user === this.#user_dst) {
            message = 'd' + message;

        } else { // El usuario no coincide con el user_src ni el user_dst. El parámetro no se ha pasado correctamente
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("The user does not match user_src or user_dst", `username (local user): ${user.username}`);
            
            throw new MsgThreadError(`
                El usuario no coincide con user_src ni user_dst. El segundo parámetro debe ser el propio usuario.
            `, user.username);
        }

        this.#messages.push(message);
    }
    
    // "user" ES EL USUARIO PROPIETARIO DEL MENSAJE A ELIMINAR
    deleteMessage(message, user) {
        /**
         * Una forma de implementar la eliminación de un mensaje es seleccionarlo de la UI,
         * obtener el texto del contenido HTML de ese mensaje y pasarlo como parámetro a
         * este método.
         */
        if(user === this.#user_src) {
            message = 's' + message;

        } else if(user === this.#user_dst) {
            message = 'd' + message;

        } else { // El usuario no coincide con el user_src ni el user_dst. El parámetro no se ha pasado correctamente
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("The user does not match user_src or user_dst", `username (local user): ${user.username}`);
            
            throw new MsgThreadError(`
                El usuario no coincide con user_src ni user_dst. El segundo parámetro debe ser el propio usuario.
            `, user.username);
        }

        // Buscamos el mensaje en la lista de mensajes
        let index = this.#messages.indexOf(message);

        if(index === -1){
         // 📃 [===== LOG_VVV =====] 
         if(logs.verbosity >= 3) logs.vvv_error("Message not found", `username: ${user.username}, message: ${message}`);    
            throw new MsgThreadError("El mensaje no se ha encontrado", user.username, message);
        }

        // Eliminamos el mensaje
        this.#messages.splice(index, 1);
    }
}