"use strict";

class Utils{
    static createId(){
        return crypto.randomUUID();
    }

    // Método que valida si la fecha es correcta y un mensaje indicando por qué no lo es
    static valFutureDate(date){ // Devuelve obj indicando validez fecha y msg
        if(isNaN(date.getTime()))
            return {validez: false, msg: "Fecha inválida"};

        if(date.getTime() <= Date.now())
            return {validez: false, msg: "Fecha anterior a la actual"};

        return {validez: true, msg: "Fecha válida"};
    }
}