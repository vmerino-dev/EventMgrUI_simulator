"use strict";

/*
****************************************
        Excepciones en eventos
****************************************
*/

// Error al crear usuario
class UserError extends Error {
    #username;
    #email;
    #passwd;

    constructor(message, username, email = undefined, passwd = undefined){
        super(message); // Propiedad message de Error

        this.#username = username;
        this.#email = email;
        this.#passwd = passwd;
    }

    get username(){
        return this.#username;
    }
    get email(){
        return this.#email;
    }
    get passwd(){
        return this.#passwd;
    }
}

// Error al añadir stream
class ConferenceStreamError extends Error {
    #hayDirecto;
    #stream;

    constructor(message, hayDirecto, stream){
        super(message); // Propiedad message de Error

        this.#hayDirecto = hayDirecto;
        this.#stream = stream;
    }

    get streamState(){
        return this.#hayDirecto;
    }
    get stream(){
        return this.#stream;
    }
}

// Error al interactuar con un vídeo
class VideoInteractionError extends Error {
    #url;

    constructor(message, url){
        super(message);

        this.#url = url;
    }

    get url(){
        return this.#url;
    }
}