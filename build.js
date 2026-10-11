import { ArgumentsManager } from "@twilcynder/arguments-parser";
import { joinPath, readJSON } from "./src/build/util/io.js";
import fs from "fs/promises";

import { build } from "./src/build.js";
import { getSlugAndFilename } from "./src/common/slug.js";
import { error } from "./src/common/error.js";
import { getEventFromTSH } from "./src/common/getEventFromTSH.js";

let {event, sggog_addr, sggog_addr_default, slow_mode} = new ArgumentsManager()
    .setParameters({guessLowDashes: true})
    .addOption(["-e", "--event"], {description: "URL of the event to load H2H for. Defaults to the one selected in TSH"}, true)
    .addOption(["-a", "--sggog-addr"], {description: "Address at which to find startgg-oauth-gate ; will be used to find a token if specified, unless one is already present in the environment variables"}, true)
    .addSwitch(["-A", "--sggog-addr-default"], {description: "Use the default address, localhost:54301, to find startgg-ouauth-gate"}, true)
    .addSwitch(["-S", "--slow-mode"], {description: "Sends only one request at a time ; slower, but lower risk of failing whe start.gg's API backend is struggling"})
    .enableHelpParameter()
    .parseProcessArguments()

sggog_addr = sggog_addr ?? (sggog_addr_default ? "localhost:54301" : null) ?? process.env.SGGOG_ADDR;



event = await getEventFromTSH(event).catch(err => error(3, err));

let filename;
try {
    [event, filename] = getSlugAndFilename(event);
} catch (err) {
    error(2, err.message)
}

const data = await build(event, {sggog_addr, slowMode: slow_mode}).catch(err => error(5, "Error while building the data :", err));

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