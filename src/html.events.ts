import {
  CanvasElements,
  Coordinate,
  DragEvent,
  GridArray,
  MoveEvent,
} from './interaction.types';
import { filter, fromEvent, map, merge, pairwise, tap } from 'rxjs';
import { State } from './state-manager';
import {
  createGridPatternWithLines,
  createPointHint,
  getNearestCoordinateToGrid,
  isCoordinateInNearOfGrid,
  removePointHintFromContext,
} from './helper';

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
  state: State,
) {
  const { draw: drawElement, grid: gridElement } = canvasElements;

  // handle event pipeline for state handler (mousemove)
  const mouseMoveStateHandler$ = fromEvent<MouseEvent>(
    drawElement,
    'mousemove',
  ).pipe(tap((event: MouseEvent) => state.eventHandler(event)));

  // event pipe for mouse drag case
  const mouseDrag$ = state.onDrag$.pipe(
    tap((_: DragEvent) => {
      const ctx = drawElement.getContext('2d');

      if (!ctx) throw new Error('Canvas Draw Element Context is not available');

      state.currentPointHint &&
        removePointHintFromContext(ctx, state.currentPointHint, stepLength);
      drawElement.style.cursor = 'grabbing';
    }),
    tap((event) => {
      const ctxDraw = drawElement.getContext('2d');
      if (!ctxDraw) throw new Error('Canvas Draw Context not available');

      const ctxGrid = gridElement.getContext('2d');
      if (!ctxGrid) throw new Error('Canvas Grid Context not available');

      // reset transform for translate to (0,0)
      ctxDraw.resetTransform();
      ctxGrid.resetTransform();

      // clear old canvas for rerender
      ctxGrid.clearRect(0, 0, gridElement.width, gridElement.height);
      ctxDraw.clearRect(0, 0, drawElement.width, drawElement.height);

      // translate canvas for distance
      ctxDraw.translate(event.translate.x, event.translate.y);
      ctxGrid.translate(event.translate.x, event.translate.y);

      // recreate grid pattern
      coordinatesForGrid = createGridPatternWithLines(
        ctxGrid,
        gridElement.height,
        gridElement.width,
        stepLength,
        event.translate,
      );

      state.logger.log(
        `Coordinates for grid: ${JSON.stringify(
          coordinatesForGrid[coordinatesForGrid.length - 1],
          null,
          2,
        )}`,
      );
    }),
  );

  // event pipe for mouse move case
  const mouseMove$ = state.onMove$.pipe(
    filter(
      (event: MoveEvent) =>
        isCoordinateInNearOfGrid(
          { x: event.offsetX, y: event.offsetY },
          coordinatesForGrid,
          stepLength / 2,
          event.translate,
        ) && !state.isDragMove,
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
      const ctx = drawElement.getContext('2d');
      if (!ctx) throw new Error('Canvas Draw Context not available');

      events[0] && removePointHintFromContext(ctx, events[0], stepLength);
      ctx.fillStyle = 'blue';

      if (events[1]) {
        const newPointHint = createPointHint(
          events[1].x,
          events[1].y,
          stepLength,
        );
        state.currentPointHint = events[1];
        ctx.fill(newPointHint);
      }
    }),
  );

  // event pipe for mouse down case
  const mouseDown$ = fromEvent<MouseEvent>(drawElement, 'mousedown').pipe(
    tap((event: MouseEvent) => state.eventHandler(event)),
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
    tap((event: any) => {
      if (event instanceof PointerEvent) {
        const ctx = drawElement.getContext('2d');
        if (!ctx) throw new Error('Canvas Draw Context not available');

        ctx.fillStyle = 'blue';
        ctx.fill(createPointHint(event.offsetX, event.offsetY, stepLength));
      }
    }),
  );

  // event pipe for mouse up case
  const mouseUp$ = fromEvent<MouseEvent>(drawElement, 'mouseup').pipe(
    tap((event: MouseEvent) => state.eventHandler(event)),
    tap(() => {
      drawElement.style.cursor = 'default';
    }),
  );

  // register all events
  merge(
    mouseMoveStateHandler$,
    mouseDown$,
    mouseMove$,
    mouseDrag$,
    mouseUp$,
  ).subscribe();
}
