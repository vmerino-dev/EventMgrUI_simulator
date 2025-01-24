"use strict";

/*
****************************************
        Excepciones en IDB
****************************************
*/

// IDB Error
export class IDBError extends Error {
    #request;
    #db;

    constructor(msg, request = null, db = null){
        super(msg);

        this.#request = request;
        this.#db = db;
    }

    get request(){
        return this.#request;
    }

    get db(){
        return this.#db;
    }
}