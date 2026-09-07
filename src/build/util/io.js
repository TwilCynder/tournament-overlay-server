import fs from "fs/promises";

/** @param {...string} parts  */
export function joinPath(...parts){
    return parts.join("/");
}

/** @param {import("fs").PathLike} path  */
export async function readJSON(path){
    const text = await fs.readFile(path, {encoding: "utf-8"});
    return JSON.parse(text);
}