import { Router } from "express";
import { handleServerError, ServerError } from "./serverError.js";

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
    router.use((_, res, next) => {
        res.type('application/json');
        next();
    });
    router.all("/h2h", handledServerCallback((req, res) => {
        const h2h = dataManager.getH2H(
            {id: req.query.p1, name: req.query.p1Name},
            {id: req.query.p2, name: req.query.p2Name}
        );

        res.status(200).json(h2h);
    }));
    return router;
}