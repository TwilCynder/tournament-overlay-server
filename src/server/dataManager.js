import { LimitedDepthObject, NoCauseFormattableError } from "../common/error.js";
import { readJSON, tryReadJSON } from "../build/util/io.js";
import { findPlayerID } from "./findPlayer.js";
import { ServerError } from "./serverError.js";
import { getSlugAndFilename } from "../common/slug.js";
import { playerString } from "./findPlayer.js";
import { getEventFromTSH } from "../common/getSlugFromTSH.js";
import { EventEmitter } from "events"

export class DataManager extends EventEmitter {
    /** @type {import("../common/types.js").Data} */
    #data;
    /** @type {string} */
    #event;

    constructor(){
        super();
        this.#data = null;
    }

    async #load(eventSlug){
        const eventURL = await getEventFromTSH(eventSlug);

        const [slug, filenename] = getSlugAndFilename(eventURL);
        this.#event = eventSlug;

        const data = await tryReadJSON(filenename);
        if (!data){ //Pas forcément grave, on peut maintenant tenter de build la data (ou retenter de recharger le même fichier)
            this.#data = null;
            return false;
        }

        if (!data.event) throw NoCauseFormattableError("Invalid data file (no event field) :", new LimitedDepthObject(data, 0));
        if (data.event != slug) throw NoCauseFormattableError("Invalid data filename : wrong event");

        this.#data = data;
        return true;
    }

    load(eventSlug){
        this.#load(eventSlug).then(result => this.emit("dataLoaded", result));
    }

    getData(){
        if (!this.#data) throw new ServerError(500, "Data has not been loaded yet");
        return this.#data;
    }

    /**
     * @typedef {import("./types").PlayerHandle} Player
     * @param {Player} p1 
     * @param {Player} p2 
     */
    getH2H(p1, p2){
        const data = this.getData();
        const matrix = data.matrix;
        const players = data.players;
        
        if (!matrix) throw new ServerError(404, "H2H data is not included in the data");

        const id1 = findPlayerID(p1, players);
        const id2 = findPlayerID(p2, players);

        const p1h2h = matrix[id1];
        if (!p1h2h) throw new ServerError(404, null, "Cannot find H2H data for player " + playerString(id1, p1));
        const h2h = p1h2h[id2];
        if (!h2h) throw new ServerError(404, null, "Cannot find H2H data for player " + playerString(id2, p2));

        return h2h;
    }
}