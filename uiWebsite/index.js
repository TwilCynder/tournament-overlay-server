import { ContentSwitcher } from "./src/DOMUtil.js";
import { sendJSON } from "./src/WSUtil.js";

/**
 * @typedef {import("../src/server/wsProtocol.js").WSControlMessageIncoming} WSCommand
 * @typedef {import("../src/server/wsProtocol.js").WSControlMessageOutcoming} WSMessage
 * @typedef {import("../src/server/wsProtocol.js").OperationFeedback} WSFeedbackMessage
 * @typedef {import("../src/server/wsProtocol.js").StatusMessage} WSStatusMessage  
 */

const url = "ws://" + window.location.host;
const ws = new WebSocket(url);

const PANELS = {
    nothingLoaded: document.getElementById("nothing-loaded"),
    eventSelected: document.getElementById("event-selected"),

}
const statusElement = document.getElementById("status");
const feedbackElement = document.getElementById("feedback");

const contentSwitcher = new ContentSwitcher(document.querySelector(".panel.initial")); 

/**
 * @typedef {{name: string, body: (...args) => WSCommand}} Operation
 * type {{[name: string]: Operation}}
 */
const operations = {
    loadEventFromTSH: {name: "Load event from TSH", body: () => ({op: "load-data", url: null})},
    unloadEvent: {name: "Unselect event", body: () => ({op: "reset"})}
}

/** @type {Operation?} */
let lastOperation = null;

/** @param {string} cssClass @param {string} message  */
function setFeedbackContent(message, cssClass = ""){
    feedbackElement.innerHTML = `<span class="${cssClass}">${lastOperation.name} - ${message}</span>`;
}

/** @param {WSFeedbackMessage} res  */
function processFeedbackResponse(res){
    switch (res.status){
        case "error": 
            return [res.message ?? "Error", "error-message"]; //ajouter decoration ou jsp
        case "ok":
            return ["Server processing request ..."];
        case "success":
            return [res.message ?? "Success", "success-message"];
    }
}

/** @param {WSStatusMessage} message */
function processStatusMessage(message){
    switch (message.mode){
        case "nothing-loaded": 
            contentSwitcher.showElement(PANELS.nothingLoaded);
            statusElement.innerHTML = "No event selected";
            break;

        case "event-set":
            contentSwitcher.showElement(PANELS.eventSelected);
            statusElement.innerHTML = `Event selected : ${message.slug} <br> No data loaded`;
            break;
        case "data-loaded":
            break;
    }
}

ws.addEventListener("message", (event) => {
    /** @type {WSMessage} */
    const obj = JSON.parse(event.data);
    console.log(obj)
    switch (obj.type){
        case "operation-feedback":
            setFeedbackContent(...processFeedbackResponse(obj));
            break;
        case "status":
            processStatusMessage(obj);
            break;
    }
});



/** @param {WSCommand} obj @param {Operation} op @param {...any} args  */
function sendCommand(ws, op, ...args){
    sendJSON(ws, op.body(...args));
    lastOperation = op;
    setFeedbackContent("Waiting for server response ...");
}

document.getElementById("button-load-event").onclick = () => {
    sendCommand(ws, operations.loadEventFromTSH);
}
document.getElementById("button-unload-event").onclick = () => {
    sendCommand(ws, operations.unloadEvent);
}