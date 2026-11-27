import { LimitedDepthObject, NoCauseFormattableError } from "../common/error.js";
import { readJSON, tryReadJSON } from "../build/util/io.js";
import { findPlayerID } from "./findPlayer.js";
import { HTTPServerError } from "./serverError.js";
import { getSlugAndFilename } from "../common/slug.js";
import { playerString } from "./findPlayer.js";
import { getEventFromTSH } from "../common/getEventFromTSH.js";
import { EventEmitter } from "events"
import { build } from "../build/build.js";
import { APIManager } from "./util/APIManager.js";

export class ServerStateError extends HTTPServerError {
    constructor(cause, userMesssage, ...msg){
        super(500, cause, "This operation cannot be done in this state : " + userMesssage, ...msg);
    }
}

/** @param {string?} message  */
function result(message){
    if (message) console.log(message);
    return {message};
}

/** @typedef {ReturnType<result>} DMOperationResult */
export class ProgressReporter {
    report(){}; //ABSTRACT //I WISH I WAS DOING JAVA //OR TYPESCRIPT
}

export class DataManager extends EventEmitter {
    /** @type {import("../common/types.js").Data?} */
    #data;
    /** @type {string?} */
    #event;

    #apiManager;

    constructor(){
        super();
        this.#data = null;
        this.#apiManager = new APIManager;
    }

    #onDataChanged(){
        this.emit("dataChanged", this.#event, this.#data);
    }

    /**
     * Loads data for the specified event, assuming that the slug is non-null
     * @param {string} eventURL 
     */
    async #loadForEvent_(eventURL){
        const [slug, filenename] = getSlugAndFilename(eventURL);
        if (!this.#event == slug && this.#data) return null;
        this.#event = slug;

        /** @type {import("../common/types.js").Data} */
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

    /**
     * Loads data for the specified event, assuming that the slug is non-null.
     * @param {string} eventSlug 
     */
    #loadForEvent(eventSlug){
        return this.#loadForEvent_(eventSlug).then(result => {
            this.#onDataChanged();
            if (result) console.log("Successfully loaded data for event", this.#event, "with", this.#data.players.length, "players");
            else if (result == false) console.log("No data to load for event", this.#event);
            return result;
        });
    }

    /** @param {string?} sggog_addr  */
    initSGGAPI(sggog_addr){
        return this.#apiManager.initClient(sggog_addr);
    }

    /** @param {string} sggog_addr  */
    async reinitSGGAPI(sggog_addr){
        const resMsg = await this.#apiManager.reinitClient(sggog_addr);
        return result(true, resMsg);
    }

    /** @param {boolean} fast_mode */
    build(fast_mode){
        if (!this.#event) throw new ServerStateError(null, "Cannot build data, no event has been selected");

        const limiter = this.#apiManager.getLimiter();
        const client = this.#apiManager.getClient();

        const result = build(client, this.#event, limiter, {slow_mode: !fast_mode}).then((result) => {
            this.#onDataChanged();
            return result;
        });

    }

    /**
     * Tries loading a data file for the currently selected event
     * @returns 
     */
    loadCurrentEvent(){
        if (!this.#event) throw new ServerStateError(null, "Cannot retry loading, no event has been selected");

        return this.#loadForEvent(this.#event);
    }

    /**
     * Tries loading data for the specified event slug ; if no event is specified, tries loading the event slug from TSH.  
     * If an event slug is obtained, it is set as the current even if no data could be loaded
     * @param {string?} eventURL 
     */
    async load(eventURL){
        eventURL = await getEventFromTSH(eventURL);
        return await this.#loadForEvent(eventURL)
    }

    unloadEvent(){
        if (!this.#event) throw new ServerStateError(null, "No event selected");
        this.#event = null;
        this.#data = null;
        this.#onDataChanged();

        console.log("Unloaded event");
    }

    getEvent(){
        return this.#event;
    }

    tryGetData(){
        return this.#data;
    }

    getData(){
        if (!this.#data) throw new ServerStateError("Data has not been loaded yet");
        return this.#data;
    }

    /**
     * @typedef {import("./dataTypes.js").PlayerHandle} Player
     * @param {Player} p1 
     * @param {Player} p2 
     */
    getH2H(p1, p2){
        const data = this.getData();
        const matrix = data.matrix;
        const players = data.players;
        
        if (!matrix) throw new HTTPServerError(404, "H2H data is not included in the data");

        let id1 = findPlayerID(p1, players);
        let id2 = findPlayerID(p2, players);

        let ids = {id1, id2};

        if (id1 > id2) [id1, id2] = [id2, id1];

        const p1h2h = matrix[id1];
        if (!p1h2h) throw new HTTPServerError(404, null, "Cannot find H2H data for player " + playerString(id1, p1));
        const h2h = p1h2h[id2];
        if (!h2h) throw new HTTPServerError(404, null, "Cannot find H2H data for player " + playerString(id2, p2));

        console.log("Answered H2H request for", playerString(id1, p1), "-", playerString(id2, p2));

        return {ids, h2h};
    }
}