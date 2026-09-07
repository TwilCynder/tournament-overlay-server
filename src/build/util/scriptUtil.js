// Util functions for entry point scripts

import { error } from "./error.js";

/** @param {...string} vars  */
export function checkEnvironementVariables(...vars){
    for (const varName of vars){
        if (!process.env[varName]){
            error(1, "Missing environment variable : " + varName);
        }
    }
}
