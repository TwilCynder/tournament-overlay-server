import { StartGGDelayQueryLimiter } from "startgg-helper-node";
import { createClientFromSGGOG, tryCreateClient } from "../../build/util/client.js";
import { ServerError } from "../serverError.js";
import { printError } from "../../common/error.js";

//fun fact this is bascally startgg-helper@3.0's TimedClient
export class APIManager{
    /** @type {Awaited<ReturnType<createClientAuto>>?} */
    #client;
    #queryLimiter = new StartGGDelayQueryLimiter;

    /** @param {string} sggog_addr  */
    async initClient(sggog_addr){
        this.#client = await tryCreateClient(sggog_addr).catch(err => {
            printError("Couldn't get a token from SGGOG :", err);
            return null;
        });

        if (!this.#client){
            console.warn("The startgg API hasn't been initialized as a token couldn't be obtained - use SGGOG and enable it with -a or -A, or pass a STARTGG_API_TOKEN env variable");
            return false;
        }
        return true;
    }

    /** @param {string} sggog_addr  */
    async reinitClient(sggog_addr){
        try {
            const client = await createClientFromSGGOG(sggog_addr);
            this.#client = client;
            return "Initialized the API using SGGOG";
        } catch (err){
            if (this.#client) return "Failed to initialize the API via SGGOG but it was already done";
            throw new ServerError(err, "Couldn't initialize the API using SGGOG");
        }
    }

    getLimiter(){
        return this.#queryLimiter;
    }

    getClient(){
        if (!this.#client) throw new ServerError(null, "Cannot fetch from the start.gg API, as it has not been initialized yet. Please configure SGGOG");
        return this.#client;
    }


}