import { fmtS, NoCauseFormattableError } from "../common/error.js";
import { ServerError } from "./serverError.js";

/**
 * @param {import("./types.js").PlayerHandle} handle 
 * @param {import("../common/types.js").PlayerObject[]} players 
 */
export function findPlayerID(handle, players){
    if ("id" in handle) return handle.id;
    else if (!handle.name) throw NoCauseFormattableError("Invalid player handle", handle);

    for (const player of players){
        if (player.gamerTag.toLowerCase() == handle?.name.toLowerCase()){
            return player.id;
        }
    }

    throw new ServerError(404, "Player not found :", handle.name);
}

/** @param {import("./types.js").PlayerHandle} player */
export function playerString(id, player){
    return ("name" in player) ? `${player.name} (${id})` : "id "+ id;
}