import { FormattableError } from "../../common/error.js";

export class BuildError extends FormattableError {
    #exitCode;
    constructor(exitCode, cause, ...msg){
        super(cause, ...msg);
        this.#exitCode = exitCode;
    }

    getCode(){return this.#exitCode}
}