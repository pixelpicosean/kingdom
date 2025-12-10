export type rgb = [number, number, number];
export type rgba = [number, number, number, number];
export type hsv = [number, number, number];

// Performance optimization: Pre-computed lookup tables
const HEX_TO_NUM = new Uint8Array(256);
const NUM_TO_HEX = new Uint8Array(16);

// Initialize lookup tables
for (let i = 0; i < 16; i++) {
    NUM_TO_HEX[i] = i < 10 ? 48 + i : 87 + i; // '0'-'9' or 'a'-'f'
}
for (let i = 0; i < 256; i++) {
    HEX_TO_NUM[i] = i >= 48 && i <= 57 ? i - 48 : // '0'-'9'
        i >= 65 && i <= 70 ? i - 55 : // 'A'-'F'
            i >= 97 && i <= 102 ? i - 87 : 0; // 'a'-'f'
}

// Performance optimization: Pre-computed division constants
const INV_255 = 1 / 255;
const INV_60 = 1 / 60;
const INV_360 = 1 / 360;

/**
 * Convert hex color string to RGB format
 * Supports formats: #RGB, #RRGGBB
 */
export function hexToRgb(out: rgb, hex: string): rgb {
    // Performance optimization: Avoid string operations
    const len = hex.length;
    let start = 0;

    // Skip # if present
    if (len > 0 && hex.charCodeAt(0) === 35) { // '#'
        start = 1;
    }

    // Fast path for 3-digit hex
    if (len - start === 3) {
        const c1 = HEX_TO_NUM[hex.charCodeAt(start)];
        const c2 = HEX_TO_NUM[hex.charCodeAt(start + 1)];
        const c3 = HEX_TO_NUM[hex.charCodeAt(start + 2)];

        out[0] = (c1 * 16 + c1) * INV_255;
        out[1] = (c2 * 16 + c2) * INV_255;
        out[2] = (c3 * 16 + c3) * INV_255;
        return out;
    }

    // Fast path for 6-digit hex
    if (len - start === 6) {
        const c1 = HEX_TO_NUM[hex.charCodeAt(start)];
        const c2 = HEX_TO_NUM[hex.charCodeAt(start + 1)];
        const c3 = HEX_TO_NUM[hex.charCodeAt(start + 2)];
        const c4 = HEX_TO_NUM[hex.charCodeAt(start + 3)];
        const c5 = HEX_TO_NUM[hex.charCodeAt(start + 4)];
        const c6 = HEX_TO_NUM[hex.charCodeAt(start + 5)];

        out[0] = (c1 * 16 + c2) * INV_255;
        out[1] = (c3 * 16 + c4) * INV_255;
        out[2] = (c5 * 16 + c6) * INV_255;
        return out;
    }

    // Fallback for other formats
    let hexStr = hex.substring(start);
    if (hexStr.length === 3) {
        hexStr = hexStr[0] + hexStr[0] + hexStr[1] + hexStr[1] + hexStr[2] + hexStr[2];
    }

    out[0] = (HEX_TO_NUM[hexStr.charCodeAt(0)] * 16 + HEX_TO_NUM[hexStr.charCodeAt(1)]) * INV_255;
    out[1] = (HEX_TO_NUM[hexStr.charCodeAt(2)] * 16 + HEX_TO_NUM[hexStr.charCodeAt(3)]) * INV_255;
    out[2] = (HEX_TO_NUM[hexStr.charCodeAt(4)] * 16 + HEX_TO_NUM[hexStr.charCodeAt(5)]) * INV_255;

    return out;
}

/**
 * Convert hex color string to RGBA format
 * Supports formats: #RGB, #RGBA, #RRGGBB, #RRGGBBAA
 */
