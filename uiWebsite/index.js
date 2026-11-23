import { ContentSwitcher, showElement } from "./src/DOMUtil.js";
import { sendJSON } from "./src/WSUtil.js";
import { OperationManager } from "./src/operationManager.js";

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
    dataLoaded: document.getElementById("data-loaded")
}
const statusElement = document.getElementById("status");
const feedbackElement = document.getElementById("feedback");

const contentSwitcher = new ContentSwitcher(document.querySelector(".panel.initial")); 

export const operations = {
    loadEventFromTSH: {name: "Load event from TSH", body: () => ({op: "load-data", url: null})},
    unloadEvent: {name: "Unselect event", body: () => ({op: "reset"})},
    buildData: {name: "Build data", body: (fast_mode, sggog_addr) => ({op: "build-data", sggog_addr, fast_mode})}
}

let currentOperation = new OperationManager;

/** @param {string} cssClass @param {string} message  */
function setFeedbackContent(message, cssClass = ""){
    feedbackElement.innerHTML = `<span class="${cssClass}">${message}</span>`;
}

/** @param {WSFeedbackMessage} feedback  */
function processFeedbackResponse(feedback){
    let cssClass = "";
    switch (feedback.status){
        case "error": 
            cssClass = "error-message";
            currentOperation.setStatus(feedback.message ?? "Error");
            break;
        case "status":
            currentOperation.setStatus(feedback.message ?? "Server processing request ...");
            break;
        case "info":
            if (feedback.message) currentOperation.addLog(feedback.message);
            break;
        case "success":
            cssClass = "success-message";
            currentOperation.setStatus(feedback.message ?? "Success");
            break;
    }
    return [currentOperation.getStatusHTML(), cssClass];
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
            contentSwitcher.showElement(PANELS.dataLoaded);
            //statusElement.innerHTML = `Data loaded : `
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
    currentOperation.startOperation(op);
    setFeedbackContent("Waiting for server response ...");
}

document.getElementById("button-load-event").onclick = () => {
    sendCommand(ws, operations.loadEventFromTSH);
}
document.getElementById("button-unload-event").onclick = () => {
    sendCommand(ws, operations.unloadEvent);
}
document.querySelector("#button-build-data .form-button-title").onclick = () => {
    sendCommand(ws, operations.buildData, 
        document.getElementById("form-api-fast-mode").checked,
        document.getElementById("form-sggog-addr").value
    )
}
document.querySelectorAll(".form-button-arrow").forEach(element => element.onclick = () => {
    element.closest(".form-button").classList.toggle("expanded");
})
document.querySelectorAll(".form-x-column .clickable").forEach(element => element.onclick = () => {
    element.closest(".form-button").classList.toggle("expanded");
})
