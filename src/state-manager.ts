import { BaseLogger, Coordinate, DragEvent, Events, Logger, MoveEvent, StateOptions } from './interaction.types';
import { Subject } from 'rxjs';
import { DefaultLogger } from './logger';


const defaultStateOptions: StateOptions = {
  debug: false,
}

/**
 * Saves interaction state
 */
export class State {
  private _options: StateOptions = defaultStateOptions;
  private _logger: BaseLogger;
  // public onDrag observable
  public onDrag$ = new Subject<DragEvent>();
  // public onMove observable
  public onMove$ = new Subject<MoveEvent>();
  // translation state for stacking
  private _currentTranslate: Coordinate = { x: 0, y: 0 };
  // states for internal usage
  private _isClickDown = false;
  private _isClickUp = false;
  private _isDragMove = false;
  // current coordinates for point hint (cursor hover)
  private _currentPointHint: Coordinate | undefined;
  // coordinates for mouse down
  private _mouseDownCoord: Coordinate | undefined;
  // coordinates for mouse up
  private _mouseUpCoord: Coordinate | undefined;
  // coordinates for mouse drag start
  private _mouseDragStartCoord: Coordinate | undefined;
  // coordinates for mouse drag end 
  private _mouseDragEndCoord: Coordinate | undefined;
  // drag distance for single event
  private _dragDistance: Coordinate | undefined;
  // coordinates from event before to calculate drag distance
  private _lastDragCoord: Coordinate | undefined;
  // absolute drag distance from last event
  private _lastDragDistance: Coordinate | undefined;

  /**
   * Construct state class
   * @param options StateOptions options to merge with default options
   */
  constructor(options?: StateOptions) {
    if(options) this._options = { ...this._options, ...options };
    const logger = options?.logger;
    if(logger) this._logger = new logger(this._options);
    else this._logger = new DefaultLogger(this._options);
  }

  get options() {
    return this._options;
  }

  set options(newOptions: StateOptions) {
    this._options = newOptions;
  }

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

  get lastDragCoord() {
    return this._lastDragCoord;
  }

  set lastDragCoord(coord: Coordinate | undefined) {
    this._lastDragCoord = coord;
  }

  /**
   * Handles events from elements
   * Split some events granular and emit on rxjs observables 
   * @param event MouseEvent
   */
  public eventHandler(event: MouseEvent) {
    switch (event.type) {
      case Events.MOUSE_DOWN:
        this.handleMouseDownEvent(event);
        break;
      case Events.MOUSE_MOVE:
        this.handleMouseMoveEvent(event);
        break;
      case Events.MOUSE_UP:
        this.handleMouseUpEvent(event);
        break;
      default:
        console.error(`Event '${event.type}' not found`);
    }
  }

  /**
   * Handle mouse down event
   * @param event MouseEvent
   */
  private handleMouseDownEvent(event: MouseEvent) {
    this._logger.log(`Click down at x: ${event.offsetX} / y: ${event.offsetY}`);
    // Save mouse down coord for later usage
    this.mouseDownCoord = { x: event.offsetX, y: event.offsetY };

    // update state
    this._isClickDown = true;
    this._isClickUp = false;
  }

  /**
   * Handle mouse move event
   * @param event MouseEvent
   */
  private handleMouseMoveEvent(event: MouseEvent) {
    // Check if event is drag
    if (this.isClickDown) {

      // Set mouseDragStartCoord when it isnt set for current drag
      if (this.mouseDragStartCoord !== this.mouseDownCoord) {
        this.mouseDragStartCoord = this.mouseDownCoord;
      }

      // When lastDragCoord is undefined we are in the first step, so use initial mouseDragStartCoord (mouseDownCoord)
      const lastDragPoint = this.lastDragCoord ?? this.mouseDragStartCoord;

      // Calculate drag distance for current event
      this.dragDistance = {
        x: event.offsetX - lastDragPoint!.x,
        y: event.offsetY - lastDragPoint!.y,
      };

      // Update lastDragCoord to current position
      this.lastDragCoord = { x: event.offsetX, y: event.offsetY };

      // Current absolute translation
      this._currentTranslate = {
        x:
          this._currentTranslate!.x + this.dragDistance!.x,
        y:
          this._currentTranslate!.y + this.dragDistance!.y,
      };

      // DragEvent for rxjs pipe
      const dragEvent: DragEvent = {
        distance: this.dragDistance,
        translate: this._currentTranslate,
      };

      // Call rxjs pipe with event
      this.onDrag$.next(dragEvent);

      // update state
      this._isDragMove = true;
      this._isClickUp = true;

    // is mouse move event
    } else {
      // update state
      this._isDragMove = false;
      this._isClickUp = true;
      
      // MoveEvent for rxjs pipe
      const moveEvent: MoveEvent = {
        offsetX: event.offsetX,
        offsetY: event.offsetY,
      };

      // Call rxjs pipe with event
      this.onMove$.next(moveEvent);
    }
  }

  /**
   * Handle mouse up event
   * @param event MouseEvent
   */
  private handleMouseUpEvent(event: MouseEvent) {
    this._logger.log(`Click up at x: ${event.offsetX} / y: ${event.offsetY}`);

    // If everything before was a drag event
    if (this._isDragMove) {
      // Save mouse drag end coord
      this.mouseDragEndCoord = { x: event.offsetX, y: event.offsetY };

      // Absolute last drag distance
      this.lastDragDistance = {
        x: event.offsetX - this.mouseDragStartCoord!.x,
        y: event.offsetY - this.mouseDragStartCoord!.y,
      };

      // Reset buffer for drag event, so mouseDragStart is choosen the first time
      this.lastDragCoord = undefined;
    }

    // Save mouse up coord
    this.mouseUpCoord = { x: event.offsetX, y: event.offsetY };

    // Update state
    this._isClickDown = false;
    this._isClickUp = true;
    this._isDragMove = false;
  }
}
