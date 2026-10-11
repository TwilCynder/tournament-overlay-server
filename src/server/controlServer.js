//TODO : implement operation IDs

import { WebSocketServer } from "ws";
import { FormattableError } from "../common/error.js";
import { sendJSON } from "../../uiWebsite/src/WSUtil.js";

/** @param {WebSocket} ws @param {import("./wsProtocol").OperationFeedbackStatus} status @param {string?} message  */
function sendOperationFeedback(ws, status, message){
    sendJSON(ws, {
        type: "operation-feedback",
        status,
        message
    });
}

/**
 * Sends an error message through websocket based on the Error that happened : uses the user-friendly message if it's a ServerError
 * @param {WebSocket} ws @param {Error} err 
 */
function handleWSServerError(ws, err){
    const message = getServerErrorMessage(err);

    sendOperationFeedback(ws, "error", message);

    printError("Error while processing WS request :", err);
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

                /** @type {import("./wsProtocol").WSControlMessageIncoming} */
                let msg = JSON.parse(rawMsg.toString());
                console.log(msg);

                switch (msg.op){
                    case "load-data":
                        dataManager.load(msg.url);
                        break;
                    case "retry-load-data":
                        break;
                }

                sendOperationFeedback(ws, "ok");
            } catch (err) {
                handleWSServerError(ws, err)
            }

        })
    })
}