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
import { FormattableError, printError } from "../common/error.js";
import { getServerErrorMessage } from "./serverError.js";

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

/** @param {string?} slug @param {ReturnType<import("./dataManager.js").DataManager['tryGetData']>} data   @returns {import("./wsProtocol").Status}*/
function getStatus(slug, data){
    console.log(slug, data)
    if (!slug) return {mode: "nothing-loaded"};

    return data ?
        {mode: "data-loaded", slug, numEntrants: data.players.length} : 
        {mode: "event-set", slug} 
}

/** @param {import("./dataManager.js").DataManager} dm  */
function getDMStatus(dm){
    return getStatus(dm.getEvent(), dm.tryGetData());
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

                const errHandler = handleWSServerError.bind(null, ws);

                let processed = false;
                switch (msg.op){
                    case "load-data":
                        dataManager.load(msg.url).then((success) => {
                            sendOperationFeedback(ws, "success", "Loaded event from TSH ; data file " + (success ? "loaded" : "not found"));
                        }).catch(errHandler);
                        break;
                    case "retry-load-data":
                        dataManager.loadCurrentEvent().then((success) => {
                            sendOperationFeedback(ws, "success", "Loaded event from TSH ; data file " + (success ? "loaded" : "not found"));
                        }).catch(errHandler);
                        break;
                    case "build-data":
                        dataManager.build({sggog_addr: msg.sggog_addr, slow_mode: !msg.fast_mode}).then(() => {
                            sendOperationFeedback(ws, "success");
                        }).catch(errHandler);
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

        sendStatus(ws, getDMStatus(dataManager));
    })

    dataManager.addListener("dataChanged", (slug, data) => {
        const status = getStatus(slug, data);
        for (const ws of wss.clients){
            sendStatus(ws, status);
        }
    })
}