import { joinPath, readJSON } from "../build/util/io.js";
import { FormattableError } from "./error.js";

/**
 * Returns the specified event slug, or if it's abent tries to get it from TSH
 * @param {string?} event
 */
export async function getEventFromTSH(event){
    if (!event){
        console.log("Loading event slug from TSH user settings ...")
        if (!process.env.TSH_PATH){
            throw new FormattableError("Trying to load event slug from TSH user settings, but no TSH path has been specified")
        }
    
        const tshUserSettings = await readJSON(joinPath(process.env.TSH_PATH, "/user_data/settings.json"));
        event = tshUserSettings.TOURNAMENT_URL;
    
        if (!event){
            throw new FormattableError("No event specified or selected in TSH");
        }
    }
    return event;
}