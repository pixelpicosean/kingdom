import {
    normalizeAngle,
    normalizeArcLength,
    angleIsBetween,
} from './utils';
import type { vec2 } from './vec2';

/**
 * UI hit testing: check if point (x, y) is inside rectangle at (rect_x, rect_y) with size (rect_w, rect_h)
 * @param x - The x coordinate of the point
 * @param y - The y coordinate of the point
 * @param rect_x - The x coordinate of the rectangle
 * @param rect_y - The y coordinate of the rectangle
 * @param rect_w - The width of the rectangle
 * @param rect_h - The height of the rectangle
 */
export function pointInRect(x: number, y: number, rect_x: number, rect_y: number, rect_w: number, rect_h: number): boolean {
    return x >= rect_x && x < rect_x + rect_w && y >= rect_y && y < rect_y + rect_h;
}

/**
 * Shape hit testing: check if point (x, y) is inside local bounds [0, w] x [0, h]
 * @param w - The width of the local bounds
 * @param h - The height of the local bounds
 * @param x - The x coordinate of the point
 * @param y - The y coordinate of the point
 */
export function pointInLocalRect(w: number, h: number, x: number, y: number): boolean {
    return x >= 0 && x <= w && y >= 0 && y <= h;
}

/**
 * Shape hit testing: check if point (x, y) is inside oval with center at (cx, cy) and radius (rx, ry)
 * @param w - The width of the oval
 * @param h - The height of the oval
 * @param start_angle - The start angle of the oval
 * @param end_angle - The end angle of the oval
 * @param inner_radius - The inner radius of the oval
 * @param x - The x coordinate of the point
 * @param y - The y coordinate of the point
 */
export function pointInOval(
    w: number,
    h: number,
    start_angle: number,
    end_angle: number,
    inner_radius: number,
    x: number,
    y: number,
): boolean {
    const cx = w / 2;
    const cy = h / 2;
    const rx = w / 2;
    const ry = h / 2;
    const dx = x - cx;
    const dy = y - cy;

    // Normalize radius for ellipse
    const r_norm = Math.hypot(dx / rx, dy / ry);
    if (r_norm > 1 + 1e-9) return false;
    if (inner_radius > 0 && r_norm < inner_radius - 1e-9) return false;

    // Full ellipse if arc covers >= 2pi effectively
    const arc_len = normalizeArcLength(start_angle, end_angle);
    if (arc_len >= Math.PI * 2 - 1e-6) return true;

    const angle = normalizeAngle(Math.atan2(dy, dx));
    const start = normalizeAngle(start_angle);
    const end = normalizeAngle(end_angle);
    return angleIsBetween(angle, start, arc_len);
}

/**
 * Standard ray-casting point-in-polygon
 * @param points - The points of the polygon
 * @param x - The x coordinate of the point
 * @param y - The y coordinate of the point
 */
export function pointInPolygon(points: vec2[], x: number, y: number): boolean {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i][0], yi = points[i][1];
        const xj = points[j][0], yj = points[j][1];
        const intersect = ((yi > y) !== (yj > y)) &&
            (x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}
