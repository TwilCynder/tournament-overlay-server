import { ArgumentsManager } from "@twilcynder/arguments-parser";
import fs from "fs/promises";

import { build } from "./src/build/build.js";
import { getSlugAndFilename } from "./src/common/slug.js";
import { error } from "./src/common/error.js";
import { getEventFromTSH } from "./src/common/getEventFromTSH.js";
import { addSGGParams, getSggogAddress } from "./src/build/util/sggParams.js";
import { BuildError } from "./src/build/util/buildError.js";

let {event, sggog_addr, sggog_addr_default, slow_mode} = new ArgumentsManager()
    .setParameters({guessLowDashes: true})
    .addOption(["-e", "--event"], {description: "URL of the event to load H2H for. Defaults to the one selected in TSH"}, true)
    .apply(addSGGParams)
    .enableHelpParameter()
    .parseProcessArguments()

sggog_addr = getSggogAddress(sggog_addr, sggog_addr_default);

event = await getEventFromTSH(event).catch(err => error(3, err));

let filename;
try {
    [event, filename] = getSlugAndFilename(event);
} catch (err) {
    error(2, err.message)
}

const data = await build(event, {sggog_addr, slow_mode}).catch(err => error(err instanceof BuildError ? err.getCode() : 5, "Error while building the data :", err));

const {matrix, players} = data;
for (const playerData of players){
    console.log("Head2Heads for", playerData.gamerTag, `(${playerData.id})`);
    for (const [id, h2h] of Object.entries(matrix[playerData.id])){
        console.log("- H2H against", id);
        for (const set of h2h){
            console.log("- - -", set.event.tournament.name, "-", set.event.name, "- (" + set.event.videogame.name + ") -", set.fullRoundText);
        }
    }
}

await fs.mkdir("out", {recursive: true});
await fs.writeFile(filename, JSON.stringify(data));