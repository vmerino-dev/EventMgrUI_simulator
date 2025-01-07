"use strict";

/* log.js */

class Log {
    #verbosity; // De v a vvvv

    constructor(verbosity = "v"){
        this.#verbosity = verbosity;
    }

    get verbosity(){
        return this.#verbosity.length;
    }

    set verbosity(verbosity){
        this.setVerbosity(verbosity)
    }

    setVerbosity(verbosity) {
        if (typeof verbosity !== 'string' || (verbosity !== "" || verbosity !== "v" && verbosity !== "vv" && verbosity !== "vvv" && verbosity !== "vvvv")) {
            throw new Error("El nivel de verbosidad debe estar entre 1 y 4");
        }
        this.#verbosity = verbosity;
    }

    getLogDate(){
        return new Date().toISOString().replace("T"," ").replace("Z", "");
    }

    logAction(){
        ; // Acción a realizar para los logs (almacenamiento en browser)
    }

    v_info(msg, params = 0){
        console.info(`${logs.getLogDate()} [INFO] ${msg} => ${params}`, this.logAction());
    }

    vv_info(msg, params = 0){
        console.info(`${logs.getLogDate()} [INFO] ${msg} => ${params}`, this.logAction());
    }

    vv_warn(msg, params = 0){
        console.warn(`${logs.getLogDate()} [WARNING] ${msg} => ${params}`, this.logAction());
    }
}

const logs = new Log();
console.log(logs.verbosity);
export default logs;