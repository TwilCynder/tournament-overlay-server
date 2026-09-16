import { error } from "./src/build/util/error.js";
import { ArgumentsManager } from "@twilcynder/arguments-parser";
import { joinPath, readJSON } from "./src/build/util/io.js";
import fs from "fs/promises";

import { build } from "./src/build.js";
import { extractSlug, getSlugAndFilename } from "./src/common/slug.js";

let {event, sggog_addr, sggog_addr_default} = new ArgumentsManager()
    .setParameters({guessLowDashes: true})
    .addOption(["-e", "--event"], {description: "URL of the event to load H2H for. Defaults to the one selected in TSH"}, true)
    .addOption(["-a", "--sggog-addr"], {description: "Address at which to find startgg-oauth-gate ; will be used to find a token if specified, unless one is already present in the environment variables"}, true)
    .addSwitch(["-A", "--sggog-addr-default"], {description: "Use the default address, localhost:54301, to find startgg-ouauth-gate"}, true)
    .enableHelpParameter()
    .parseProcessArguments()

sggog_addr = sggog_addr ?? sggog_addr_default ? "localhost:54301" : null;

if (!event){
    console.log("Loading event slug from TSH user settings ...")
    if (!process.env.TSH_PATH){
        error(3, "Trying to load event slug from TSH user settings, but no TSH path has been specified");
    }

    const tshUserSettings = await readJSON(joinPath(process.env.TSH_PATH, "/user_data/settings.json"));
    event = tshUserSettings.TOURNAMENT_URL;

    if (!event){
        error(4, "No event specified or selected in TSH");
    }
}

let filename;
try {
    [event, filename] = getSlugAndFilename(event);
} catch (err) {
    error(2, err.message)
}

const {matrix, players} = await build(event, {sggog_addr});

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
await fs.writeFile(filename, JSON.stringify(matrix));