/** @param {string} name @param {number} divider  */
function unit(name, divider){
    return {name: " " + name, divider};
}

const units = [
    unit("milisecond", 1000),
    unit("second", 60),
    unit("minute", 60),
    unit("hour", 24),
    unit("day", 365),
    unit("year", null)
];
const lastUnit = units.pop();

/** @param {number} number @param {string} string  */
function pluralUnitString(number, string){
    return number + string + (number > 1 ? "s" : "");
}

function getParts(time){
    const parts = [];

    for (const unit of units){
        parts.push(pluralUnitString(time % unit.divider, unit.name));
        time = Math.floor(time / unit.divider);
        if (time < 1) return parts;
    }

    parts.push(pluralUnitString(time, lastUnit.name));
    return parts;
}

export function durationString(time){
    const parts = getParts(time).reverse();
    const lastPart = parts.pop();
    return parts.length > 0 ? parts.join(", ") + " and " + lastPart : lastPart;
}