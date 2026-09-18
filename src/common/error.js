import util from "util"

/** @param {string[]} strings */
export function fmtS(strings, ...values){
    const res = [];
    for (let i = 0; i < values.length; i++){
        res.push(strings[i]);
        res.push(values[i]);
    }
    res.push(strings[values.length]);

    return res;
}

class FormatValue {
    constructor(base, formatted){
        this.base = base; this.formatted = formatted;
    }

    toString(){
        return "" + this.base;
    }
}

export class LimitedDepthObject extends FormatValue {
    constructor(obj, depth){
        super(obj, util.inspect(obj, false, depth, true))
    }
}

function formatMsgPart(part){
    if (typeof part === "string") return part;
    if (part instanceof FormatValue) return part.formatted;
    return util.inspect(part, false, null, true);
}

export class FormattableError extends Error {
    #fmtMsg;
    constructor(cause, ...msgParts){
        super(msgParts.join(" "), {cause});
        let fmtMsg = msgParts.map(formatMsgPart).join(" ");
        if (cause instanceof FormattableError) fmtMsg += " : " + cause.fmtMsg;
        this.#fmtMsg = fmtMsg;
    }

    toFormatString(){
        return this.#fmtMsg + "\n" + util.inspect(this);
    }
}

export function NoCauseFormattableError(...msgParts){
    return new FormattableError(null, ...msgParts);
}

/** @param {Error} error  */
function formatError(error){
    return (error instanceof FormattableError ? error.toFormatString() : error);
}

export function printError(...message){
    console.error(...(message.map(formatError)));
}

/** @param {number} code @param {...any} message  */
export function error(code, ...message){
    printError(...message);
    process.exit(code);
}

//Notes pour plus tard : le truc de this.#fmtMsg et tout ce qui va avec, c'est l'alternative à une autre solution bcp plus simple à implémnter, où la string formatée serait directement le message de l'erreur. Le problème de cette alternative est qu'on a des caractères (terminal escape) de style dans le message de l'exception et ça je veux éviter, mais c'est peut être pas si grave dont amediter