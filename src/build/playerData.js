import { getPlayersSetsFactory } from "./getPlayerSets.js";
import { QueryManager } from "./util/queryManager.js";

export async function getPlayersDataFactory(queryManager = new QueryManager){
    const getPlayerSets = await getPlayersSetsFactory(queryManager);

    /** 
     * @param {import("graphql-request").GraphQLClient} client @param {{}[]} players @param {import("startgg-helper-node").TimedQuerySemaphore} limiter 
     */
    return function getPlayersData(client, players, limiter){
        return Promise.all(players.map(async player => {
            const sets = await getPlayerSets(client, player.id, limiter);
            return {player, sets}
        }))
    }
}