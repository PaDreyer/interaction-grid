import {
  BaseLogger,
  CanvasObject,
  ObjectManagerOptions,
  StateOptions,
} from './interaction.types';
import { DefaultLogger } from './logger';
import { nanoid } from 'nanoid';

const defaultObjectManagerOptions: ObjectManagerOptions = {
  debug: false,
};

export class ObjectManager {
  private readonly _options: ObjectManagerOptions = defaultObjectManagerOptions;
  private _logger: BaseLogger;

  private _objects: CanvasObject[] = [];

  constructor(options?: ObjectManagerOptions) {
    if (options) this._options = { ...this._options, ...options };
    const logger = options?.logger;
    if (logger) this._logger = new logger(this._options);
    else this._logger = new DefaultLogger(this._options);
  }

  public addObject(object: CanvasObject) {
    const id = object.id ?? nanoid();
    this._objects.push({ ...object, id });
    return id;
  }

  public removeObject(id: string): CanvasObject | undefined {
    const objectToRemove: CanvasObject[] | undefined = this._objects.filter(
      (obj) => obj.id === id,
    );
    //this.objects = this.objects.splice()
    return objectToRemove[0];
  }

  public getScaledObjects(scale: number): CanvasObject[] {
    // TODO
    return this._objects;
  }

  get objects(): CanvasObject[] {
    return this._objects;
  }
}
