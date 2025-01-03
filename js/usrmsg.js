
/*
****************************************
        User Message Classes
****************************************
*/

class User {
    // Propiedades privadas
    #username;
    #email;
    #passwd;

    #conferenceEvents = [];
    #worskhopEvents = [];
    #msgThreads = [];

    // Constructor
    constructor(username, email, passwd) {
        // Crear excepción si el usuario ya existe
        this.#username = username;
        this.#email = email;
        this.#passwd = passwd;
    }

    // getters
    get username() {
        return this.#username;
    }

    get email() {
        return this.#email;
    }

    get passwd(){
        return this.#passwd;
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