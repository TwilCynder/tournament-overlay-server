import { Router } from "express";
import { handleServerError } from "./serverError.js";

/** @param {import("express").RequestHandler} f  */
function handledServerCallback(f){
    return (req, res) => {
        try {
            return f(req, res);
        } catch (err) {
            handleServerError(err, req, res);
        }
    }
}

/** @param {import("./dataManager").DataManager} dataManager  */
export function dataRouter(dataManager){
    const router = Router();
    router.all("/h2h", handledServerCallback((req, res) => {
        console.log("Request received", req.originalUrl, req.query);
        res.status(200).json({"OK": true});
    }));
    return router;
}