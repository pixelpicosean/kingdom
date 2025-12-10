export const EPSILON = 0.000001;

const DEG_TO_RAD = Math.PI / 180.0;
const RAD_TO_DEG = 180.0 / Math.PI;

export function degToRad(deg: number): number {
    return deg * DEG_TO_RAD;
}

export function radToDeg(rad: number): number {
    return rad * RAD_TO_DEG;
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function normalizeAngle(a: number): number {
    a = a % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    return a;
}

export function normalizeArcLength(start: number, end: number): number {
    const twoPi = Math.PI * 2;
    const raw = end - start;
    // Reduce to [0, 2pi)
    let d = raw % twoPi;
    if (d < 0) d += twoPi;
    // If raw is a non-zero multiple of 2pi (full circle), preserve as 2pi rather than 0
    if (Math.abs(d) < 1e-12 && Math.abs(raw) > 0) return twoPi;
    return d;
}

export function angleIsBetween(angle: number, start: number, arcLen: number): boolean {
    // advance from start by arcLen (positive direction)
    const end = (start + arcLen) % (Math.PI * 2);
    if (arcLen >= Math.PI * 2) return true;
    if (arcLen <= 0) return false;
    if (start <= end) {
        return angle >= start && angle <= end;
    } else {
        // wrap-around
        return angle >= start || angle <= end;
    }
}

export function clamp01(v: number): number { return Math.min(1, Math.max(0, v)); }

/**
 * Gets the next power of 2 that is greater than or equal to the given number
 */
export function nextPowerOf2(n: number): number {
    if (n <= 0) return 1;
    if (n === 1) return 2;

    let power = 1;
    while (power < n) {
        power <<= 1;
    }
    return power;
}
