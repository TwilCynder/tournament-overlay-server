import { Router } from "express";
import { handledHTTPServerCallback, handledServerCallback } from "./httpServerCommon";

/** @param {import("./dataManager").DataManager} dataManager  */
export function dataRouter(dataManager){
    const router = Router();
    router.use((_, res, next) => {
        res.type('application/json');
        res.setHeader("Access-Control-Allow-Origin", "*");
        next();
    });

    router.all("/h2h", handledHTTPServerCallback((req, res) => {
        const h2h = dataManager.getH2H(
            {id: req.query.p1, name: req.query.p1Name},
            {id: req.query.p2, name: req.query.p2Name}
        );

        res.status(200).json(h2h);
    }));
    return router;
}