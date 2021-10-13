/**
 * Try to get context
 * @param el
 * @param type
 */
export function getContext<T extends RenderingContext>(
  el: HTMLCanvasElement,
  type = '2d',
): T {
  const ctx = el.getContext(type);
  if (!ctx) throw new Error(`Canvas context for ${el} not available.`);
  return ctx as unknown as T;
}
