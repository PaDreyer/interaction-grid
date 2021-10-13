import { BaseLogger, MenuManagerOptions } from '../interaction.types';
import { DefaultLogger } from '../logger';

const defaultMenuManagerOptions: MenuManagerOptions = {};

export class MenuManager {
  private readonly _options: MenuManagerOptions = defaultMenuManagerOptions;
  private _logger: BaseLogger;

  constructor(options?: MenuManagerOptions) {
    if (options) this._options = { ...this._options, ...options };
    const logger = options?.logger;
    if (logger) this._logger = new logger(this._options);
    else this._logger = new DefaultLogger(this._options);
  }
}
