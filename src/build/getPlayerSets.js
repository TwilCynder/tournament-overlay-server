import { deep_get, deep_get_raw } from "startgg-helper-node/util";
import { FormattableError } from "../common/error.js";
import { QueryManager } from "./util/queryManager.js";

import util from "util"

const logs = {
    query: ({id}) => "Querying sets for player " + id + " ..."
}

class SetValidityError {
    constructor(msg, obj){this.msg = msg, this.obj = obj}
}

class SkipSetSentinel {
    constructor(){}
}

function deep_get_or_else(obj, ...path){
    let res = deep_get_raw(obj, false, ...path);
    if (res === false) throw new SetValidityError("Nothing at path" + path.join("."), obj);
    return res;
}

function processSet(startggSet){
    try {
        if (!startggSet.slots || startggSet.slots.length != 2) throw new SkipSetSentinel;

        let winner = null;
        const slots = startggSet.slots.map((slot, i) => {
            const entrant = deep_get_or_else(slot, "entrant");
            if (entrant.isDisqualified) throw new SkipSetSentinel;
            const participants = deep_get_or_else(entrant, "participants");

            const ids = participants.map((participant) => participant.player.id);
            const score = deep_get_raw(slot, null, "standing", "stats", "score", "value");
            if (score < 0) throw new SkipSetSentinel;
            const placement = deep_get_or_else(slot, "standing", "placement");
            if (placement == 1) winner = i;
            return {ids, score, placement};
        })

        if (winner === null) throw new SetValidityError("No winner found");

        return {
            event: deep_get_or_else(startggSet, "event"),
            fullRoundText: deep_get_or_else(startggSet, "fullRoundText"),
            completedAt: deep_get_or_else(startggSet, "completedAt"),
            slots,
            winner
        }
    } catch (err){
        if (err instanceof SetValidityError){
            console.error("Invalid set (dropping it) : ", err.msg, "in obj", JSON.stringify(err.obj), " | Set object :", util.inspect(startggSet, false, null, true));
        } else if (!(err instanceof SkipSetSentinel)){
            throw err;
        }
        return null;
    }
}

export async function getPlayersSetsFactory(queryManager = new QueryManager){
    const query = await queryManager.try("playerSets", new URL("./graphql/PlayerSets.gql", import.meta.url), {retries: 6, logs});

    /** 
     * @param {any} client @param {number} id @param {import("startgg-helper").TimedQuerySemaphore} limiter
     * @returns {import("../common/types.js").Set[]}
     */
    return function getPlayerSets(client, id, limiter){
        return query.executePaginated(client, {id}, "player.sets", limiter, /*{maxElements: 100}*/)
            .catch(err => {
                throw new FormattableError(err, "Could not fetch sets for player", id);
            })
            .then(res => {
                if (!res) return null;
                return res.map(processSet).filter(set => !!set);
            })
    }
}