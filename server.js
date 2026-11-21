import { ArgumentsManager } from "@twilcynder/arguments-parser";
import { DataManager } from "./src/server/dataManager.js";
import express from "express";
import { dataRouter } from "./src/server/dataServer.js";
import { WebSocketServer } from "ws";
import { createServer } from "http"
import { initWS } from "./src/server/controlServer.js";
import { addSGGParams, getSggogAddress } from "./src/build/util/sggParams.js";

let {event, load, port, sggog_addr, sggog_addr_default, slow_mode} = new ArgumentsManager()
    .setParameters({guessLowDashes: true})
    .addOption(["-e", "--event"], {description: "URL of the event to load H2H for. Defaults to the one selected in TSH"}, true)
    .addSwitch(["-l", "--load"], {description: "Try loading data right away"})
    .addOption(["-p", "--port"], {description: "Port to listen to", type: "number"})
    .apply(addSGGParams)
    .enableHelpParameter()
    .parseProcessArguments()

const dm = new DataManager({sggog_addr: getSggogAddress(sggog_addr, sggog_addr_default), slow_mode});


if (event || load){
    dm.load(event);
}

const app = express();
const server = createServer(app);

app.use(express.static("./uiWebsite"));
app.use("/data", dataRouter(dm));

const wss = new WebSocketServer({server, clientTracking: true});
initWS(wss, dm);

port = port ?? process.env.PORT ?? 5001;
server.listen(port);
console.log("Listening on port", port);




























/*
dm.load("tournament/ledgetrompe-26/event/1v1-ultimate")
    .catch(err => error(5, "Error while loading data :", err))
    .then(() => {
        console.log("---- Finished loading data ----");
    })
console.log(dm.getData());
try {
    console.log(dm.getH2H({name: "Cardane"}, {name: "Aabi"}));
} catch (err){
    printError(err);
}
*/
