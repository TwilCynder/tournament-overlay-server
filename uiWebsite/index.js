import { ContentSwitcher } from "./src/DOMUtil.js";

const url = "ws://" + window.location.host;
const ws = new WebSocket(url);

const contentSwitcher = new ContentSwitcher(document.querySelector(".panel.initial"));

ws.onopen = () => {
    ws.send(JSON.stringify({test: true}));
}