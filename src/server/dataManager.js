import { NoCauseFormattableError } from "../common/error.js";
import { readJSON } from "../build/util/io.js";
import { findPlayerID } from "./findPlayer.js";
import { ServerError } from "./serverError.js";
import { getSlugAndFilename } from "./src/common/slug.js";

export class DataManager {
    /** @type {import("../common/types.js").Data} */
    data;

    constructor(){
        this.data = null;
    }

    async load(eventSlug){
        const [slug, filenename] = getSlugAndFilename(eventSlug);

        const data = await readJSON(filenename);

        if (!data.event) throw NoCauseFormattableError("Invalid data file (no event field)");
        if (data.event != slug) throw NoCauseFormattableError("Invalid data filename : wrong event");

        this.data = data;
    }

    getData(){
        if (!this.data) throw new ServerError(500, "Data has not been loaded yet");
        return this.data;
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

        const id1 = findPlayerID(p1);
        const id2 = findPlayerID(p2);
    }
}