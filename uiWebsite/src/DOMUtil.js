export function showElement(element){
    element.style.setProperty('display', "flex");
    element.style.setProperty('opacity', "100%");
}

export function show(elementName){
    let element = document.querySelector(elementName);
    if (element) showElement(element);
}

export function hideElement(element){
    element.style.setProperty('display', "none");
    element.style.setProperty('opacity', "0");
}

export function hide(elementName){
    let element = document.querySelector(elementName);
    if (element) hideElement(element);
}

export class ContentSwitcher {
    #activeElement;
    constructor(activeElement){
        this.#activeElement = activeElement;
    }

    showElement(element){
        hideElement(this.#activeElement);
        showElement(element);
        this.#activeElement = element;
    }
}