import { FormattableError, printError } from "../common/error.js";

export class ServerError extends FormattableError {
    constructor(code, cause, userMesssage, ...msg){
        if (msg.length == 0) msg[0] = userMesssage;
        if (cause instanceof ServerError) userMesssage += " : " + cause.userMesssage;
        super(cause, ...msg);
        this.userMesssage = userMesssage;
        this.code = code;
    }
}

/** @param {Error} err  @param {import ("express").Response} res @param {import("express").Request} req  */
export function handleServerError(err, req, res){
    if (err instanceof ServerError){
        res.status(err.code).send(err.userMesssage);
    }
    printError("Error while processing request", req, err);
}