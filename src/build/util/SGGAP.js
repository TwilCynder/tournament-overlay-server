import { joinPath } from "./io.js";

export function loadFromSGGAP(file){
    let path = joinPath(process.env.SGGAP_PATH, file);
    if (!path.includes("://")) path = "file://" + path;
    return import(path)
        .catch(err => {
            throw new Error("Could not load SGGAP JS file " + file + " : " + err, {cause: err})
        });
}