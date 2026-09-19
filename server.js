import { ArgumentsManager } from "@twilcynder/arguments-parser";
import { error, printError } from "./src/common/error.js";
import { DataManager } from "./src/server/dataManager.js";
import express from "express"
import { dataRouter } from "./src/server/dataServer.js";

let {event, port} = new ArgumentsManager()
    .setParameters({guessLowDashes: true})
    .addOption(["-e", "--event"], {description: "URL of the event to load H2H for. Defaults to the one selected in TSH"}, true)
    .addOption(["-p", "--port"], {description: "Port to listen to", type: "number"})
    .enableHelpParameter()
    .parseProcessArguments()

const dm = new DataManager();
dm.load("tournament/ledgetrompe-26/event/1v1-ultimate")
    .catch(err => error(5, "Error while loading data :", err))
    .then(() => {
        console.log("---- Finished loading data ----");
    })

const server = express();
server.use("/data", dataRouter(dm));

port = port ?? process.env.PORT ?? 5001;
server.listen(port);
console.log("Listening on port", port);




























/*
console.log(dm.getData());
try {
    console.log(dm.getH2H({name: "Cardane"}, {name: "Aabi"}));
} catch (err){
    printError(err);
}
*/