export function hexToRgba(out: rgba, hex: string): rgba {
    // Performance optimization: Avoid string operations
    const len = hex.length;
    let start = 0;

    // Skip # if present
    if (len > 0 && hex.charCodeAt(0) === 35) { // '#'
        start = 1;
    }

    const hexLen = len - start;

    // Fast path for 3-digit hex
    if (hexLen === 3) {
        const c1 = HEX_TO_NUM[hex.charCodeAt(start)];
        const c2 = HEX_TO_NUM[hex.charCodeAt(start + 1)];
        const c3 = HEX_TO_NUM[hex.charCodeAt(start + 2)];

        out[0] = (c1 * 16 + c1) * INV_255;
        out[1] = (c2 * 16 + c2) * INV_255;
        out[2] = (c3 * 16 + c3) * INV_255;
        out[3] = 1.0;
        return out;
    }

    // Fast path for 4-digit hex
    if (hexLen === 4) {
        const c1 = HEX_TO_NUM[hex.charCodeAt(start)];
        const c2 = HEX_TO_NUM[hex.charCodeAt(start + 1)];
        const c3 = HEX_TO_NUM[hex.charCodeAt(start + 2)];
        const c4 = HEX_TO_NUM[hex.charCodeAt(start + 3)];

        out[0] = (c1 * 16 + c1) * INV_255;
        out[1] = (c2 * 16 + c2) * INV_255;
        out[2] = (c3 * 16 + c3) * INV_255;
        out[3] = (c4 * 16 + c4) * INV_255;
        return out;
    }

    // Fast path for 6-digit hex
    if (hexLen === 6) {
        const c1 = HEX_TO_NUM[hex.charCodeAt(start)];
        const c2 = HEX_TO_NUM[hex.charCodeAt(start + 1)];
        const c3 = HEX_TO_NUM[hex.charCodeAt(start + 2)];
        const c4 = HEX_TO_NUM[hex.charCodeAt(start + 3)];
        const c5 = HEX_TO_NUM[hex.charCodeAt(start + 4)];
        const c6 = HEX_TO_NUM[hex.charCodeAt(start + 5)];

        out[0] = (c1 * 16 + c2) * INV_255;
        out[1] = (c3 * 16 + c4) * INV_255;
        out[2] = (c5 * 16 + c6) * INV_255;
        out[3] = 1.0;
        return out;
    }

    // Fast path for 8-digit hex
    if (hexLen === 8) {
        const c1 = HEX_TO_NUM[hex.charCodeAt(start)];
        const c2 = HEX_TO_NUM[hex.charCodeAt(start + 1)];
        const c3 = HEX_TO_NUM[hex.charCodeAt(start + 2)];
        const c4 = HEX_TO_NUM[hex.charCodeAt(start + 3)];
        const c5 = HEX_TO_NUM[hex.charCodeAt(start + 4)];
        const c6 = HEX_TO_NUM[hex.charCodeAt(start + 5)];
        const c7 = HEX_TO_NUM[hex.charCodeAt(start + 6)];
        const c8 = HEX_TO_NUM[hex.charCodeAt(start + 7)];

        out[0] = (c1 * 16 + c2) * INV_255;
        out[1] = (c3 * 16 + c4) * INV_255;
        out[2] = (c5 * 16 + c6) * INV_255;
        out[3] = (c7 * 16 + c8) * INV_255;
        return out;
    }

    // Fallback for other formats
    let hexStr = hex.substring(start);
    if (hexStr.length === 3) {
        hexStr = hexStr[0] + hexStr[0] + hexStr[1] + hexStr[1] + hexStr[2] + hexStr[2] + 'FF';
    } else if (hexStr.length === 6) {
        hexStr = hexStr + 'FF';
    }

    out[0] = (HEX_TO_NUM[hexStr.charCodeAt(0)] * 16 + HEX_TO_NUM[hexStr.charCodeAt(1)]) * INV_255;
    out[1] = (HEX_TO_NUM[hexStr.charCodeAt(2)] * 16 + HEX_TO_NUM[hexStr.charCodeAt(3)]) * INV_255;
    out[2] = (HEX_TO_NUM[hexStr.charCodeAt(4)] * 16 + HEX_TO_NUM[hexStr.charCodeAt(5)]) * INV_255;
    out[3] = (HEX_TO_NUM[hexStr.charCodeAt(6)] * 16 + HEX_TO_NUM[hexStr.charCodeAt(7)]) * INV_255;

    return out;
}

/**
 * Convert RGB to hex string
 */
export function rgbToHex(r: number, g: number, b: number): string {
    // Performance optimization: Use lookup table and bitwise OR for rounding
    const r8 = (Math.max(0, Math.min(255, r * 255)) + 0.5) | 0;
    const g8 = (Math.max(0, Math.min(255, g * 255)) + 0.5) | 0;
    const b8 = (Math.max(0, Math.min(255, b * 255)) + 0.5) | 0;

    return `#${String.fromCharCode(NUM_TO_HEX[r8 >> 4], NUM_TO_HEX[r8 & 15], NUM_TO_HEX[g8 >> 4], NUM_TO_HEX[g8 & 15], NUM_TO_HEX[b8 >> 4], NUM_TO_HEX[b8 & 15])}`;
}

/**
 * Convert RGBA to hex string
 */
