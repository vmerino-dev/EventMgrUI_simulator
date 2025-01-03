"use strict";

/*
****************************************
            Events Classes
****************************************
*/

class EventMgr {
    #confEventUsers = {}; // {user: [confev1, confev2, ...]}
    #wrkshpEventUsers = {}; // {user: [wrkshp1, wrkshp2, ...]}

    // Métodos
    addConfEvent(conference, user){ // conference es un objeto ConferenceEvent
        if(this.#confEventUsers[user] == undefined){
            this.#confEventUsers[user] = [];
        }

        this.#confEventUsers[user].push(conference);
    }

    addWorkEvent(workshop, user){ // workshop es un objeto WorkshopEvent
        if(this.#wrkshpEventUsers[user] == undefined){
            this.#wrkshpEventUsers[user] = [];    
        }
        
        this.#wrkshpEventUsers[user].push(workshop);
    }
}

class Event { // Clase pseudo-abstracta
    #files = []; // Lista de archivos
    #videos = []; // Lista de objetos Video
    #location; // Ubicación del evento
    #date; // Fecha del evento
    
    #estado; // true: público, false: privado
    #users_selected = []; // Lista de usuarios seleccionados si es privado

    // Constructor
    constructor(files, videos, location, date, estado = true, users_selected = []){
        this.#files = files;
        this.#videos = videos;
        this.#location = location;
        this.#date = date;
        this.#estado = estado;

        if(estado == false){ // Si es privado se asignan usuaarios seleccionados
            this.#users_selected = users_selected;
        }
    }

    // getters
    get files(){
        return this.#files;
    }
    get videos(){
        return this.#videos;
    }
    get location(){
        return this.#location;
    }
    get date(){
        return this.#date;
    }
    get estado(){
        return this.#estado;
    }
    get users_selected(){
        if(estado)
            return null;
        
        return this.#users_selected;
    }
}

class ConferenceEvent extends Event { // Evento de conferencia
    #hayDirecto; // true: hay directo, false: no hay directo
    #stream; // Objeto ConferenceStream. SOLO PUEDE HABER UNO POR EVENTO

    constructor(files, videos, location, date, estado = true, users_selected = [], hayDirecto = false){
        super(files, videos, location, date, estado, users_selected);

        if(hayDirecto)
            this.#hayDirecto = true;
    }

    
    // Métodos para el stream (directo)

    // Método que lanza excepción si ya hay un directo programado
    addStream(date, durationAprox){ // Añadir un directo
        if(this.#hayDirecto)
            throw new ConferenceStreamError("Ya hay un directo programado", this.#hayDirecto, this.#stream);

        stream = new ConferenceStream(date, durationAprox);
        console.log("Directo añadido con fecha ${date} y duración aproximada de ${durationAprox} minutos");
    }

    // Modificar un directo. Si no se especifica fecha o duración se mantiene la actual
    modifyStream(date = this.#stream.date, durationAproxMin = this.#stream.duration){
        this.#stream.date = date;
        this.#stream.duration = durationAproxMin;
    }
}

class WorkshopEvent extends Event { // Evento de taller

    constructor(files, videos, location, date, estado = true, users_selected = []){
        super(files, videos, location, date, estado, users_selected);
    }
}

class ConferenceStream { // Clase para los directos de conferencias
    #date; // Hora de inicio del directo
    #durationAproxMin; // Duración aproximada del directo en MINUTOS

    constructor(date, durationAprox){
        this.#date = date;
        this.#durationAproxMin = durationAprox;
    }

    // getters
    get date(){
        return this.#date;
    }
    get duration(){
        return this.#durationAproxMin;
    }

    // setters
    set date(date){
        this.#date = date;
    }
    set duration(durationAprox){
        this.#durationAproxMin = durationAprox;
    }
}

class Video { // Clase para los vídeos
    #url; // URL del vídeo
    #title; // Título del vídeo
    #description; // Descripción del vídeo
    #tags = []; // Lista de etiquetas

    // Constructor
    constructor(url, title, description, tags = []){
        this.#url = url;
        this.#title = title;
        this.#description = description;
        this.#tags = tags;
    }

    // getters
    get url(){
        return this.#url;
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

class Interaction { // Interacciones con los vídeos por parte de los usuarios
    #id; // Identificador único interacción
    #urlVideo; // URL del vídeo (generalmente video.url)
    #time; // Tiempo de la interacción (float)

    // Constructor
    constructor(urlVideo, time){
        this.#urlVideo = urlVideo;
        this.#time = time;

        // Generar id único
        this.#id = Utils.createId();
    }

    // getters
    get id(){
        return this.#id;
    }
    get url(){
        return this.#urlVideo;
    }
    get time(){
        return this.#time;
    }

    // setters
    set time(time){
        this.#time = time;
    }
}