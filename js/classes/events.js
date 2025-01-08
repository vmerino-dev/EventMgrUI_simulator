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

        // Valida si algún elemento video no es instancia de Video
        if(!videos.every(video => video instanceof Video))
            throw new VideoError("Hay algún elemento que no es un video", videos);

        // Validamos la fecha
        const validateDate = Object.values(Utils.valFutureDate(date));
        if(!validateDate[0])
            throw new DateError(validateDate[1], date);

        this.#files = files;
        this.#videos = videos;
        this.#location = location;
        this.#date = date;
        this.#estado = estado;

        if(!estado) // Si es privado se asignan usuarios seleccionados
            this.#users_selected = users_selected;

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
        if(this.#estado)
            return null;
        
        return this.#users_selected;
    }
}

class ConferenceEvent extends Event { // Evento de conferencia
    #id;
    #hayDirecto = false; // true: hay directo, false: no hay directo
    #stream; // Objeto ConferenceStream. SOLO PUEDE HABER UNO POR EVENTO

    constructor(files, videos, location, date, estado = true, users_selected = []){
        super(files, videos, location, date, estado, users_selected);

        this.#id = Utils.createId();
    }

    // getters
    get hayDirecto(){
        return this.#hayDirecto;
    }

    get id(){
        return this.#id;
    }

    get stream(){
        return this.#stream;
    }

    
    /* Métodos para el stream (directo) */

    // Método que lanza excepción si ya hay un directo programado
    addStream(date, durationAprox){ // Añadir un directo

        if(this.#hayDirecto)
            throw new ConferenceStreamError("Ya hay un directo programado", this.#hayDirecto, this.#stream);

        // Validamos si la fecha es correcta (superior a la actual)
        const validateDate = Object.values(Utils.valFutureDate(date));
        if(!validateDate[0]) // Si la fecha no es válida
            throw new DateError(validateDate[1], date); // validateDate[1] es el mensaje que indica por qué no es válida

        // Validamos duración aproximada del stream
        if(durationAprox < 0 && durationAprox < 1440)
            throw new ConferenceStreamError("El directo debe durar entre 1 minuto y 24 horas", this.#hayDirecto, this.#stream);

        this.#stream = new ConferenceStream(date, durationAprox);
        console.log(`Directo añadido con fecha ${date} y duración aproximada de ${durationAprox} minutos`);
        
        this.#hayDirecto = true;
    }

    // Modificar un directo. Si no se especifica fecha o duración se mantiene la actual
    modifyStream(date = this.#stream.date, durationAproxMin = this.#stream.duration){

        // Validamos si la fecha es correcta (superior a la actual)
        const validateDate = Object.values(Utils.valFutureDate(date));
        if(!validateDate[0]) // Si la fecha no es válida
            throw new DateError(validateDate[1], date); // validateDate[1] es el mensaje que indica por qué no es válida

        // Validamos duración aproximada del stream
        if(durationAprox < 0 && durationAprox < 1440)
            throw new ConferenceStreamError("El directo debe durar entre 1 minuto y 24 horas", this.#hayDirecto, this.#stream);


        this.#stream.date = date;
        this.#stream.duration = durationAproxMin;
    }
}

class WorkshopEvent extends Event { // Evento de taller
    #id;
    #topic; // Tema del taller
    #instructors = []; // Lista de nombres de los instructores (string array)

    constructor(files, videos, location, date, estado = true, users_selected = [], topic, instructors){
        super(files, videos, location, date, estado, users_selected);

        this.#topic = topic;
        this.#instructors = instructors;

        this.#id = Utils.createId();
    }

    get id(){
        return this.#id;
    }

    get topic(){
        return this.#topic;
    }
    get instructors(){
        return this.#instructors;
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