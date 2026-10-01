const url = "ws://" + window.location.host;
const ws = new WebSocket(url);

ws.onopen = () => {
    ws.send(JSON.stringify({test: true}));
}