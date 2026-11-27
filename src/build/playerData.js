import { green, yellow } from "../common/consoleUtil.js";
import { getPlayersSetsFactory } from "./getPlayerSets.js";
import { QueryManager } from "./util/queryManager.js";

export async function getPlayersDataFactory(queryManager = new QueryManager){
    const getPlayerSets = await getPlayersSetsFactory(queryManager);

    /** 
     * @param {import("graphql-request").GraphQLClient} client 
     * @param {import("../common/types").PlayerObject[]} players 
     * @param {import("startgg-helper-node").TimedQuerySemaphore} limiter 
     * @param {{slow_mode: boolean}} config
     */
    return async function getPlayersData(client, players, limiter, config){
        
        if (config.slow_mode){
            let result = [];
            let count = 0;
            for (const player of players){
                result.push({player, sets: await getPlayerSets(client, player.id, limiter)});
                count ++;
                console.log(`----- Finished fetching sets for player ${player.gamerTag} (${yellow(player.id)}) - (${green(count)}/${green(players.length)}) ----`);
            }
            return result;
        } else {
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
}