export function rgbaToHex(r: number, g: number, b: number, a: number = 1.0): string {
    // Performance optimization: Use lookup table and bitwise OR for rounding
    const r8 = (Math.max(0, Math.min(255, r * 255)) + 0.5) | 0;
    const g8 = (Math.max(0, Math.min(255, g * 255)) + 0.5) | 0;
    const b8 = (Math.max(0, Math.min(255, b * 255)) + 0.5) | 0;
    const a8 = (Math.max(0, Math.min(255, a * 255)) + 0.5) | 0;

    if (a8 === 255) {
        return `#${String.fromCharCode(NUM_TO_HEX[r8 >> 4], NUM_TO_HEX[r8 & 15], NUM_TO_HEX[g8 >> 4], NUM_TO_HEX[g8 & 15], NUM_TO_HEX[b8 >> 4], NUM_TO_HEX[b8 & 15])}`;
    }

    return `#${String.fromCharCode(NUM_TO_HEX[r8 >> 4], NUM_TO_HEX[r8 & 15], NUM_TO_HEX[g8 >> 4], NUM_TO_HEX[g8 & 15], NUM_TO_HEX[b8 >> 4], NUM_TO_HEX[b8 & 15], NUM_TO_HEX[a8 >> 4], NUM_TO_HEX[a8 & 15])}`;
}

/**
 * Convert RGBA values (0-1 range) to web color string (rgba() format)
 */
export function rgbaToWebString(r: number, g: number, b: number, a: number = 1.0): string {
    const r8 = Math.round(Math.max(0, Math.min(255, r * 255)));
    const g8 = Math.round(Math.max(0, Math.min(255, g * 255)));
    const b8 = Math.round(Math.max(0, Math.min(255, b * 255)));
    return `rgba(${r8}, ${g8}, ${b8}, ${a})`;
}

/**
 * Convert RGB to HSV color space
 * RGB values should be in range [0, 1]
 * HSV values: H in [0, 360], S and V in [0, 1]
 */
export function rgbToHsv(out: hsv, r: number, g: number, b: number): hsv {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    if (diff !== 0) {
        if (max === r) {
            h = ((g - b) / diff) % 6;
        } else if (max === g) {
            h = (b - r) / diff + 2;
        } else {
            h = (r - g) / diff + 4;
        }
    }

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : diff / max;
    const v = max;

    out[0] = h;
    out[1] = s;
    out[2] = v;

    return out;
}

/**
 * Convert HSV to RGB color space
 * HSV values: H in [0, 360], S and V in [0, 1]
 * RGB values will be in range [0, 1]
 */
