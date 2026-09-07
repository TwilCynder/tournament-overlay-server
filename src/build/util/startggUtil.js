const slugRegex = /(tournament\/[^\/]*\/event\/[^\/]*)/g;

/** @param {string} urlOrSlug  */
export function extractSlug(urlOrSlug){
    let res = slugRegex.exec(urlOrSlug);
    if (res) return res[1]
    else throw new Error("Invalid slug " + urlOrSlug);
}