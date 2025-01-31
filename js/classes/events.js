"use strict";

/*
****************************************
            Events Classes
****************************************

La verbosidad se controla con la variable verbose en main.js
Va desde v (verbose) a vvvv (muy verbose)

*/

/*********************
*   Importaciones
*********************/

import logs from "../log.js";
import Utils from "../utils.js";
import { userMgr } from "../idb.js";
import { UserError, VideoError, DateError, ConferenceStreamError, WorkshopError, VideoInteractionError } from "../errors/eventErrors.js";

export class EventMgr {
    confEventUsers = {}; // {user: [confev1, confev2, ...]}
    wrkshpEventUsers = {}; // {user: [wrkshp1, wrkshp2, ...]}

    // Métodos
    addConfEvent(conference, user){ // conference es un objeto ConferenceEvent
        if(this.confEventUsers[user] == undefined){
            this.confEventUsers[user] = [];
        }

        this.confEventUsers[user].push(conference);
    }

    addWorkEvent(workshop, user){ // workshop es un objeto WorkshopEvent
        if(this.wrkshpEventUsers[user] == undefined){
            this.wrkshpEventUsers[user] = [];    
        }
        
        this.wrkshpEventUsers[user].push(workshop);
    }
}

export class Event { // Clase pseudo-abstracta
    files = []; // Lista de archivos
    videos = []; // Lista de objetos Video
    location; // Ubicación del evento
    date; // Fecha del evento
    
    estado; // true: público, false: privado
    users_selected = []; // Lista de usuarios seleccionados si es privado (strings)

    // Constructor
    constructor(files, videos, location, date, estado = true, users_selected = []){

        // Valida si algún elemento video no es instancia de Video
        if(!videos.every(video => video instanceof Video)){
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("Some element is not a video", `videos: ${videos}`);
            
            throw new VideoError("Hay algún elemento que no es un video", videos);
        }

        // Validamos la fecha
        const validateDate = Object.values(Utils.valFutureDate(date));
        if(!validateDate[0]){
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("Invalid date", `date: ${date}}`);
            throw new DateError(validateDate[1], date);
        }

        this.files = files;
        this.videos = videos;
        this.location = location;
        this.date = date;
        this.estado = estado;

        if(!estado){ // Si es privado se asignan usuarios seleccionados
            
            /*
            if(userMgr)

            Si el gestor de usuarios no es undefined o null, se validan los usuarios.
            Esto se hace porque el constructor es llamado antes de crearse el gestor,
            para instanciar los objetos Event a raíz de los objetos planos
            obtenidos de IDB. Al ser un proyecto de práctica y no de producción, supondré
            que al instanciar los Event los usuarios son válidos, ya que igualmente
            se validan al crearse el objeto por primera vez.
            */
            if(userMgr){
                if(users_selected.some(username_sel => !Object.values(userMgr.users).some(user => user.username === username_sel))){
                    // 📃 [===== LOG_VVV =====] 
                    if(logs.verbosity >= 3) logs.vvv_error("The user does not exist");
                    throw new UserError("El usuario no existe."); // Se ha seleccionado un usuario que no existe
                }
            }

            this.users_selected = users_selected;
        }
    }
}

export class ConferenceEvent extends Event { // Evento de conferencia
    id;
    hayDirecto = false; // true: hay directo, false: no hay directo
    stream; // Objeto ConferenceStream. SOLO PUEDE HABER UNO POR EVENTO

    constructor(files, videos, location, date, estado = true, users_selected = [], hayDirecto = false, stream = undefined){
        super(files, videos, location, date, estado, users_selected);

        this.hayDirecto = hayDirecto;
        
        // Si el stream se ha instanciado pero sus propiedades no están definidas, no debería instanciarse y la propiedad pasa a undefined
        if(!stream.date && !stream.durationAproxMin){
            this.stream = undefined;
        } else {
            this.stream = stream;
        }

        this.id = Utils.createId();
    }
    
    /* Métodos para el stream (directo) */

    // Método que lanza excepción si ya hay un directo programado
    addStream(date, durationAprox){ // Añadir un directo

        if(this.hayDirecto){
            // 📃 [===== LOG_VVV =====] 
            if(logs.verbosity >= 3) logs.vvv_error("There are a stream scheduled");
            throw new ConferenceStreamError("Ya hay un directo programado", this.hayDirecto, this.stream);
        }

        // Validamos si la fecha es correcta (superior a la actual)
        const validateDate = Object.values(Utils.valFutureDate(date));
        if(!validateDate[0]) // Si la fecha no es válida
            throw new DateError(validateDate[1], date); // validateDate[1] es el mensaje que indica por qué no es válida

        // Validamos duración aproximada del stream
        if(durationAprox < 0 && durationAprox < 1440){
            // 📃 [===== LOG_VVV =====]
            if(logs.verbosity >= 3) logs.vvv_error("The stream does not last between 1 minute and 24 hours", `hayDirecto: ${this.hayDirecto}, stream: ${this.sstream}`);
            throw new ConferenceStreamError("El directo debe durar entre 1 minuto y 24 horas", this.hayDirecto, this.stream);
        }

        this.stream = new ConferenceStream(date, durationAprox);        
        this.hayDirecto = true;

        // 📃 [===== LOG_V =====] 
        if(logs.verbosity >= 1) logs.v_info("Stream added", `date: ${date}, durationAprox: ${durationAprox}`)
    }

