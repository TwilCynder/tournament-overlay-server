export function defaults(properties, defaults){
    for (const [key, value] of Object.entries(defaults)) {
        if (properties[key] == null) {
            properties[key] = value;
        }
    }
    return properties;
}