"use strict";

/*
****************************************
        User Message Classes
****************************************

La verbosidad se controla con la variable verbose en main.js
Va desde v (verbose) a vvv (muy verbose)

*/

// En una sesión de un usuario debe haber una variable que almacene el id de ese usuario
class UserMgr {
    #users = {}; // {id: user, id2: user2, ...}

    // getters
    get users() { // Devuelve un array con los usuarios. Deberá guardarse en IndexedDB
        return this.#users;
    }

    getUserId(id) { // Devuelve un usuario por su id
        return this.#users[id];
    }

    getUser(username) { // Devuelve un usuario por su nombre de usuario (username)
        return Object.values(this.#users).find(user => user.username === username);
    }

    // Métodos
    addUser(username, email, passwd) {

        // Validamos que exista el usuario y el email
        this.userExists(username); // Lanza excepción si el usuario ya existe

        if(Object.values(this.#users).some(user => user.email === email))
            throw new UserError("El email ya está en uso", username, email, passwd);

        // Validamos la contraseña
        this.passwdCorrect(passwd); // Lanza excepción si la contraseña no es válida

        let user = new User(username, email, passwd);
        let id = Utils.createId(); // Generamos un UUID
        this.#users[id] = user;
    }

    // Siempre que se deba modificar nombre de usuario, invocar este metodo, no setter de User (por la validación)
    modUsername(id, newUsername){
        // Validamos que el nuevo nombre de usuario no exista
        this.userExists(newUsername);

        this.#users[id].username = newUsername;
    }

    // Siempre que se deba modificar nombre de usuario, invocar este metodo, no setter de User (por la validación)
    modPasswd(id, newPasswd){
        // Validamos que el nuevo nombre de usuario no exista
        this.passwdCorrect(newPasswd);

        this.#users[id].passwd = newPasswd;
    }

    deleteUser(id) {
        this.userDontExists(this.#users[id].username); // Lanza excepción si el usuario no existe

        delete this.#users[id]; // Si existe lo eliminamos
    }

    createMessageThread(id_src, user_dst) { // Creamos un hilo de mensajes entre el usuario con id_src y el usuario user
        // Validamos que el usuario destino exista. De lo contrario, devolvemos excepción
        this.userDontExists(user_dst.username);
        
        // Si existe se creará el hilo de mensajes con user_dst
        this.#users[id_src].createMessageThread(user_dst);
    }

    // Métodos de validación
    userExists(username) { // Comprueba si el usuario ya existe con su nombre
        if(Object.values(this.#users).some(user => user.username === username))
            throw new UserError("El usuario ya existe", username);
    }

    userDontExists(username) { // Comprueba si el usuario no existe con su nombre
        if(!(Object.values(this.#users).some(user => user.username === username)))
            throw new UserError("El usuario no existe", username);
    }

    passwdCorrect(passwd) {
        // Validamos la contraseña con errores personalizados según el caso
        if(!/[A-Z]/.test(passwd)){
            throw new UserError("La contraseña debe contener al menos una letra mayúscula", undefined, undefined, passwd);
        
        } else if(!/[a-z]/.test(passwd)){
            throw new UserError("La contraseña debe contener al menos una letra minúscula", undefined, undefined, passwd);
        
        } else if(!/[0-9]/.test(passwd)){
            throw new UserError("La contraseña debe contener al menos un número", undefined, undefined, passwd);
        
        } else if(!/[!@#$%^&*(),.?":{}|<>]/.test(passwd)){
            throw new UserError("La contraseña debe contener al menos un carácter especial", undefined, undefined, passwd);
        }
    }
}

class User {
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
    set username(username) { // Modificar el nombre de usuario
        // NO SE DEBE LLAMAR a este setter directamente. La validación se hace en UserMgr
        this.#username = username;
    }
    set passwd(passwd) { // Modificar la contraseña
        // NO SE DEBE LLAMAR a este setter directamente. La validación se hace en UserMgr
        this.#passwd = passwd;
    }

    // Métodos
    addConfEvent(conferenceEvent) {
        this.#conferenceEvents.push(conferenceEvent);
        eventMgr.addConfEvent(conferenceEvent, this.#username); // Debe crearse el objeto para eventMgr (EventMgr)
    }
    addWorkEvent(workshopEvent) {
        this.#worskhopEvents.push(workshopEvent);
        eventMgr.addWorkEvent(workshopEvent, this.#username); // Debe crearse el objeto para eventMgr (EventMgr)
    }

    // Este método se invoca desde UserMgr para validación
    createMessageThread(user_dst) { // user_dst es un objeto User
        // Validamos que no exista ya un hilo de mensajes con user_dst
        if(this.#msgThreads.some(thread => thread.user_dst === user_dst))
            throw new UserError("Ya existe un hilo de mensajes con ese usuario", this.#username);

        let msgThread = new MessageThread(this, user_dst);
        this.#msgThreads.push(msgThread); // Hilo de msgs en user_src
        user_dst.#msgThreads.push(msgThread); // Hilo de msgs en user_dst
    }
    deleteMessageThread(user_dst) {
        // Filtramos la conversación con el usuario user_dst
        let msgThread = this.#msgThreads.find(thread => thread.user_dst === user_dst);
        
        // Buscamos su índice dentro de la lista de hilos de mensajes
        let index = this.#msgThreads.indexOf(msgThread);

        // Eliminamos el hilo de mensajes
        this.#msgThreads.splice(index, 1);
    }

    // Métodos para interacciones
    newVideoInteraction(url) {
        
        // Validamos que no haya otra interacción con la misma url
        for(let interacAnterior of this.#interacciones) {
            if(interacAnterior.url === url)
                throw new VideoInteractionError("Ya existe una interacción con ese vídeo", url);
        }

        // La interacción es única, la añadimos. Esto quiere decir que el usuario no ha visitado antes el video
        const interaction = new Interaction(url, 0);

        this.#interacciones.push(interaction);
    }

    modVideoInteraction(url, time) {
        const interaccion = this.#interacciones.find(interac => interac.url === url);

        // Validamos que exista una interacción con ese vídeo
        if(interaccion === undefined)
            throw new VideoInteractionError("No existe una interacción con ese vídeo", url);

        // Modificamos el tiempo de la interacción
        interaccion.time = time;
    }
}

class MessageThread {
    #user_src;
    #user_dst;
    #messages = [];

    // Constructor
    constructor(user_src, user_dst) {
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
    addMessage(message, user) {
        if(user === this.#user_src) {
            message = 's'+message;
        }
        else if(user === this.#user_dst) {
            message = 'd'+message;
        }

        this.#messages.push(message);
    }
    
    deleteMessage(message) {
       // Buscamos el mensaje en la lista de mensajes
        let index = this.#messages.indexOf(message);

        // Eliminamos el mensaje
        this.#messages.splice(index, 1);
    }
}