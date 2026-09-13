import { DelayQueryLimiter } from "startgg-helper-node";
import { QueryManager } from "./build/util/queryManager.js";
import { createClientAuto } from "./build/util/client.js";
import { getEventInfoFactory } from "./build/getEventEntrants.js";
import { getPlayersDataFactory } from "./build/playerData.js";
import { buildMatchesMatrix } from "./build/head2headMatrix.js";

/**
 * 
 * @param {string} event Event slug
 * @param {string} sggog_addr Address for SGGOG
 * @returns 
 */
export async function build(event, sggog_addr){
    const qm = new QueryManager;
    const [client, getEventInfo, getPlayersData] = await Promise.all([
        createClientAuto(sggog_addr), 
        getEventInfoFactory(qm),
        getPlayersDataFactory(qm)]
    );
    const limiter = new DelayQueryLimiter(60);

    console.log("Loading entrants for event", event);
    
    const eventData = await getEventInfo(client, event, limiter);
    console.log("Event :", eventData.event.tournament.name, "-", eventData.event.name, "-", eventData.event.videogame.name, "- (" + eventData.event.videogame.id + ")")
    for (const entrant of eventData.players){
        console.log("-", entrant.gamerTag);
    }
    
    console.log("Loading players sets");

    const players = eventData.players//.slice(0, 4);
    const playersData = await getPlayersData(client, players, limiter);
    
    limiter.stop();

    console.log("Building head-to-head matrix");
    const matrix = buildMatchesMatrix(playersData, {game: eventData.event.videogame.id});

    return {
        matrix, playersData,
        event
    }
}