    // Modificar un directo. Si no se especifica fecha o duración se mantiene la actual
    modifyStream(date = this.stream.date, durationAproxMin = this.stream.duration){

        // 📃 [===== LOG_VV =====] 
        if(logs.verbosity >= 2) logs.vv_warn(`The stream ${this.id} will be modified`, `date: ${date}, durationAprox: ${durationAproxMin}`);

        // Validamos si la fecha es correcta (superior a la actual)
        const validateDate = Object.values(Utils.valFutureDate(date));
        if(!validateDate[0]){ // Si la fecha no es válida
            // 📃 [===== LOG_VVV =====]
            if(logs.verbosity >= 3) logs.vvv_error("Invalid date", `date: ${date}`);
            throw new DateError(validateDate[1], date); // validateDate[1] es el mensaje que indica por qué no es válida
        }

        // Validamos duración aproximada del stream
        if(durationAproxMin < 0 && durationAproxMin < 1440){
            // 📃 [===== LOG_VVV =====]
            if(logs.verbosity >= 3) logs.vvv_error("The stream does not last between 1 minute and 24 hours", `hayDirecto: ${this.hayDirecto}, stream: ${this.stream}`);
            throw new ConferenceStreamError("El directo debe durar entre 1 minuto y 24 horas", this.hayDirecto, this.stream);
        }

        this.stream.date = date;
        this.stream.duration = durationAproxMin;

        // 📃 [===== LOG_V =====] 
        if(logs.verbosity >= 1) logs.v_info("Stream modified", `date: ${date}, durationAprox: ${durationAproxMin}`)
    }
}

export class WorkshopEvent extends Event { // Evento de taller
    id;
    topic; // Tema del taller
    instructors = []; // Lista de nombres de los instructores (string array)

    constructor(files, videos, location, date, estado = true, users_selected = [], topic, instructors = [], id = undefined){
        super(files, videos, location, date, estado, users_selected);

        // Se valida el tema e instructores
        if(topic.length > 80) // Longitud del string
            throw new WorkshopError("El tema del taller supera el límite marcado de 80 caracteres", this, topic);

        if(instructors.length > 20) // Longitud del array
            throw new WorkshopError("No pueden haber más de 20 instructores", this, undefined, instructors);

        if(instructors.some(instructor => instructor.length > 50 || instructor.length < 3))
            throw new WorkshopError("El nombre de los instructores no puede ser superior a 50 caracteres ni inferior a 3", this, undefined, instructors);

        // 📃 [===== LOG_VV =====] 
        if(logs.verbosity >= 2) logs.vv_info("Workshop fields validated", `topic: ${topic}, instructors: ${instructors.join("; ")}`);

        this.topic = topic;
        this.instructors = instructors;

        this.id = Utils.createId();

        /**
         * Si parámetro id != undefined, se está instanciando de objeto plano a objeto de clase el evento, con
         * lo cual se asina el id que conserva el objeto plano obtenido de IDB.
         */
        if(id) {
            this.id = id
        }
    }
}

export class ConferenceStream { // Clase para los directos de conferencias
    // Estas propiedades no deben establecerse desde aquí
    date; // Hora de inicio del directo
    durationAproxMin; // Duración aproximada del directo en MINUTOS

    constructor(date = undefined, durationAprox = undefined){

        // La validación ya se realiza en ConferenceEvent
        this.date = date;
        this.durationAproxMin = durationAprox;
    }
}

export class Video { // Clase para los vídeos
    url; // URL del vídeo
    title; // Título del vídeo (string)
    description; // Descripción del vídeo
    tags; // Lista de etiquetas

    // Constructor
    constructor(url, title, description, tags){
        
        // Validación campos
        if(title.length > 100)
            throw new VideoError("El título es demasiado largo (max: 100 carac.)", this, null, title);
        else if(title.length < 3)
            throw new VideoError("El título es demasiado corto (min: 3 carac.)", this, null, title);

        if(description.length > 500)
            throw new VideoError("La descripción no puede superar los 500 caracteres", this, null, title, description);

        if(/^(#[a-zA-Z0-9]{1,30})(\s#[a-zA-Z0-9]{1,30}){0,9}$/.test(tags)) // 10 tags de 30 caracteres cada uno
            throw new VideoError("Deben haber 10 tags máximo y no se permiten más de 30 carac. por cada uno", this, null, title, description, tags);

        // 📃 [===== LOG_VV =====] 
        if(logs.verbosity >= 2) logs.vv_info("Video fields validated", `url: ${url}, title: ${title}`);

        this.url = url;
        this.title = title;
        this.description = description;
        this.tags = tags;

        // 📃 [===== LOG_V =====] 
        if(logs.verbosity >= 1) logs.v_info("Video created", `url: ${url}, title: ${title}`)
    }
}

export class Interaction { // Interacciones con los vídeos por parte de los usuarios
    id; // Identificador único interacción
    urlVideo; // URL del vídeo (generalmente video.url)
    time; // Tiempo de la interacción (float) en segundos

    // Constructor
    constructor(urlVideo, time){
        
        if(time > 86400 || time < 0){ // time debe ser superior a "-1" e inferior a 24 horas
            // 📃 [===== LOG_VVV =====]
            if(logs.verbosity >= 3) logs.vvv_error("Interaction time do not valid", `urlVideo: ${urlVideo}`);
            throw new VideoInteractionError("El tiempo de la interacción no es válido", urlVideo);
        }

        this.urlVideo = urlVideo;
        this.time = time;

        // Generar id único
        this.id = Utils.createId();
    }
}