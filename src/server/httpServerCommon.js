import { getServerErrorMessage } from "./serverError.js";

/** 
 * Send a Response based on the Error that happened : uses the user-friendly message if its a ServerError, and the status code if it's also a HTTPServerError
 * Maybe I should be sending the full error message in any case so it can be displayed in the console ?
 * @param {Error} err  @param {import ("express").Response} res @param {import("express").Request} req  
 */
export function handleHTTPServerError(err, req, res){
    const code = err instanceof HTTPServerError ? err.code : 500;
    const message = getServerErrorMessage(err);

    res.status(code).type('txt').send(message);

    printError("Error while processing HTTP request :", err);
}

/** @param {import("express").RequestHandler} f  */
export function handledHTTPServerCallback(f){
    return async (req, res) => {
        try {
            return await f(req, res);
        } catch (err) {
            handleHTTPServerError(err, req, res);
        }
    }
}