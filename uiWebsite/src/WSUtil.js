/**
 * @param {WebSocket} ws 
 */
export function sendJSON(ws, obj){
    ws.send(JSON.stringify(obj));
}