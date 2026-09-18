import { FormattableError } from "../common/error.js";
import { QueryManager } from "./util/queryManager.js";

const logs = {
    query: ({id}) => "Querying sets for player " + id + " ..."
}

export async function getPlayersSetsFactory(queryManager = new QueryManager){
    const query = await queryManager.try("playerSets", new URL("./graphql/PlayerSets.gql", import.meta.url), {retries: 6, logs});

    return function getPlayerSets(client, id, limiter){
        return query.executePaginated(client, {id}, "player.sets", limiter).catch(err => {
            throw new FormattableError(err, "Could not fetch sets for player", id);
        });
    }
}