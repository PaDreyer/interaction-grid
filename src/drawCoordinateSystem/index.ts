import { filter, fromEvent, map, merge, Observable, pairwise, tap } from 'rxjs';
import { CanvasSystem } from '../CanvasSystem';
import { getContext } from '../helper';
import type {
  CanvasifyOptions,
  Coordinate,
  DrawCoordinateSystemOptions,
  GridArray,
  MoveEvent,
} from '../interaction.types';
import type { MenuManager } from '../manager/menu.manager';
import type { ObjectManager } from '../manager/object.manager';
import type { StateManager } from '../manager/state.manager';

/**
 * DrawCoordinateSystem is a class for creating objects on a grid pattern
 */
export class DrawCoordinateSystem extends CanvasSystem<DrawCoordinateSystemOptions> {
  private coordinatesForGrid: GridArray = [];
  constructor(
    canvasifyOptions: CanvasifyOptions | undefined,
    options: DrawCoordinateSystemOptions,
    gridElement: HTMLCanvasElement,
    drawElement: HTMLCanvasElement,
    hoverElement: HTMLCanvasElement,
    stateManager: StateManager,
    objectManager: ObjectManager,
    menuManager: MenuManager,
  ) {
    super(
      canvasifyOptions,
      options,
      gridElement,
      drawElement,
      hoverElement,
      stateManager,
      objectManager,
      menuManager,
    );
  }

  /**
   * Initialize events and pattern creation
   * @returns DrawCoordinateSystem
   */
  public draw() {
    this.coordinatesForGrid = this.createGridPatternWithLines();
    this.handleEvents();
    return this;
  }

  public export() {}

  public import() {}

  /**
   * Handle events for elements
   */
  private handleEvents() {
    const eventObservables = this.handleEventsForElement(this.hoverElement, [
      'mousemove',
      'mouseup',
      'mousedown',
      'mouseleave',
    ]);

    const mouseDrag$ = this.handleMouseDragEvents();
    const mouseMove$ = this.handleMouseMoveEvents();
    const mouseUp$ = this.handleMouseUpEvents();
    const mouseDown$ = this.handleMouseDownEvents();
    const mouseLeave$ = this.handleMouseLeaveEvents();

    // register all events
    merge(
      ...eventObservables,
      mouseDown$,
      mouseMove$,
      mouseDrag$,
      mouseUp$,
      mouseLeave$,
    ).subscribe();
  }

  /**
   * Add given events to statemanager event pipeline for a given element
   * @param el Element to register elements on
   * @param events Events to register
   * @returns Observables to subscribe for
   */
  private handleEventsForElement(el: HTMLCanvasElement, events: string[]) {
    const eventObservables: Observable<MouseEvent>[] = [];
    events.forEach((event) => {
      eventObservables.push(
        fromEvent<MouseEvent>(el, event).pipe(
          tap((event: MouseEvent) => this.stateManager.eventHandler(event)),
        ),
      );
    });
    return eventObservables;
  }

  /**
   * Handle mouse leave events from statemanager event pipeline
   * @returns Observable
   */
  private handleMouseLeaveEvents() {
    return this.stateManager.onMouseLeave$.pipe(
      tap(() => {
        const ctx = getContext<CanvasRenderingContext2D>(this.hoverElement);
        if (!this.stateManager.currentPointHint) return;
        this.removePointHintFromContext(
          ctx,
          this.objectManager,
          this.stateManager,
          this.stateManager.currentPointHint,
          this.options.stepLength,
        );
      }),
    );
  }

  /**
   * Handle mouse drag events from statemanager event pipeline
   * @returns Observable
   */
  private handleMouseDragEvents() {
    return this.stateManager.onMouseDrag$.pipe(
      tap(() => {
        const ctx = getContext<CanvasRenderingContext2D>(this.hoverElement);

        this.stateManager.currentPointHint &&
          this.removePointHintFromContext(
            ctx,
            this.objectManager,
            this.stateManager,
            this.stateManager.currentPointHint,
            this.options.stepLength,
          );
        this.hoverElement.style.cursor = 'grabbing';
      }),
      tap((event) => {
        this.translateMultipleLayer(
          [this.drawElement, this.gridElement, this.hoverElement],
          event.translate,
        );

        // recreate grid pattern
        this.coordinatesForGrid = this.createGridPatternWithLines(
          event.translate,
        );

        this.renderObjects(this.drawElement);
      }),
    );
  }

