import { FormattableError } from "./util/error.js";
import { QueryManager } from "./util/queryManager.js";



export async function getPlayersSetsFactory(queryManager = new QueryManager){
    const query = await queryManager.try("playerSets", new URL("./graphql/PlayerSets.gql", import.meta.url));

    return function getPlayerSets(client, id, limiter){
        return query.executePaginated(client, {id}, "player.sets", limiter, {maxElements: 300}).catch(err => {
            throw new FormattableError(err, "Could not fetch sets for player", id);
        });
    }
}

