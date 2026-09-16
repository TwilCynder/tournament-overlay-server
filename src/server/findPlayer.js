import { NoCauseFormattableError } from "../common/error.js";
import { ServerError } from "./serverError.js";

/**
 * @param {import("./types").PlayerHandle} handle 
 * @param {import("../common/types").PlayerObject[]} players 
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