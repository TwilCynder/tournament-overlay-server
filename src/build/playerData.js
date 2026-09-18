import { getPlayersSetsFactory } from "./getPlayerSets.js";
import { QueryManager } from "./util/queryManager.js";

export async function getPlayersDataFactory(queryManager = new QueryManager){
    const getPlayerSets = await getPlayersSetsFactory(queryManager);

    /** 
     * @param {import("graphql-request").GraphQLClient} client @param {import("../common/types").PlayerObject[]} players @param {import("startgg-helper-node").TimedQuerySemaphore} limiter 
     */
    return async function getPlayersData(client, players, limiter){
        /*
        let result = [];
        for (const player of players){
            result.push({player, sets: await getPlayerSets(client, player.id, limiter)});
        }
        return result;
        */

        return await Promise.all(players.map(async player => {
            const sets = await getPlayerSets(client, player.id, limiter);
            if (sets){
                console.log(`----- Finished fetching sets for player ${player.gamerTag} (${player.id}) -----`)
            } else {
                console.warn(`----- Couldn't fetch sets for player ${player.gamerTag} (${player.id}) -----`)
            }
            
            return {player, sets}
        })).then(arr => arr.filter(player => player.sets));
    }
}