import {
  CanvasElements,
  Coordinate,
  DragEvent,
  GridArray,
  MoveEvent,
} from './interaction.types';
import {
  filter,
  fromEvent,
  map,
  merge,
  pairwise,
  tap,
  throttle,
  throttleTime,
} from 'rxjs';
import { StateManager } from './state.manager';
import {
  createGridPatternWithLines,
  createPointHint,
  getContext,
  getNearestCoordinateToGrid,
  isCoordinateInNearOfGrid,
  removePointHintFromContext,
  renderObjects,
  translateMultipleLayer,
} from './helper';
import { ObjectManager } from './object.manager';

/**
 * Create event handler for canvas elements
 * @param canvasElements
 * @param stepLength
 * @param coordinatesForGrid
 * @param state State
 */
export function handleCanvasEvents(
  canvasElements: CanvasElements,
  stepLength: number,
  coordinatesForGrid: GridArray,
  stateManager: StateManager,
  objectManager: ObjectManager,
) {
  const { draw: drawElement, grid: gridElement } = canvasElements;

  /*---------------------------------------------------------------------------------------------*/
  /*                    handle event pipelines for state handler                                 */
  const mouseMoveStateHandler$ = fromEvent<MouseEvent>(
    drawElement,
    'mousemove',
  ).pipe(tap((event: MouseEvent) => stateManager.eventHandler(event)));

  // handle event pipeline for state handler (mouseup)
  const mouseUpStateHandler$ = fromEvent<MouseEvent>(
    drawElement,
    'mouseup',
  ).pipe(tap((event: MouseEvent) => stateManager.eventHandler(event)));

  // handle event pipeline for state handler (mousedown)
  const mouseDownStateHandler$ = fromEvent<MouseEvent>(
    drawElement,
    'mousedown',
  ).pipe(tap((event: MouseEvent) => stateManager.eventHandler(event)));

  /*---------------------------------------------------------------------------------------------*/
  /*                              handle event for mouse drag                                    */
  /*---------------------------------------------------------------------------------------------*/
  // event pipe for mouse drag case
  const mouseDrag$ = stateManager.onMouseDrag$.pipe(
    tap((_: DragEvent) => {
      const ctx = getContext<CanvasRenderingContext2D>(drawElement);

      stateManager.currentPointHint &&
        removePointHintFromContext(
          ctx,
          objectManager,
          stateManager,
          stateManager.currentPointHint,
          stepLength,
        );
      drawElement.style.cursor = 'grabbing';
    }),
    tap((event) => {
      const ctxDraw = getContext<CanvasRenderingContext2D>(drawElement);
      const ctxGrid = getContext<CanvasRenderingContext2D>(gridElement);

      translateMultipleLayer([drawElement, gridElement], event.translate);

      // recreate grid pattern
      coordinatesForGrid = createGridPatternWithLines(
        ctxGrid,
        gridElement.height,
        gridElement.width,
        stepLength,
        event.translate,
      );

      renderObjects(drawElement, objectManager, stateManager);
    }),
  );

  /*---------------------------------------------------------------------------------------------*/
  /*                              handle event for mouse move                                    */
  /*---------------------------------------------------------------------------------------------*/
  // event pipe for mouse move case
  const mouseMove$ = stateManager.onMouseMove$.pipe(
    //throttleTime(100),
    filter(
      (event: MoveEvent) =>
        isCoordinateInNearOfGrid(
          { x: event.offsetX, y: event.offsetY },
          coordinatesForGrid,
          stepLength / 2,
          event.translate,
        ) && !stateManager.isDragMove,
    ),
    map((event: MoveEvent) =>
      getNearestCoordinateToGrid(
        { x: event.offsetX, y: event.offsetY },
        coordinatesForGrid,
        stepLength / 2,
        event.translate,
      ),
    ),
    pairwise(),
    tap((events: Array<undefined | Coordinate>) => {
      const ctx = getContext<CanvasRenderingContext2D>(drawElement);

      if (!stateManager.currentPointHint)
        stateManager.currentPointHint = events[0];

      console.log('removed');
      events[0] &&
        removePointHintFromContext(
          ctx,
          objectManager,
          stateManager,
          stateManager.currentPointHint!,
          stepLength,
        );

      ctx.fillStyle = 'black';

      if (events[0] && events[1]) {
        const newPointHint = createPointHint(
          events[1].x,
          events[1].y,
          stepLength,
        );
        stateManager.currentPointHint = events[1];
        ctx.fill(newPointHint);
      }
    }),
  );

  /*---------------------------------------------------------------------------------------------*/
  /*                              handle event for mouse down                                    */
  /*---------------------------------------------------------------------------------------------*/
  // event pipe for mouse down case
  const mouseDown$ = stateManager.onMouseDown$
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

  /*---------------------------------------------------------------------------------------------*/
  /*                              handle event for mouse up                                      */
  /*---------------------------------------------------------------------------------------------*/
  // event pipe for mouse up case
  const mouseUp$ = stateManager.onMouseUp$.pipe(
    tap(() => {
      drawElement.style.cursor = 'default';
    }),
    filter(() => !stateManager.wasDrag),
    tap(() => {
      const currentPoint = stateManager.currentPointHint;
      if (!currentPoint) throw new Error('Could not get current coordinates');
      objectManager.addObject({
        canvas: createPointHint(currentPoint.x, currentPoint.y, stepLength),
        color: 'blue',
        coord: currentPoint,
      });
    }),
    tap(() => {
      renderObjects(drawElement, objectManager, stateManager);
    }),
  );

  // register all events
  merge(
    mouseMoveStateHandler$,
    mouseUpStateHandler$,
    mouseDownStateHandler$,
    mouseDown$,
    mouseMove$,
    mouseDrag$,
    mouseUp$,
  ).subscribe();
}
