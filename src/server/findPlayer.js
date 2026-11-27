import { fmtS, NoCauseFormattableError } from "../common/error.js";
import { HTTPServerError } from "./serverError.js";

/**
 * @param {import("./dataTypes.js").PlayerHandle} handle 
 * @param {import("../common/types.js").PlayerObject[]} players 
 */
export function findPlayerID(handle, players){
    if ("id" in handle && handle.id) return handle.id;
    else if (!handle.name) throw NoCauseFormattableError("Invalid player handle", handle);

    for (const player of players){
        if (player.gamerTag.toLowerCase() == handle?.name.toLowerCase()){
            return player.id;
        }
    }

    throw new HTTPServerError(404, null, "Player not found :", handle.name);
}

/** @param {import("./dataTypes.js").PlayerHandle} player */
export function playerString(id, player){
    console.log(player)
    return player.name ? `${player.name} (${id})` : "id "+ id;
}