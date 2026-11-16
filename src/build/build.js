import { DelayQueryLimiter } from "startgg-helper-node";
import { QueryManager } from "./util/queryManager.js";
import { createClientAuto } from "./util/client.js";
import { getEventInfoFactory } from "./getEventEntrants.js";
import { getPlayersDataFactory } from "./playerData.js";
import { buildMatchesMatrix } from "./head2headMatrix.js";
import { durationString } from "./util/timeString.js";

/**
 * TODO : callbacks
 * @param {string} eventSlug Event slug
 * @param {Object} config 
 * @param {string} config.sggog_addr Address for SGGOG
 * @param {boolean} config.slowMode Send only one request at a time 
 */
export async function build(eventSlug, config){
    const qm = new QueryManager;
    const [client, getEventInfo, getPlayersData] = await Promise.all([
        createClientAuto(config.sggog_addr), 
        getEventInfoFactory(qm),
        getPlayersDataFactory(qm)]
    );
    const limiter = new DelayQueryLimiter(60);

    console.log("Loading entrants for event", eventSlug);

    let startTime = Date.now();

    const eventData = await getEventInfo(client, eventSlug, limiter);
    console.log("Event :", eventData.event.tournament.name, "-", eventData.event.name, "-", eventData.event.videogame.name, "- (" + eventData.event.videogame.id + ")")
    for (const entrant of eventData.players){
        console.log("-", entrant.gamerTag);
    }

    const players = eventData.players//.slice(0, 10);
    const playersData = await getPlayersData(client, players, limiter, config);

    limiter.stop();

    console.log("Loading players sets in", durationString(Date.now() - startTime));

    startTime = Date.now();    

    console.log("Building head-to-head matrix");
    const matrix = buildMatchesMatrix(playersData, {game: eventData.event.videogame.id});

    console.log("Build matrix in", durationString(Date.now() - startTime));

    delete eventData.players;

    const timestamp = Date.now();

    return {
        matrix, players,
        eventSlug,
        event: eventData.event,
        timestamp
    }
}