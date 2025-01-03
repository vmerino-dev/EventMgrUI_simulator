"use strict";

/*
****************************************
        User Message Classes
****************************************
*/

class UserMgr {
    #users = {}; // {id: user, id2: user2, ...}

    // getters
    get users() { // Devuelve un array con los usuarios. Deberá guardarse en IndexedDB
        return this.#users;
    }

    getUser(id) { // Devuelve un usuario
        return this.#users[id];
    }

    // Métodos
    addUser(username, email, passwd) {
        let user = new User(username, email, passwd);
        let id = Utils.createId(); // Generamos un UUID
        this.#users[id] = user;
    }

    deleteUser(id) {
        delete this.#users[id];
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
        // Crear excepción si el usuario ya existe
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
    set username(username) {
        this.#username = username;
    }
    set passwd(passwd) {
        this.#passwd = passwd;
    }

    // Métodos
    addConfEvent(conferenceEvent) {
        this.#conferenceEvents.push(conferenceEvent);
        eventMgr.addConfEvent(conferenceEvent, this.#username);
    }
    addWorkEvent(workshopEvent) {
        this.#worskhopEvents.push(workshopEvent);
        eventMgr.addWorkEvent(workshopEvent, this.#username);
    }
    createMessageThread(user_dst) { // user_dst es un objeto User
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