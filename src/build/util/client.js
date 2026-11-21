import { createClient } from "startgg-helper-node";
import { error } from "../../common/error.js";
import { FormattableError, NoCauseFormattableError } from "../../common/error.js";
import { BuildError } from "./buildError.js";

/** @param {string | number} url  */
function buildURL(url){
    if (typeof url === "number") url = "localhost:" + url;
    if (!url.startsWith("http")) url = "http://" + url;
    return url + "/token";
}

/** @param {string | number} sggog_addr  */
async function SGGOGToken(sggog_addr){
    const url = buildURL(sggog_addr);

    const res = await fetch(url).catch(err => {
        throw err;
    });

    if (!res.ok){
        const data = await res.json().catch(_ => ({err: null}))
        throw NoCauseFormattableError("Request to SGGOG at URL", url, "failed with code", res.status, data.err ? ": " + data.err : "");
    }
    const data = await res.json();
    if (!data.token){
        throw NoCauseFormattableError("No token found in SGGOG response");
    }
    return data.token;
}

export async function createClientAuto(sggog_addr){
    let token = process.env.STARTGG_API_TOKEN;
    if (token){
        if (!token.startsWith("Bearer ")) token = "Bearer " + token;
        console.log("Token found in env variables");
    } else if (sggog_addr) {
        console.log("Asking SGGOG for a token");
        try {
            token = await SGGOGToken(sggog_addr);

            console.log("Token obtained from SGGOG");
        } catch (err){
            if (err.cause && err.cause.code == "ECONNREFUSED"){
                throw "couldn't connect to SGGOG at " + sggog_addr + " - check that SGGOG is running and that you have the right port/host";
            }
            throw new FormattableError(err, "Could not obtain token from SGGOG");
        }

    } else {
        throw new BuildError(1, null, "Could not find a token - SGGOG is disabled, use -a or -A")
    }

    return createClient(token);
}