  /**
   * Handle mouse up events from statemanager event pipeline
   * @returns Observable
   */
  private handleMouseMoveEvents() {
    return this.stateManager.onMouseMove$.pipe(
      // throttleTime(50),
      filter(
        (event: MoveEvent) =>
          this.isCoordinateInNearOfGrid(
            { x: event.offsetX, y: event.offsetY },
            this.coordinatesForGrid,
            this.options.stepLength / 2,
            event.translate,
          ) && !this.stateManager.isDragMove,
      ),
      map((event: MoveEvent) =>
        this.getNearestCoordinateToGrid(
          { x: event.offsetX, y: event.offsetY },
          this.coordinatesForGrid,
          this.options.stepLength / 2,
          event.translate,
        ),
      ),
      pairwise(),
      tap((events: Array<undefined | Coordinate>) => {
        const ctx = getContext<CanvasRenderingContext2D>(this.hoverElement);

        if (events[0]) {
          if (!this.stateManager.currentPointHint)
            this.stateManager.currentPointHint = events[0];
          this.removePointHintFromContext(
            ctx,
            this.objectManager,
            this.stateManager,
            this.stateManager.currentPointHint,
            this.options.stepLength,
          );
        }

        if (events[0] && events[1]) {
          const newPointHint = this.createPointHint(
            events[1].x,
            events[1].y,
            this.options.stepLength,
          );
          ctx.fillStyle = 'black';
          this.stateManager.currentPointHint = events[1];
          ctx.fill(newPointHint);
        }
      }),
    );
  }

  /**
   * Handle mouse down events from statemanager event pipeline
   * @returns Observable
   */
  private handleMouseDownEvents() {
    return this.stateManager.onMouseDown$
      .pipe
      /*
          filter((event: MouseEvent) =>
            isCoordinateInNearOfGrid(
              { x: event.offsetX, y: event.offsetY },
              coordinatesForGrid,
              stepLength / 2,
              { x: 0, y: 0 },
            ),
          ),
          map((event: MouseEvent) =>
            getNearestCoordinateToGrid(
              { x: event.offsetX, y: event.offsetY },
              coordinatesForGrid,
              stepLength / 2,
              { x: 0, y: 0 },
            ),
          ),
           */
      ();
  }

  /**
   * Handle mouse up events from statemanager event pipeline
   * @returns Observable
   */
  private handleMouseUpEvents() {
    return this.stateManager.onMouseUp$.pipe(
      tap(() => {
        this.hoverElement.style.cursor = 'default';
      }),
      filter(() => !this.stateManager.wasDrag),
      tap(() => {
        const currentPoint = this.stateManager.currentPointHint;
        if (!currentPoint) throw new Error('Could not get current coordinates');
        this.objectManager.addObject({
          canvas: this.createPointHint(
            currentPoint.x,
            currentPoint.y,
            this.options.stepLength,
          ),
          color: 'blue',
          coord: currentPoint,
        });
      }),
      tap(() => {
        this.renderObjects(this.drawElement);
      }),
    );
  }

  /**
   * Calculate grid pattern
   * @param translate Translation offset
   * @returns GridPattern
   */
  private createGridPatternWithLines(translate = { x: 0, y: 0 }): GridArray {
    const ctx = getContext<CanvasRenderingContext2D>(this.gridElement);
    const height = this.gridElement.height;
    const width = this.gridElement.width;
    const stepLength = this.options.stepLength;

    const coordinatesForGrid: GridArray = [];
    const absX = Math.abs(translate.x);
    const absY = Math.abs(translate.y);

    // when drag down animate fall for vertical
    const calculatedStartY = translate.y - (translate.y % stepLength);
    const calculatedMaxHeight = height - translate.y;

    // draw vertical lines
    for (
      let currentHeight = -calculatedStartY;
      currentHeight <= calculatedMaxHeight;
      currentHeight += stepLength
    ) {
      ctx.beginPath();
      ctx.moveTo(-translate.x, currentHeight);
      ctx.lineTo(width + absX, currentHeight);
      ctx.stroke();
    }

    // when drag right animate fall for horizontal
    const calculatedStartX = translate.x - (translate.x % stepLength);
    const calculatedMaxWidth = width - translate.x;

    // draw horizontal lines
    for (
      let currentWidth = -calculatedStartX;
      currentWidth <= calculatedMaxWidth;
      currentWidth += stepLength
    ) {
      ctx.beginPath();
      ctx.moveTo(currentWidth, -translate.y);
      ctx.lineTo(currentWidth, height + absY);
      ctx.stroke();
    }

    const currentYStart = -translate.y + (translate.y % stepLength);
    const currentYMax = -translate.y + height;
    const currentXStart = -translate.x + (translate.x % stepLength);
    const currentXMax = -translate.x + width;

    // iterate trough Y
    for (
      let currentPoint = currentYStart;
      currentPoint <= currentYMax;
      currentPoint += stepLength
    ) {
      // iterate through X
      for (
        let currentCollectPoint = currentXStart;
        currentCollectPoint <= currentXMax;
        currentCollectPoint += stepLength
      ) {
        coordinatesForGrid.push({
          x: currentCollectPoint,
          y: currentPoint,
        });
      }
    }

    return coordinatesForGrid;
  }

