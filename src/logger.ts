import { BaseLogger, Logger, StateOptions } from "./interaction.types";

export class DefaultLogger extends BaseLogger {
    constructor(options: StateOptions) {
        super(options);
    }
}