import { createClient } from "startgg-helper-node";
import { ServerError } from "../../server/serverError.js";

/** @param {string | number} url  */
function buildURL(url){
    if (typeof url === "number" || /^[0-9]+$/.test(url)) url = "localhost:" + url;
    if (!url.startsWith("http")) url = "http://" + url;
    return url + "/token";
}

/** @param {string | number} sggog_addr */
async function SGGOGToken(sggog_addr){
    try {
        const url = buildURL(sggog_addr);

        console.log("Asking SGGOG for a token at", url);

        const res = await fetch(url).catch(err => {
            if (err.cause?.code == "ECONNREFUSED" || err.cause?.code?.includes("CONNECT")){
                throw "Couldn't connect to SGGOG at " + url + " - check that SGGOG is running and that you have the right port/host";
            }
            throw err;
        });

        if (!res.ok){
            const data = await res.json().catch(_ => ({err: null}))
            throw ServerError(null, "Request to SGGOG at URL", url, "failed with code", res.status, data.err ? ": " + data.err : "");
        }
        /** @type {{token?: string}} */
        const data = await res.json();
        if (!data.token){
            throw ServerError(null, "No token found in SGGOG response");
        }

        console.log("Token obtained from SGGOG");
        return data.token;
    } catch (err) {
        throw new ServerError(err, "Could not obtain token from SGGOG");
    }
}

/** @param {string} sggog_addr  */
export async function createClientFromSGGOG(sggog_addr){
    const token = await SGGOGToken(sggog_addr);
    return createClient(token);
}

/** @param {string?} sggog_addr */
export async function tryCreateClient(sggog_addr){
        let token = process.env.STARTGG_API_TOKEN;
    if (token){
        if (!token.startsWith("Bearer ")) token = "Bearer " + token;
        console.log("Token found in env variables");
    } else if (sggog_addr) {
        token = await SGGOGToken(sggog_addr);
    } else {
        return null;
    }

    return createClient(token);
}