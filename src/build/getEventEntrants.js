import { FormattableError } from "./util/error.js";
import { QueryManager } from "./util/queryManager.js";

/** @param {QueryManager} queryManager */
export async function getEventPlayersFactory(queryManager = new QueryManager){
    const query = await queryManager.try("eventEntrants", new URL("./graphql/EventEntrants.gql", import.meta.url));

    /** @param {any} client @param {string} slug @param {import("startgg-helper-node").TimedQuerySemaphore} limiter*/
    return async function getEventPlayers(client, slug, limiter){
        try {
            const data = await query.execute(client, {slug}, limiter);
            
            if (!data || !data.event){
                throw new FormattableError("Empty response - could mean the event doesn't exist");
            }

            let players = data.event.entrants.nodes.map(entrant => {
                let p = entrant.participants;
                if (!p || p.length != 1) return;
                return p[0].player;
            }).filter(player => !!player);

            return players;
        } catch (err){
            throw new FormattableError(err, "Could not load players for event", slug)   
        }

    }
}