"use strict";

/*
****************************************
        Excepciones en eventos
****************************************
*/

// Error al crear usuario
export class UserError extends Error {
    #username;
    #email;
    #passwd;

    constructor(message, username = undefined, email = undefined, passwd = undefined){
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

export class EmailError extends UserError { // Clase hija de UserError
    constructor(message, username = undefined, email = undefined, passwd = undefined){
        super(message, username, email, passwd);
    }
}

export class PasswdError extends UserError { // Clase hija de UserError
    constructor(message, username = undefined, email = undefined, passwd = undefined){
        super(message, username, email, passwd);
    }
}

// Error con un hilo de msg
export class MsgThreadError extends Error {
    #username
    #msgInThread

    constructor(message, username = undefined, msgInThread = undefined){
        super(message); // Propiedad message de Error

        this.#username = username;
        this.#msgInThread = msgInThread;
    }

    get username(){
        return this.#username;
    }
    
    get msgInThread(){
        return this.#msgInThread;
    }
}

// Error con los Workshop Events
export class WorkshopError extends Error {
    #topic;
    #instructors;
    #wkspObj;

    constructor(msg, wskObj, topic = undefined, instructors = []){
        super(msg);

        this.#wkspObj = wskObj;
        this.#topic = topic;
        this.#instructors = instructors;
    }

    get topic(){
        return this.#topic;
    }

    get instructors(){
        return this.#instructors;
    }

    get workshop(){
        return this.#wkspObj;
    }
}


// Error al añadir stream
export class ConferenceStreamError extends Error {
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

export class VideoError extends Error {
    #video; // Obj. Video
    #videos; // Array de Video
    
    #title; // Título del vídeo
    #description; // Descripción del vídeo
    #tags; // Tags del vídeo

    constructor(msg, video = undefined, videos = null, title = undefined, description = undefined, tags = undefined){
        super(msg);

        this.#video = video;
        this.#videos = videos || [];
        this.#title = title;
        this.#description = description;
        this.#tags = tags;
    }

    get video(){
        return this.#video;
    }

    get videos(){
        return this.#videos;
    }

    get title(){
        return this.#title;
    }

    get description(){
        return this.#description;
    }

    get tags(){
        return this.#tags;
    }
}

// Error al interactuar con un vídeo
export class VideoInteractionError extends Error {
    #url;

    constructor(message, url){
        super(message);

        this.#url = url;
    }

    get url(){
        return this.#url;
    }
}

// Error en una fecha
export class DateError extends Error {
    #date;
    
    constructor(msg, date){
        super(msg);

        this.#date = date;
    }

    get date(){
        return this.#date;
    }
}