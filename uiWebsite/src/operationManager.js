/**
 * @typedef {{name: string, body: (...args) => WSCommand}} Operation
 */
export class OperationManager {
    /**@type {Operation?}*/
    #operation;
    /**@type {string[]}*/
    #logs = [];
    /**@type {string?}*/
    #currentStatus;

    /** @param {Operation} operation  */
    startOperation(operation){
        this.#operation = operation;
        this.#logs = [];
        this.#currentStatus = "Waiting for server response ...";
    }

    /** @param {string} info */
    addLog(info){
        this.#logs.push(info);
    }

    setStatus(statusMessage){
        this.#currentStatus = statusMessage;
    }

    getStatusHTML(){
        if (!this.#operation) return "";
        return this.#logs.length ? 
            (this.#operation.name + " : <ul><li>" + this.#currentStatus + "</li>" + this.#logs.map(log => "<li>" + log + "</li>") + "</ul>") :
            this.#operation.name + " - " + this.#currentStatus;
    }

    
}