export type Coordinate = {
  x: number;
  y: number;
};

export type CanvasElements = {
  grid: HTMLCanvasElement;
  draw: HTMLCanvasElement;
  hover: HTMLCanvasElement;
};

export enum Events {
  MOUSE_MOVE = 'mousemove',
  MOUSE_DOWN = 'mousedown',
  MOUSE_UP = 'mouseup',
  MOUSE_LEAVE = 'mouseleave',
}

export type DragEvent = {
  distance: Coordinate;
  translate: Coordinate;
};

export type MoveEvent = {
  offsetX: number;
  offsetY: number;
  translate: Coordinate;
};

export type GridArray = Array<Coordinate>;

export type StateOptions = {
  debug?: boolean;
  logger?: Logger;
};

export type ObjectManagerOptions = {
  debug?: boolean;
  logger?: Logger;
};

export type MenuManagerOptions = {
  debug?: boolean;
  logger?: Logger;
};

export interface Logger {
  new (options: StateOptions): BaseLogger;
}

export abstract class BaseLogger {
  private _options: StateOptions;

  protected constructor(stateOptions: StateOptions) {
    this._options = stateOptions;
  }

  public log(msg: string) {
    if (this._options.debug) console.log(msg);
  }

  public error(error: Error) {
    console.error(error.message);
  }
}

export enum CanvasObjectTypes {
  ARC = 'arc',
}

export type CanvasObject = {
  id?: string;
  canvas: Path2D;
  coord: Coordinate;
  color?: string;
};

export type DrawCoordinateSystemOptions = {
  stepLength: number;
};

export type CanvasifyOptions = {
  stateManager?: StateOptions;
  objectManager?: ObjectManagerOptions;
  menuManager?: MenuManagerOptions;
};
