import { error, printError } from "./src/common/error.js";
import { DataManager } from "./src/server/dataManager.js";

const dm = new DataManager();
await dm.load("tournament/ledgetrompe-26/event/1v1-ultimate").catch(err => error(5, "Error while loading data :", err));

console.log(dm.getData());
try {
    console.log(dm.getH2H({name: "Cardane"}, {name: "Aabi"}));
} catch (err){
    printError(err);
}
