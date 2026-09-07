import { extractSlug } from "startgg-helper-node";
import { StartGGDelayQueryLimiter } from "startgg-helper";
import { loadFromSGGAP } from "./src/build/util/SGGAP.js";
import { checkEnvironementVariables } from "./src/build/util/scriptUtil.js";
import { error } from "./src/build/util/error.js";
import { ArgumentsManager } from "@twilcynder/arguments-parser";
import { joinPath, readJSON } from "./src/build/util/io.js";
import { createClientAuto } from "./src/build/util/client.js";
import { getEventPlayersFactory } from "./src/build/getEventEntrants.js";
import { QueryManager } from "./src/build/util/queryManager.js";
import { getPlayersDataFactory } from "./src/build/playerData.js";
import { buildMatchesMatrix } from "./src/build/head2headMatrix.js";

let {event, sggog_addr, sggog_addr_default} = new ArgumentsManager()
    .setParameters({guessLowDashes: true})
    .addOption(["-e", "--event"], {description: "URL of the event to load H2H for. Defaults to the one selected in TSH"}, true)
    .addOption(["-a", "--sggog-addr"], {description: "Address at which to find startgg-oauth-gate ; will be used to find a token if specified, unless one is already present in the environment variables"}, true)
    .addSwitch(["-A", "--sggog-addr-default"], {description: "Use the default address, localhost:54301, to find startgg-ouauth-gate"}, true)
    .enableHelpParameter()
    .parseProcessArguments()

sggog_addr = sggog_addr ?? sggog_addr_default ? "localhost:54301" : null;

const qm = new QueryManager;
const [client, getPlayers, getPlayersData] = await Promise.all([
    createClientAuto(sggog_addr), 
    getEventPlayersFactory(qm),
    getPlayersDataFactory(qm)]
);
const limiter = new StartGGDelayQueryLimiter;

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
event = extractSlug(event);

console.log("Loading entrants for event", event);

const players = await getPlayers(client, event, limiter).catch(err => error(6, err));
for (const entrant of players){
    console.log("-", entrant.gamerTag);
}

const players_ = players.slice(0, 4);
const playersData = await getPlayersData(client, players_, limiter);

limiter.stop();

const matrix = buildMatchesMatrix(playersData, {});
for (const playerData of playersData){
    console.log("Head2Heads for", playerData.player.gamerTag, `(${playerData.player.id})`);
    for (const [id, h2h] of Object.entries(matrix[playerData.player.id])){
        console.log("- H2H against", id);
        for (const set of h2h){
            console.log("- - -", set.event.tournament.name, "-", set.event.name, "- (" + set.event.videogame.name + ") -", set.fullRoundText);
        }
    }
}