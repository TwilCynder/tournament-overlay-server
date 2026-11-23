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

/** @param {WebSocket} ws @param {Promise<unknown>} promise  */
function handleAsyncTask(ws, promise){
    return promise.catch(handleWSServerError.bind(null, ws));
}

/** @param {WebSocket} ws @param {() => Promise<unknown>} f  */
function runAsyncTask(ws, f){
    sendOperationFeedback(ws, "ok");
    return handleAsyncTask(ws, f());
}

/** @param {string?} slug @param {ReturnType<import("./dataManager.js").DataManager['tryGetData']>} data   @returns {import("./wsProtocol").Status}*/
function getStatus(slug, data){
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

                switch (msg.op){
                    case "load-data":
                        runAsyncTask(ws, async() => {
                            const success = await dataManager.load(msg.url);
                            if (success == null) throw "Data was already loaded";
                            sendOperationFeedback(ws, "success", "Loaded event from TSH ; data file " + (success ? "loaded" : "not found"));
                        });          
                        break;
                    case "retry-load-data":
                        runAsyncTask(ws, async () => {
                            const success = await dataManager.loadCurrentEvent();
                            if (success == null) throw "Data was already loaded";
                            sendOperationFeedback(ws, "success", success ? "Data loaded" : "Still not data");
                        });
                        break;
                    case "build-data":
                        runAsyncTask(ws, async () => {
                            if (msg.sggog_addr){
                                const result = await dataManager.reinitSGGAPI(msg.sggog_addr);
                                sendOperationFeedback(ws, "ok", result);
                            }
                            await dataManager.build(msg.fast_mode);
                            sendOperationFeedback(ws, "success");
                        });
                        break;
                    case "reset": 
                        dataManager.unloadEvent();
                        sendOperationFeedback(ws, "success");
                        break;
                }
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