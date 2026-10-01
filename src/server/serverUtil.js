import { handleServerError } from "./serverError.js";

/** @param {import("express").RequestHandler} f  */
export function handledServerCallback(f){
    return async (req, res) => {
        try {
            return await f(req, res);
        } catch (err) {
            handleServerError(err, req, res);
        }
    }
}