import { ContentSwitcher } from "./src/DOMUtil.js";
import { sendJSON } from "./src/WSUtil.js";

/**
 * @typedef {import("../src/server/wsProtocol.js").WSControlMessageIncoming} WSCommand
 * @typedef {import("../src/server/wsProtocol.js").OperationFeedback} WSFeedbackMessage
 * @typedef {import("../src/server/wsProtocol.js").Status} WSStatusMessage
 */

const url = "ws://" + window.location.host;
const ws = new WebSocket(url);

const PANELS = {
    nothingLoaded: document.getElementById("nothing-loaded"),
    eventSelected: document.getElementById("event-selected"),

}
const feedbackElement = document.getElementById("feedback");

//const contentSwitcher = new ContentSwitcher(document.querySelector(".panel.initial"));

/** @param {WSCommand} obj  */
function sendCommand(ws, obj){
    sendJSON(ws, obj);
    feedbackElement.innerHTML = "Waiting for server's response"
}

document.getElementById("button-load-event").onclick = () => {
    sendCommand(ws, {op: "load-data", url: null});
}

ws.onopen = () => {
    //ws.send(JSON.stringify({test: true}));
}

/** @param {WSFeedbackMessage} obj  */
function getFeedbackMessage(obj){
    switch (obj.status){
        case "error": 
            return obj.message ?? "Error"; //ajouter decoration ou jsp
            break;
        case "ok":
            return "Server processing request ...";
        case "success":
            return obj.message ?? "Success";
    }
}

ws.addEventListener("message", (event) => {
    const obj = JSON.parse(event.data);
    console.log(obj)
    switch (obj.type){
        case "operation-feedback":
            feedbackElement.innerHTML = getFeedbackMessage(obj);
            break;
    }
})