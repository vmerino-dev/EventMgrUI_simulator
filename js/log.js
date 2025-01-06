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
        if (typeof verbosity !== 'string' || (verbosity !== "v" && verbosity !== "vv" && verbosity !== "vvv" && verbosity !== "vvvv")) {
            throw new Error("El nivel de verbosidad debe estar entre 1 y 4");
        }
        this.#verbosity = verbosity;
    }
}

const logMgr = new Log();
export default logMgr;