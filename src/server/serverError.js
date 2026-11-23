import { sendJSON } from "../../uiWebsite/src/WSUtil.js";
import { FormattableError, printError } from "../common/error.js";

/**
 * Error with a message we can dislpay to the user if it happens while treating a request
 */
export class ServerError extends FormattableError {
    constructor(cause, userMesssage, ...msg){
        //if (msg.length == 0) msg[0] = userMesssage;
        if (msg.length > 0) msg.unshift("-"); //le message final sera (userMessage, ...msg) ; si il y a bien un msg, on insère un - entre la partie user et la partie additionnelle
        msg.unshift(userMesssage);
        userMesssage == userMesssage ?? "Unknown Error";
        if (cause instanceof ServerError) userMesssage += " : " + cause.userMesssage;
        if (typeof cause == "string") userMesssage += " : " + cause;
        super(cause, ...msg);
        this.userMesssage = userMesssage;
    }
}

/**
 * ServerError with an HTTP status code, to be added to the error response if it happens while treating an HTTP request
 */
export class HTTPServerError extends ServerError {
    constructor(code, cause, userMesssage, ...msg){
        super(cause, userMesssage, ...msg);
        this.code = code;
    }
}

/** @param {Error} err  */
export function getServerErrorMessage(err){
    return err instanceof ServerError ? ("Error : " + err.userMesssage) : "Internal error";
}