  /**
   * Create a point with given dimensions
   * @param x Width
   * @param y Height
   * @param stepLength Radius
   * @returns 2DPath Point
   */
  private createPointHint(x: number, y: number, stepLength: number): Path2D {
    const PointHint = new Path2D();
    PointHint.arc(x, y, stepLength / 5, 0, 360);
    return PointHint;
  }

  /**
   * Remove a point hint from given context
   * @param ctx Context to remove point from
   * @param objectManager ObjectManager
   * @param stateManager StateManager
   * @param coord Coordinate
   * @param stepLength Steplength for point calculation
   */
  private removePointHintFromContext(
    ctx: CanvasRenderingContext2D,
    objectManager: ObjectManager,
    stateManager: StateManager,
    coord: Coordinate,
    stepLength: number,
  ): void {
    ctx.beginPath();
    ctx.clearRect(
      coord.x - stepLength / 3 - 1,
      coord.y - stepLength / 3 - 1,
      (stepLength / 3) * 2 + 2,
      (stepLength / 3) * 2 + 2,
    );
    ctx.closePath();
  }

  /**
   * Render objects from object manager to given context
   * @param el Element to render objects at
   */
  private renderObjects(el: HTMLCanvasElement): void {
    const ctx = el.getContext('2d');
    if (!ctx)
      throw new Error('Could not get context of canvas element at renderer');

    ctx.beginPath();
    this.objectManager.objects.forEach((object) => {
      ctx.fillStyle = object.color ?? 'black';
      ctx.fill(object.canvas);
    });
    ctx.closePath();
  }

  /**
   * Check if coordinate is in near of a coordinate from grid
   * @param coord Coordinate to check for
   * @param grid Coordinates to check againts
   * @param range Valid range to accept
   * @param translate Translation offset
   * @returns boolean If coordinate is in near of one grid coordinate
   */
  private isCoordinateInNearOfGrid(
    coord: Coordinate,
    grid: GridArray,
    range: number,
    translate: Coordinate,
  ): boolean {
    for (let coordinate = 0; coordinate < grid.length; coordinate++) {
      if (this.pointIsInRange(coord, grid[coordinate], range, translate)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get nearest coordinate from current point at grid in a given range
   * @param coord Coordinate to check for
   * @param grid  Coordinates from grid
   * @param range Valid range to look for
   * @param translate Translation offset
   * @returns Coordinate | undefined Coordinate from grid found for given coordinate
   */
  private getNearestCoordinateToGrid(
    coord: Coordinate,
    grid: GridArray,
    range: number,
    translate: Coordinate,
  ): Coordinate | undefined {
    for (let coordinate = 0; coordinate < grid.length; coordinate++) {
      if (this.pointIsInRange(coord, grid[coordinate], range, translate)) {
        return grid[coordinate];
      }
    }
    return;
  }

  /**
   * Translate multiple canvas layer with given offset
   * @param multipleLayer Layer to translate
   * @param offset Offset for position translation
   */
  private translateMultipleLayer(
    multipleLayer: Array<HTMLCanvasElement>,
    offset: Coordinate,
  ): void {
    for (const layer of multipleLayer) {
      const ctx = getContext<CanvasRenderingContext2D>(layer);

      ctx.resetTransform();
      ctx.clearRect(0, 0, layer.width, layer.height);
      ctx.translate(offset.x, offset.y);
    }
  }

  /**
   * Check if a point is in range of coordinate
   * @param point point to check for
   * @param coord coordinate to check against
   * @param range valid range from point to coordinate
   * @param translate translation from grid
   * @returns boolean if point is in range
   */
  private pointIsInRange(
    point: Coordinate,
    coord: Coordinate,
    range: number,
    translate: Coordinate,
  ): boolean {
    return (
      coord.y + range > point.y - translate.y &&
      coord.y - range < point.y - translate.y &&
      coord.x + range > point.x - translate.x &&
      coord.x - range < point.x - translate.x
    );
  }
}
