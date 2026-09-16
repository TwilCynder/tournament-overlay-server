import { createClient } from "startgg-helper-node";
import { error } from "../../common/error.js";
import { FormattableError, NoCauseFormattableError } from "../../common/error.js";

/** @param {string | number} url  */
function buildURL(url){
    if (typeof url === "number") url = "localhost:" + url;
    if (!url.startsWith("http")) url = "http://" + url;
    return url + "/token";
}

/** @param {string | number} sggog_addr  */
async function SGGOGToken(sggog_addr){
    const url = buildURL(sggog_addr);

    const res = await fetch(url);
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
        console.log("Token found in env variables");
    } else if (sggog_addr) {
        console.log("Asking SGGOG for a token");
        try {
            token = await SGGOGToken(sggog_addr);

            console.log("Token obtained from SGGOG");
        } catch (err){
            if (err instanceof FormattableError) error(5, "Could not obtain token from SGGOG :", ...err.msgParts);
            error(5, "Error while fetching token from SGGOG :", err);
        }

    } else {
        error(1, "Could not find a token - SGGOG is disabled, use -a or -A")
    }

    return createClient(token);
}