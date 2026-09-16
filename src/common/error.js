export class FormattableError extends Error {    
    constructor(cause, ...msgParts){
        if (cause instanceof FormattableError){
            msgParts.push(":", ...cause.msgParts);
        } else {
            msgParts.push(":", cause);
        }
        
        super(msgParts.join(" "), {cause});
        this.msgParts = msgParts;
    }

    setCause(err){
        this.cause = err;
        return this;
    }
}

export function NoCauseFormattableError(...msgParts){
    return new FormattableError(null, msgParts);
}

/** @param {Error} error  */
function unpackError(error){
    if (error instanceof FormattableError){
        return error.msgParts;
    }
    return [error];
}

/** @param {Error} error  */
export function printError(error){
    console.error(...unpackError(error));
}

/** @param {number} code @param {...any} message  */
export function error(code, ...message){
    console.error(...(message.map(msg => unpackError(msg)).flat()))
    process.exit(code);
}