import { deep_get_raw } from "startgg-helper-node";

/**
 * @typedef {{game?: number, words: string[]}} Filters
 * @param {Filters} filters 
 * @param {{}} set 
 */
function isEventFiltered(filters, set){
    if (filters.game && set.event.videogame.id != filters.game) return true;
    if (filters.words){
        for (const word of filters.words){
            if (set.event.slug.includes(word)) return true;
        }
    }
}

/**
 * 
 * @param {Awaited<ReturnType<Awaited<ReturnType<import("./playerData.js").getPlayersDataFactory>>>>} playersList 
 * @param {Filters?} eventFilters 
 */
export function buildMatchesMatrix(playersList, eventFilters){
    let indexes = playersList.reduce((prev, current, index) => {
        prev[current.player.id] = index;
        return prev;
    }, {});

    let matrix = playersList.map((playerData, currentIndex) => {
        /**@type {{}[][]} */
        let h2hs = Array(playersList.length - currentIndex - 1).fill(null).map(_ => ([]));
        let id = playerData.player.id;
        
        for (let set of playerData.sets){
            
            if (!set.event) continue;
            if (!set.completedAt) continue; //match pas fini
            if (isEventFiltered(eventFilters, set)) continue;

            let currentPlayerSlotIndex = null;
            if (set.slots[0].entrant.participants.length > 1) continue; //2v2
            for (let i = 0; i < 2; i++){
                let p = set.slots[i].entrant.participants[0]
                if (!p.player) continue;
                if (p.player.id == id){
                    currentPlayerSlotIndex = i;
                }
            }
            if (currentPlayerSlotIndex === null){
                console.error("[Skipping] PLAYER NOT FOUND IN OWN SET", set, id, playerData.player.slug);
                continue;
            }
            let otherPlayerID = deep_get_raw(set, null, "slots", 1 - currentPlayerSlotIndex, "entrant", "participants", 0, "player", "id");
            if (otherPlayerID === null){
                console.warn("[Skipping] Other player doesn't have a user ID", set, id, playerData.player.slug);
                continue;
            }
            let otherPlayerEntrantIndex = indexes[otherPlayerID];
            if (otherPlayerEntrantIndex){
                if (otherPlayerEntrantIndex > currentIndex){
                    h2hs[otherPlayerEntrantIndex - currentIndex - 1].push(set);
                }
            }
        }
        return {h2hs, playerData};
    })

    console.log(matrix);

    /** @type {import("../common/types").h2hMatrix} */
    let hashMatrix = playersList.reduce((prev, current) => {
        prev[current.player.id] = {};
        return prev;
    }, {})
    for (let i = 0; i < matrix.length; i++){
        const line = matrix[i];

        const id = line.playerData.player.id;
        const myHashLine = hashMatrix[id]
        console.log("Current line :", line.playerData.player.gamerTag, id);
        for (let j = 0; j < line.h2hs.length; j++){
            const h2h = line.h2hs[j];
            const otherPlayer = playersList[i + j + 1].player; //why +1 ? matrixes are hard
            const otherHashLine = hashMatrix[otherPlayer.id];

            console.log("- Other player :", otherPlayer.gamerTag, otherPlayer.id);

            myHashLine[otherPlayer.id] = h2h;
            otherHashLine[id] = h2h;
        }
    }

    return hashMatrix;
}