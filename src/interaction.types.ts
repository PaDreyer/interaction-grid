export type Coordinate = {
  x: number;
  y: number;
};

export type CanvasElements = {
  grid: HTMLCanvasElement;
  draw: HTMLCanvasElement;
};

export enum Events {
  MOUSE_MOVE = 'mousemove',
  MOUSE_DOWN = 'mousedown',
  MOUSE_UP = 'mouseup',
}

export type DragEvent = {
  distance: Coordinate;
};

export type GridArray = Array<Coordinate>;
