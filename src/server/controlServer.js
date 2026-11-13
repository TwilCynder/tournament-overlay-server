//TODO : implement operation IDs
/*
A terme, il faudrait que le client garde tous les messages envoyés et les trie par opération, de manière à pouvoir afficher :
- juste le dernier message sur la dernière opération
- le dernier message sur chaque opération (de manière à pouvoir voir le statut actuel, mais aussi un historique des opérations avec leur résultat)
- un historique complet des messages

ne pas oublier : à terme on pourra déclencher un build depuis l'UI, donc ça fera une très grosse masse de msgs pour une seule opération

Rewrite typescript : fonctions créant les objets message ; le type sera dérivé des valeurs de retour de ces fonctions
*/

import { WebSocketServer } from "ws";
import { FormattableError } from "../common/error.js";

/** @param {WebSocket} ws @param {*} obj  */
function sendJSON(ws, obj){
    ws.send(JSON.stringify(obj))
}

/** @param {WebSocket} ws @param {import("./wsProtocol").OperationFeedbackStatus} feedbackStatus @param {string?} message  */
function sendOperationFeedback(ws, feedbackStatus, message){
    sendJSON(ws, {
        type: "operation-feedback",
        status: feedbackStatus,
        message
    });
}

/**
 * @param {WebSocket} ws 
 * @param {import("./wsProtocol").Status} status 
 */
function sendStatus(ws, status){
    sendJSON(ws, Object.assign(status, {type: "status"}))
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

/** @param {import("./dataManager.js").DataManager} dm @returns {import("./wsProtocol").Status}*/
function getStatus(dm){
    const slug = dm.getEvent();
    if (!slug) return {mode: "nothing-loaded"};

    const data = dm.tryGetData();
    return data ?
        {mode: "data-loaded", slug, numEntrants: data.players.length} : 
        {mode: "event-set", slug} 
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

                let processed = false;
                switch (msg.op){
                    case "load-data":
                        dataManager.load(msg.url).then((success) => {
                            sendOperationFeedback(ws, "success", "Loaded event from TSH ; data file " + (success ? "loaded" : "not found"));
                        });
                        break;
                    case "retry-load-data":
                        break;
                    case "reset": 
                        dataManager.unloadEvent();
                        sendOperationFeedback(ws, "success");
                        processed = true;
                        break;
                }

                if (!processed) sendOperationFeedback(ws, "ok");
            } catch (err) {
                handleWSServerError(ws, err)
            }
        })

        sendStatus(ws, getStatus(dataManager));
    })

    dataManager.addListener("dataChanged", () => {
        const status = getStatus(dataManager);
        for (const ws of wss.clients){
            sendStatus(ws, status);
        }
    })
}