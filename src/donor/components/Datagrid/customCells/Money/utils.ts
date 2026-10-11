import {type Theme,type Rectangle} from "@glideapps/glide-data-grid";
const OFFSET=8;
export function hasDiscountValue(value: number | null | undefined): value is number {
  return value !== undefined && value !== null;
}

/** Radius of the "has price breakdown" marker dot, in device-independent px. */
const BREAKDOWN_MARKER_RADIUS = 2;

/**
 * Draw a small, subtle dot in the top-right corner of a money cell to signal
 * that the price has a breakdown worth opening (discounted or overridden).
 * Uses the theme accent colour so it reads as an interactive affordance
 * without competing with the price text, which is vertically centred.
 */
export function drawBreakdownMarker(ctx: CanvasRenderingContext2D, theme: Theme, rect: Rectangle) {
  const cx = rect.x + rect.width - OFFSET / 2 - BREAKDOWN_MARKER_RADIUS;
  const cy = rect.y + OFFSET / 2 + BREAKDOWN_MARKER_RADIUS;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, BREAKDOWN_MARKER_RADIUS, 0, 2 * Math.PI);
  ctx.fillStyle = theme.accentColor;
  ctx.fill();
  ctx.restore();
}
