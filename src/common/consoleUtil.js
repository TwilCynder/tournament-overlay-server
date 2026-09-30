const reset_esc = "\x1b[0m";
const codes = {
    yellow : "33",
    purple : "35",
    bgreen : "92",
    bred : "91",
    bold : "1",
    italics : "3",
    underline : "4"
}

export function terminalEscape(code){
    return `\x1b[${code}m`;
}

/**
 * @param {any} text
 * @param  {keyof codes} format
 */
export function format(text, format){
    return terminalEscape(codes[format] ?? "") + text + reset_esc;
}

/**
 * @param {any} text
 * @param  {...(keyof codes)} formats
 */
export function formatM(text, ...formats){
    return formats.map(formatKey => terminalEscape(codes[formatKey])).join("") + text + reset_esc;
}

export function colored(text, code){
    return terminalEscape(code) + text + reset_esc;
}

export function yellow(text){
    return colored(text, codes.yellow);
}

export function green(text){
    return colored(text, codes.bgreen);
}