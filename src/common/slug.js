const slugRegex = () => /(tournament\/([^\/]*)\/event\/([^\/]*))/g;

/** @param {string} urlOrSlug  */
export function extractSlugWithParts(urlOrSlug){
    let res = slugRegex().exec(urlOrSlug);
    if (res) return res.slice(1, 4);
    else throw new Error("Invalid slug " + urlOrSlug);
}

export function extractSlug(urlOrSlug){
    let res = slugRegex().exec(urlOrSlug);
    if (res) return res[1];
    else throw new Error("Invalid slug " + urlOrSlug);
}

export function makeFilename(tournament, event){
    return "out/" + tournament + "-" + event + ".json"
}

export function getSlugAndFilename(urlOrSlug){
    const [event, tournamentFilename, eventFilename] = extractSlugWithParts(urlOrSlug);
    return [event, makeFilename(tournamentFilename, eventFilename)];
}