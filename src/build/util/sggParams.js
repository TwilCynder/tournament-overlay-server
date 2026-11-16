/** 
 * sggog_addr, sggog_addr_default, slow_mode
 * @param {import("@twilcynder/arguments-parser").ArgumentsManager} am
 */
export function addSGGParams(am){
    am
        .addOption(["-a", "--sggog-addr"], {description: "Address at which to find startgg-oauth-gate ; will be used to find a token if specified, unless one is already present in the environment variables"}, true)
        .addSwitch(["-A", "--sggog-addr-default"], {description: "Use the default address, localhost:54301, to find startgg-ouauth-gate"}, true)
        .addSwitch(["-S", "--slow-mode"], {description: "Sends only one request at a time ; slower, but lower risk of failing whe start.gg's API backend is struggling"})
}

export function getSggogAddress(sggog_addr, sggog_addr_default){
    return sggog_addr ?? (sggog_addr_default ? "localhost:54301" : null) ?? process.env.SGGOG_ADDR;
}