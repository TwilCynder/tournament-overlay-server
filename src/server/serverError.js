import { FormattableError, printError } from "../common/error.js";

export class ServerError extends FormattableError {
    constructor(code, userMesssage, ...msg){
        if (msg.length == 0) msg[0] = userMesssage;
        super(...msg);
        this.userMesssage = userMesssage;
        this.code = code;
    }
}

/** @param {import ("express").Response} res  */
export function handleServerError(err, res){
    if (err instanceof ServerError){
        res.status(err.code).send(err.userMesssage);
    }
    printError(err);
}