export function hsvToRgb(out: rgba, h: number, s: number, v: number): rgba {
    h /= 60;

    const c = v * s;
    const x = c * (1 - Math.abs((h % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 1) {
        r = c; g = x; b = 0;
    } else if (h >= 1 && h < 2) {
        r = x; g = c; b = 0;
    } else if (h >= 2 && h < 3) {
        r = 0; g = c; b = x;
    } else if (h >= 3 && h < 4) {
        r = 0; g = x; b = c;
    } else if (h >= 4 && h < 5) {
        r = x; g = 0; b = c;
    } else if (h >= 5 && h < 6) {
        r = c; g = 0; b = x;
    }

    out[0] = (r + m);
    out[1] = (g + m);
    out[2] = (b + m);
    out[3] = 1.0;

    return out;
}

/**
 * Convert HSV to RGBA format
 */
export function hsvToRgba(out: rgba, h: number, s: number, v: number, a: number = 1.0): rgba {
    hsvToRgb(out, h, s, v);
    out[3] = a;
    return out;
}

/**
 * Convert RGBA to HSV color space
 */
export function rgbaToHsv(out: hsv, r: number, g: number, b: number): hsv {
    return rgbToHsv(out, r, g, b);
}

/**
 * Interpolate between two RGBA colors
 * t should be in range [0, 1]
 */
export function lerpRgba(out: rgba, a: rgba, b: rgba, t: number): rgba {
    out[0] = a[0] + (b[0] - a[0]) * t;
    out[1] = a[1] + (b[1] - a[1]) * t;
    out[2] = a[2] + (b[2] - a[2]) * t;
    out[3] = a[3] + (b[3] - a[3]) * t;
    return out;
}

/**
 * Interpolate between two HSV colors
 * t should be in range [0, 1]
 */
export function lerpHsv(out: hsv, a: hsv, b: hsv, t: number): hsv {
    // Handle hue wrapping (shortest path)
    let hDiff = b[0] - a[0];
    if (hDiff > 180) hDiff -= 360;
    if (hDiff < -180) hDiff += 360;

    out[0] = (a[0] + hDiff * t + 360) % 360;
    out[1] = a[1] + (b[1] - a[1]) * t;
    out[2] = a[2] + (b[2] - a[2]) * t;

    return out;
}

/**
 * Create RGBA color from individual components
 */
export function createRgba(r: number, g: number, b: number, a: number = 1.0): rgba {
    return [r, g, b, a];
}

/**
 * Create HSV color from individual components
 */
export function createHsv(h: number, s: number, v: number): hsv {
    return [h, s, v];
}

/**
 * Clone RGBA color
 */
export function cloneRgba(rgba: rgba): rgba {
    return [rgba[0], rgba[1], rgba[2], rgba[3]];
}

/**
 * Clone HSV color
 */
export function cloneHsv(hsv: hsv): hsv {
    return [hsv[0], hsv[1], hsv[2]];
}

/**
 * Convert RGBA to packed 32-bit integer
 */
export function rgbaToU32(r: number, g: number, b: number, a: number): number {
    // Performance optimization: Use bit operations and avoid Math.round
    const r8 = (r * 255 + 0.5) | 0;
    const g8 = (g * 255 + 0.5) | 0;
    const b8 = (b * 255 + 0.5) | 0;
    const a8 = (a * 255 + 0.5) | 0;
    return (a8 << 24) | (b8 << 16) | (g8 << 8) | r8;
}

/**
 * Convert packed 32-bit integer to RGBA
 */
export function u32ToRgba(out: rgba, color: number): rgba {
    out[0] = (color & 0xFF) / 255;           // R
    out[1] = ((color >> 8) & 0xFF) / 255;    // G
    out[2] = ((color >> 16) & 0xFF) / 255;   // B
    out[3] = ((color >> 24) & 0xFF) / 255;   // A
    return out;
}

/**
 * Create RGB color from individual components
 */
export function createRgb(r: number, g: number, b: number): rgb {
    return [r, g, b];
}

/**
 * Clone RGB color
 */
export function cloneRgb(rgb: rgb): rgb {
    return [rgb[0], rgb[1], rgb[2]];
}

/**
 * Infinite, aesthetically pleasing color palette generator.
 *
 * Uses a golden-angle hue progression with low-discrepancy (Halton) variation
 * for saturation and value to produce well-separated, harmonious colors.
 *
 * By default, `next()` returns a hex string. Set `format: 'rgba'` to get an
 * `rgba` tuple instead. You can `reset()` with an optional new starting hue.
 */
export type PaletteFormat = 'hex' | 'rgba';

export interface ColorPaletteGenerator {
    nextHex(): string;
    nextRgba(): rgba;
    reset(start_hue?: number): void;
}

/**
 * Create an infinite color palette generator.
 * @param options - The options for the color palette generator.
 * @returns A color palette generator.
 */
export function makeInfinitePalette(options?: {
    /**
     * Starting hue in degrees (0..360), default randomized.
     */
    start_hue?: number;
    /**
     * Custom golden-angle step, default ~137.508°.
     */
    golden_angle?: number;
    /**
     * Base saturation [0..1], default 0.68.
     */
    base_saturation?: number;
    /**
     * Base value/brightness [0..1], default 0.82.
     */
    base_value?: number;
    /**
     * Alpha for rgba output [0..1], default 1.0.
     */
    alpha?: number;
}): ColorPaletteGenerator {
    const golden_angle = options && options.golden_angle !== undefined ? options.golden_angle : 137.50776405003785;
    const alpha = options && options.alpha !== undefined ? options.alpha : 1.0;

    // Base ranges tuned for balanced, vibrant yet not oversaturated colors
    const base_s = options && options.base_saturation !== undefined ? options.base_saturation : 0.68;
    const base_v = options && options.base_value !== undefined ? options.base_value : 0.82;

    // Initialize starting hue (random by default for diversity across instances)
    let start_hue = options && options.start_hue !== undefined ? options.start_hue : (Math.random() * 360);
    let count = 0;

    // Halton sequence generator for low-discrepancy sampling in [0,1)
    function halton(index: number, base: number): number {
        let f = 1;
        let r = 0;
        let i = index;
        while (i > 0) {
            f = f / base;
            r = r + f * (i % base);
            i = Math.floor(i / base);
        }
        return r;
    }

    function nextColorRgba(): rgba {
        const idx = count + 1;

        // Golden-angle hue ensures near-uniform distribution around the circle
        const hue = (start_hue + idx * golden_angle) % 360;

        // Vary saturation and value with low-discrepancy sequences for subtle diversity
        const s_jitter = halton(idx, 3);  // base-3
        const v_jitter = halton(idx, 2);  // base-2

        const s = Math.min(1, Math.max(0, base_s * (0.9 + 0.2 * s_jitter))); // ~ [0.61..0.82] around baseS
        const v = Math.min(1, Math.max(0, base_v * (0.9 + 0.2 * v_jitter))); // ~ [0.74..0.98] around baseV

        const out: rgba = [0, 0, 0, 1];
        hsvToRgba(out, hue, s, v, alpha);

        count++;

        return out;
    }

    function reset(new_start_hue?: number): void {
        if (new_start_hue !== undefined) {
            start_hue = new_start_hue;
        } else {
            start_hue = Math.random() * 360;
        }
        count = 0;
    }

    function nextHex(): string {
        const rgba_val = nextColorRgba();
        return rgbaToHex(rgba_val[0], rgba_val[1], rgba_val[2], rgba_val[3]);
    }

    return {
        nextHex,
        nextRgba: nextColorRgba,
        reset,
    };
}
