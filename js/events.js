
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

let eventMgr = new EventMgr();

class Event {

}

class ConferenceEvent extends Event {

}

class WorkshopEvent extends Event {

}