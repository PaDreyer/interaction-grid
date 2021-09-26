import { Coordinate, DragEvent, Events, MoveEvent } from './interaction.types';
import { Subject } from 'rxjs';

/**
 * Saves interaction state
 */
export class State {
  public onDrag$ = new Subject<DragEvent>();
  public onMove$ = new Subject<MoveEvent>();
  private _currentTranslate: Coordinate = { x: 0, y: 0 };
  private _isClickDown = false;
  private _isClickUp = false;
  private _isDragMove = false;
  private _currentPointHint: Coordinate | undefined;
  private _mouseDownCoord: Coordinate | undefined;
  private _mouseUpCoord: Coordinate | undefined;
  private _mouseDragStartCoord: Coordinate | undefined;
  private _mouseDragEndCoord: Coordinate | undefined;
  private _dragDistance: Coordinate | undefined;
  private _lastDragCoord: Coordinate | undefined;
  private _lastDragDistance: Coordinate | undefined;
  private _eventDragDistance: Coordinate | undefined;

  get isClickUp() {
    return this._isClickUp;
  }

  set isClickUp(is: boolean) {
    this._isClickUp = is;
  }

  get isClickDown() {
    return this._isClickDown;
  }

  set isClickDown(is: boolean) {
    this._isClickDown = is;
  }

  get isDragMove() {
    return this._isDragMove;
  }

  set isDragMove(is: boolean) {
    this._isDragMove = is;
  }

  get currentPointHint() {
    return this._currentPointHint;
  }

  set currentPointHint(newPointHint: Coordinate | undefined) {
    this._currentPointHint = newPointHint;
  }

  get mouseDownCoord() {
    return this._mouseDownCoord;
  }

  set mouseDownCoord(coord: Coordinate | undefined) {
    this._mouseDownCoord = coord;
  }

  get mouseUpCoord() {
    return this._mouseUpCoord;
  }

  set mouseUpCoord(coord: Coordinate | undefined) {
    this._mouseUpCoord = coord;
  }

  get mouseDragStartCoord() {
    return this._mouseDragStartCoord;
  }

  set mouseDragStartCoord(coord: Coordinate | undefined) {
    this._mouseDragStartCoord = coord;
  }

  get mouseDragEndCoord() {
    return this._mouseDragEndCoord;
  }

  set mouseDragEndCoord(coord: Coordinate | undefined) {
    this._mouseDragEndCoord = coord;
  }

  get dragDistance() {
    return this._dragDistance;
  }

  set dragDistance(coord: Coordinate | undefined) {
    this._dragDistance = coord;
  }

  get lastDragDistance() {
    return this._lastDragDistance;
  }

  set lastDragDistance(coord: Coordinate | undefined) {
    this._lastDragDistance = coord;
  }

  get eventDragDistance() {
    return this._eventDragDistance;
  }

  set eventDragDistance(coord: Coordinate | undefined) {
    this._eventDragDistance = coord;
  }

  get lastDragCoord() {
    return this._lastDragCoord;
  }

  set lastDragCoord(coord: Coordinate | undefined) {
    this._lastDragCoord = coord;
  }

  public eventHandler(event: MouseEvent) {
    switch (event.type) {
      case Events.MOUSE_DOWN:
        console.log('Click down');
        this.mouseDownCoord = { x: event.offsetX, y: event.offsetY };
        this._isClickDown = true;
        this._isClickUp = false;
        break;
      case Events.MOUSE_MOVE:
        if (this._isClickDown) {
          if (this.mouseDragStartCoord !== this.mouseDownCoord) {
            this.mouseDragStartCoord = this.mouseDownCoord;
          }

          const lastDragPoint = this.lastDragCoord ?? this.mouseDragStartCoord;

          this.dragDistance = {
            x: event.offsetX - lastDragPoint!.x,
            y: event.offsetY - lastDragPoint!.y,
          };

          this.lastDragCoord = { x: event.offsetX, y: event.offsetY };

          console.log('translate_ ', this.mouseDragStartCoord);
          // TODO
          // decide direction if add or minus
          this._currentTranslate = {
            // x: this._currentTranslate.x + this.dragDistance!.x,
            // y: this._currentTranslate.y + this.dragDistance!.y,
            x:
              event.offsetX -
              this.mouseDragStartCoord!.x +
              this._currentTranslate.x,
            y:
              event.offsetY -
              this.mouseDragStartCoord!.y +
              this._currentTranslate.y,
          };

          const dragEvent: DragEvent = {
            distance: this.dragDistance,
            translate: this._currentTranslate,
          };

          this.onDrag$.next(dragEvent);

          this._isDragMove = true;
          this._isClickUp = true;
        } else {
          this._isDragMove = false;
          this._isClickUp = true;
          const moveEvent: MoveEvent = {
            offsetX: event.offsetX,
            offsetY: event.offsetY,
          };
          this.onMove$.next(moveEvent);
        }
        break;
      case Events.MOUSE_UP:
        console.log('Click up');

        if (this._isDragMove) {
          this.mouseDragEndCoord = { x: event.offsetX, y: event.offsetY };
          this.lastDragDistance = {
            x: event.offsetX - this.mouseDragStartCoord!.x,
            y: event.offsetY - this.mouseDragStartCoord!.y,
          };
          this.lastDragCoord = { x: event.offsetX, y: event.offsetY };
        }

        this.mouseUpCoord = { x: event.offsetX, y: event.offsetY };
        this._isClickDown = false;
        this._isClickUp = true;
        this._isDragMove = false;
        break;
      default:
        console.log(`Event '${event.type}' not found`);
    }
  }
}
