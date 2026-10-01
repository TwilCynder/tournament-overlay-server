import { raw, Router } from "express";
import { handledServerCallback } from "./serverUtil.js";
import { WebSocketServer } from "ws";
import { FormattableError } from "../common/error.js";

/** @param {import("./dataManager").DataManager} dataManager  */
export function controlRouter(dataManager){
    const router = Router();

    router.all("/try-load-event", handledServerCallback(async (req, res, next) => {
        await dataManager.load();
        res.status(200).send();
    }))
}

/**
 * @param {import("./dataManager.js").DataManager} dataManager 
 * @param {WebSocketServer} wss 
 */
export function initWS(wss, dataManager){
    wss.on("connection", (ws, _req) => {
        ws.on("message", (rawMsg, isBinary) => {
            try {
                if (isBinary) throw new FormattableError(null, "Invalid message received : binary message");

                /** @type {import("./wsProtocol").WSControlMessage} */
                let msg = JSON.parse(rawMsg.toString());
                console.log(msg);

                switch (msg.op){
                    case "load-data":
                        dataManager.load(msg.url);
                        break;
                    case "retry-load-data":
                        break;
                }
            } catch (err) {
                console.error("Error while processing WS message :", err);
            }

        })
    })
}