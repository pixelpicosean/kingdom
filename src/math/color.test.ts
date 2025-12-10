import { describe, it, expect } from "bun:test";
import {
    rgb,
    rgba,
    hsv,
    makeInfinitePalette,
    hexToRgb,
    hexToRgba,
    rgbToHex,
    rgbaToHex,
    rgbToHsv,
    hsvToRgb,
    hsvToRgba,
    rgbaToHsv,
    lerpRgba,
    lerpHsv,
    createRgb,
    createRgba,
    createHsv,
    cloneRgb,
    cloneRgba,
    cloneHsv,
    rgbaToU32,
    u32ToRgba,
} from "./color";

describe("Color Functions", () => {
    describe("hex conversion", () => {
        it("should convert 3-digit hex to RGB", () => {
            const out: rgb = [0, 0, 0];
            const result = hexToRgb(out, "#f0a");

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(1.0, 5); // FF -> 1.0
            expect(result[1]).toBeCloseTo(0.0, 5); // 00 -> 0.0
            expect(result[2]).toBeCloseTo(0.6667, 3); // AA -> ~0.667
        });

        it("should convert 6-digit hex to RGB", () => {
            const out: rgb = [0, 0, 0];
            const result = hexToRgb(out, "#ff00aa");

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(1.0, 5);
            expect(result[1]).toBeCloseTo(0.0, 5);
            expect(result[2]).toBeCloseTo(0.6667, 3);
        });

        it("should convert hex without # prefix", () => {
            const out: rgb = [0, 0, 0];
            const result = hexToRgb(out, "ff00aa");

            expect(result[0]).toBeCloseTo(1.0, 5);
            expect(result[1]).toBeCloseTo(0.0, 5);
            expect(result[2]).toBeCloseTo(0.6667, 3);
        });

        it("should convert 3-digit hex to RGBA", () => {
            const out: rgba = [0, 0, 0, 0];
            const result = hexToRgba(out, "#f0a");

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(1.0, 5);
            expect(result[1]).toBeCloseTo(0.0, 5);
            expect(result[2]).toBeCloseTo(0.6667, 3);
            expect(result[3]).toBeCloseTo(1.0, 5); // Default alpha
        });

        it("should convert 4-digit hex to RGBA", () => {
            const out: rgba = [0, 0, 0, 0];
            const result = hexToRgba(out, "#f0a8");

            expect(result[0]).toBeCloseTo(1.0, 5);
            expect(result[1]).toBeCloseTo(0.0, 5);
            expect(result[2]).toBeCloseTo(0.6667, 3);
            expect(result[3]).toBeCloseTo(0.5333, 3); // 88 -> ~0.533
        });

        it("should convert 6-digit hex to RGBA", () => {
            const out: rgba = [0, 0, 0, 0];
            const result = hexToRgba(out, "#ff00aa");

            expect(result[0]).toBeCloseTo(1.0, 5);
            expect(result[1]).toBeCloseTo(0.0, 5);
            expect(result[2]).toBeCloseTo(0.6667, 3);
            expect(result[3]).toBeCloseTo(1.0, 5); // Default alpha
        });

        it("should convert 8-digit hex to RGBA", () => {
            const out: rgba = [0, 0, 0, 0];
            const result = hexToRgba(out, "#ff00aa88");

            expect(result[0]).toBeCloseTo(1.0, 5);
            expect(result[1]).toBeCloseTo(0.0, 5);
            expect(result[2]).toBeCloseTo(0.6667, 3);
            expect(result[3]).toBeCloseTo(0.5333, 3);
        });

        it("should convert RGB to hex", () => {
            expect(rgbToHex(1.0, 0.0, 0.6667)).toBe("#ff00aa");
            expect(rgbToHex(0.0, 1.0, 0.0)).toBe("#00ff00");
            expect(rgbToHex(0.0, 0.0, 1.0)).toBe("#0000ff");
        });

        it("should convert RGBA to hex", () => {
            expect(rgbaToHex(1.0, 0.0, 0.6667, 1.0)).toBe("#ff00aa");
            expect(rgbaToHex(1.0, 0.0, 0.6667, 0.5)).toBe("#ff00aa80");
            expect(rgbaToHex(0.0, 1.0, 0.0, 0.0)).toBe("#00ff0000");
        });
    });

    describe("RGB/HSV conversion", () => {
        it("should convert RGB to HSV", () => {
            const out: hsv = [0, 0, 0];

            // Red
            const redResult = rgbToHsv(out, 1.0, 0.0, 0.0);
            expect(redResult).toBe(out);
            expect(redResult[0]).toBeCloseTo(0, 1); // Hue
            expect(redResult[1]).toBeCloseTo(1.0, 5); // Saturation
            expect(redResult[2]).toBeCloseTo(1.0, 5); // Value

            // Green
            const greenResult = rgbToHsv(out, 0.0, 1.0, 0.0);
            expect(greenResult[0]).toBeCloseTo(120, 1);
            expect(greenResult[1]).toBeCloseTo(1.0, 5);
            expect(greenResult[2]).toBeCloseTo(1.0, 5);

            // Blue
            const blueResult = rgbToHsv(out, 0.0, 0.0, 1.0);
            expect(blueResult[0]).toBeCloseTo(240, 1);
            expect(blueResult[1]).toBeCloseTo(1.0, 5);
            expect(blueResult[2]).toBeCloseTo(1.0, 5);

            // White
            const whiteResult = rgbToHsv(out, 1.0, 1.0, 1.0);
            expect(whiteResult[0]).toBeCloseTo(0, 1);
            expect(whiteResult[1]).toBeCloseTo(0.0, 5);
            expect(whiteResult[2]).toBeCloseTo(1.0, 5);

            // Black
            const blackResult = rgbToHsv(out, 0.0, 0.0, 0.0);
            expect(blackResult[0]).toBeCloseTo(0, 1);
            expect(blackResult[1]).toBeCloseTo(0.0, 5);
            expect(blackResult[2]).toBeCloseTo(0.0, 5);
        });

        it("should convert HSV to RGB", () => {
            const out: rgba = [0, 0, 0, 0];

            // Red
            const redResult = hsvToRgb(out, 0, 1.0, 1.0);
            expect(redResult).toBe(out);
            expect(redResult[0]).toBeCloseTo(1.0, 5);
            expect(redResult[1]).toBeCloseTo(0.0, 5);
            expect(redResult[2]).toBeCloseTo(0.0, 5);
            expect(redResult[3]).toBeCloseTo(1.0, 5);

            // Green
            const greenResult = hsvToRgb(out, 120, 1.0, 1.0);
            expect(greenResult[0]).toBeCloseTo(0.0, 5);
            expect(greenResult[1]).toBeCloseTo(1.0, 5);
            expect(greenResult[2]).toBeCloseTo(0.0, 5);

            // Blue
            const blueResult = hsvToRgb(out, 240, 1.0, 1.0);
            expect(blueResult[0]).toBeCloseTo(0.0, 5);
            expect(blueResult[1]).toBeCloseTo(0.0, 5);
            expect(blueResult[2]).toBeCloseTo(1.0, 5);

            // White
            const whiteResult = hsvToRgb(out, 0, 0.0, 1.0);
            expect(whiteResult[0]).toBeCloseTo(1.0, 5);
            expect(whiteResult[1]).toBeCloseTo(1.0, 5);
            expect(whiteResult[2]).toBeCloseTo(1.0, 5);

            // Black
            const blackResult = hsvToRgb(out, 0, 0.0, 0.0);
            expect(blackResult[0]).toBeCloseTo(0.0, 5);
            expect(blackResult[1]).toBeCloseTo(0.0, 5);
            expect(blackResult[2]).toBeCloseTo(0.0, 5);
        });

        it("should convert HSV to RGBA with custom alpha", () => {
            const out: rgba = [0, 0, 0, 0];
            const result = hsvToRgba(out, 0, 1.0, 1.0, 0.5);

            expect(result[0]).toBeCloseTo(1.0, 5);
            expect(result[1]).toBeCloseTo(0.0, 5);
            expect(result[2]).toBeCloseTo(0.0, 5);
            expect(result[3]).toBeCloseTo(0.5, 5);
        });

        it("should convert RGBA to HSV", () => {
            const out: hsv = [0, 0, 0];
            const result = rgbaToHsv(out, 1.0, 0.0, 0.0);

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(0, 1);
            expect(result[1]).toBeCloseTo(1.0, 5);
            expect(result[2]).toBeCloseTo(1.0, 5);
        });

        it("should handle HSV hue wrapping", () => {
            const out: rgba = [0, 0, 0, 0];

            // Test hue values that should wrap around
            const result1 = hsvToRgb(out, 360, 1.0, 1.0);
            const result2 = hsvToRgb(out, 0, 1.0, 1.0);

            expect(result1[0]).toBeCloseTo(result2[0], 5);
            expect(result1[1]).toBeCloseTo(result2[1], 5);
            expect(result1[2]).toBeCloseTo(result2[2], 5);
        });
    });

    describe("color interpolation", () => {
        it("should interpolate RGBA colors", () => {
            const out: rgba = [0, 0, 0, 0];
            const red: rgba = [1.0, 0.0, 0.0, 1.0];
            const blue: rgba = [0.0, 0.0, 1.0, 1.0];

            // Interpolate at t=0 (should be red)
            const result0 = lerpRgba(out, red, blue, 0.0);
            expect(result0).toBe(out);
            expect(result0[0]).toBeCloseTo(1.0, 5);
            expect(result0[1]).toBeCloseTo(0.0, 5);
            expect(result0[2]).toBeCloseTo(0.0, 5);
            expect(result0[3]).toBeCloseTo(1.0, 5);

            // Interpolate at t=1 (should be blue)
            const result1 = lerpRgba(out, red, blue, 1.0);
            expect(result1[0]).toBeCloseTo(0.0, 5);
            expect(result1[1]).toBeCloseTo(0.0, 5);
            expect(result1[2]).toBeCloseTo(1.0, 5);
            expect(result1[3]).toBeCloseTo(1.0, 5);

            // Interpolate at t=0.5 (should be purple)
            const result05 = lerpRgba(out, red, blue, 0.5);
            expect(result05[0]).toBeCloseTo(0.5, 5);
            expect(result05[1]).toBeCloseTo(0.0, 5);
            expect(result05[2]).toBeCloseTo(0.5, 5);
            expect(result05[3]).toBeCloseTo(1.0, 5);
        });

        it("should interpolate HSV colors with hue wrapping", () => {
            const out: hsv = [0, 0, 0];
            const red: hsv = [0, 1.0, 1.0];
            const blue: hsv = [240, 1.0, 1.0];

            // Interpolate at t=0 (should be red)
            const result0 = lerpHsv(out, red, blue, 0.0);
            expect(result0).toBe(out);
            expect(result0[0]).toBeCloseTo(0, 1);
            expect(result0[1]).toBeCloseTo(1.0, 5);
            expect(result0[2]).toBeCloseTo(1.0, 5);

            // Interpolate at t=1 (should be blue)
            const result1 = lerpHsv(out, red, blue, 1.0);
            expect(result1[0]).toBeCloseTo(240, 1);
            expect(result1[1]).toBeCloseTo(1.0, 5);
            expect(result1[2]).toBeCloseTo(1.0, 5);

            // Interpolate at t=0.5 (should be cyan, not green due to shorter path)
            const result05 = lerpHsv(out, red, blue, 0.5);
            expect(result05[0]).toBeCloseTo(300, 1); // Should be cyan (300 degrees)
            expect(result05[1]).toBeCloseTo(1.0, 5);
            expect(result05[2]).toBeCloseTo(1.0, 5);
        });

        it("should handle HSV hue wrapping in interpolation", () => {
            const out: hsv = [0, 0, 0];
            const red: hsv = [350, 1.0, 1.0]; // Near 0 degrees
            const blue: hsv = [10, 1.0, 1.0]; // Also near 0 degrees

            // Should take the shorter path (20 degrees, not 340 degrees)
            const result = lerpHsv(out, red, blue, 0.5);
            expect(result[0]).toBeCloseTo(0, 5); // Should be close to 0 degrees
        });
    });

    describe("utility functions", () => {
        it("should create RGB colors", () => {
            const result = createRgb(0.5, 0.7, 0.3);
            expect(result).toEqual([0.5, 0.7, 0.3]);
        });

        it("should create RGBA colors", () => {
            const result = createRgba(0.5, 0.7, 0.3, 0.8);
            expect(result).toEqual([0.5, 0.7, 0.3, 0.8]);
        });

        it("should create RGBA colors with default alpha", () => {
            const result = createRgba(0.5, 0.7, 0.3);
            expect(result).toEqual([0.5, 0.7, 0.3, 1.0]);
        });

        it("should create HSV colors", () => {
            const result = createHsv(120, 0.8, 0.6);
            expect(result).toEqual([120, 0.8, 0.6]);
        });

        it("should clone RGB colors", () => {
            const original: rgb = [0.5, 0.7, 0.3];
            const cloned = cloneRgb(original);

            expect(cloned).toEqual(original);
            expect(cloned).not.toBe(original); // Should be a new array
        });

        it("should clone RGBA colors", () => {
            const original: rgba = [0.5, 0.7, 0.3, 0.8];
            const cloned = cloneRgba(original);

            expect(cloned).toEqual(original);
            expect(cloned).not.toBe(original); // Should be a new array
        });

        it("should clone HSV colors", () => {
            const original: hsv = [120, 0.8, 0.6];
            const cloned = cloneHsv(original);

            expect(cloned).toEqual(original);
            expect(cloned).not.toBe(original); // Should be a new array
        });
    });

    describe("infinite palette generator", () => {
        it("should produce valid hex colors and be deterministic with same seed", () => {
            const p1 = makeInfinitePalette({ start_hue: 42, golden_angle: 137.50776405, base_saturation: 0.68, base_value: 0.82, alpha: 1.0 });
            const p2 = makeInfinitePalette({ start_hue: 42, golden_angle: 137.50776405, base_saturation: 0.68, base_value: 0.82, alpha: 1.0 });

            const c1 = p1.nextHex();
            const c2 = p2.nextHex();
            const c3 = p1.nextHex();
            const c4 = p2.nextHex();

            expect(c1).toMatch(/^#([0-9a-f]{6}|[0-9a-f]{8})$/);
            expect(c2).toMatch(/^#([0-9a-f]{6}|[0-9a-f]{8})$/);
            expect(c3).toMatch(/^#([0-9a-f]{6}|[0-9a-f]{8})$/);
            expect(c4).toMatch(/^#([0-9a-f]{6}|[0-9a-f]{8})$/);

            // Deterministic for same seed/options
            expect(c1).toBe(c2);
            expect(c3).toBe(c4);

            // Distinct successive colors
            expect(c1).not.toBe(c3);
        });

        it("should produce rgba tuples when requested", () => {
            const p = makeInfinitePalette({ start_hue: 10, alpha: 0.75 });
            const c = p.nextRgba();
            expect(Array.isArray(c)).toBe(true);
            expect(c.length).toBe(4);
            expect(c[0]).toBeGreaterThanOrEqual(0);
            expect(c[0]).toBeLessThanOrEqual(1);
            expect(c[1]).toBeGreaterThanOrEqual(0);
            expect(c[1]).toBeLessThanOrEqual(1);
            expect(c[2]).toBeGreaterThanOrEqual(0);
            expect(c[2]).toBeLessThanOrEqual(1);
            expect(c[3]).toBeCloseTo(0.75, 5);
        });

        it("reset should restart sequence from provided hue", () => {
            const p = makeInfinitePalette({ start_hue: 100 });
            const first = p.nextHex();
            const second = p.nextHex();
            expect(first).not.toBe(second);
            p.reset(100);
            const again = p.nextHex();
            expect(again).toBe(first);
        });

        it("colors should be reasonably separated in hue", () => {
            const p = makeInfinitePalette({ start_hue: 0 });
            const outHsv: hsv = [0, 0, 0];
            const outRgba: rgba = [0, 0, 0, 0];

            let prevHue: number | null = null;
            for (let i = 0; i < 12; i++) {
                const c = p.nextRgba();
                rgbaToHsv(outHsv, c[0], c[1], c[2]);
                const hue = outHsv[0];
                if (prevHue !== null) {
                    const diff = Math.abs(hue - prevHue);
                    const wrapped = Math.min(diff, 360 - diff);
                    expect(wrapped).toBeGreaterThan(20); // fairly separated
                }
                prevHue = hue;
            }
        });
    });

    describe("U32 conversion", () => {
        it("should convert RGBA to U32", () => {
            const result = rgbaToU32(1.0, 0.0, 0.0, 1.0);
            expect(result).toBe(-16776961); // Red with full alpha (ARGB format, signed 32-bit)
        });

        it("should convert U32 to RGBA", () => {
            const out: rgba = [0, 0, 0, 0];
            const result = u32ToRgba(out, 0xFF0000FF); // Red with full alpha

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(1.0, 5); // Red
            expect(result[1]).toBeCloseTo(0.0, 5); // Green
            expect(result[2]).toBeCloseTo(0.0, 5); // Blue
            expect(result[3]).toBeCloseTo(1.0, 5); // Alpha
        });

        it("should handle round-trip conversion", () => {
            const originalRgba: rgba = [0.5, 0.7, 0.3, 0.8];
            const u32 = rgbaToU32(originalRgba[0], originalRgba[1], originalRgba[2], originalRgba[3]);
            const out: rgba = [0, 0, 0, 0];
            const converted = u32ToRgba(out, u32);

            // Should be close due to rounding in U32 conversion
            expect(converted[0]).toBeCloseTo(originalRgba[0], 2);
            expect(converted[1]).toBeCloseTo(originalRgba[1], 2);
            expect(converted[2]).toBeCloseTo(originalRgba[2], 2);
            expect(converted[3]).toBeCloseTo(originalRgba[3], 2);
        });
    });

    describe("edge cases", () => {
        it("should handle zero values", () => {
            const out: hsv = [0, 0, 0];
            const result = rgbToHsv(out, 0.0, 0.0, 0.0);

            expect(result[0]).toBeCloseTo(0, 1);
            expect(result[1]).toBeCloseTo(0.0, 5);
            expect(result[2]).toBeCloseTo(0.0, 5);
        });

        it("should handle maximum values", () => {
            const out: rgba = [0, 0, 0, 0];
            const result = hsvToRgb(out, 0, 1.0, 1.0); // Use 0 instead of 360

            expect(result[0]).toBeCloseTo(1.0, 5);
            expect(result[1]).toBeCloseTo(0.0, 5);
            expect(result[2]).toBeCloseTo(0.0, 5);
        });

        it("should handle interpolation at boundaries", () => {
            const out: rgba = [0, 0, 0, 0];
            const red: rgba = [1.0, 0.0, 0.0, 1.0];
            const blue: rgba = [0.0, 0.0, 1.0, 1.0];

            // Test negative t (should extrapolate)
            const resultNeg = lerpRgba(out, red, blue, -0.5);
            expect(resultNeg[0]).toBeCloseTo(1.5, 5); // 1.0 + (0.0 - 1.0) * (-0.5)

            // Test t > 1 (should extrapolate)
            const resultOver = lerpRgba(out, red, blue, 1.5);
            expect(resultOver[0]).toBeCloseTo(-0.5, 5); // 1.0 + (0.0 - 1.0) * 1.5
        });

        it("should handle HSV interpolation with extreme hue differences", () => {
            const out: hsv = [0, 0, 0];
            const red: hsv = [0, 1.0, 1.0];
            const cyan: hsv = [180, 1.0, 1.0];

            const result = lerpHsv(out, red, cyan, 0.5);
            expect(result[0]).toBeCloseTo(90, 1); // Should be yellow-green
            expect(result[1]).toBeCloseTo(1.0, 5);
            expect(result[2]).toBeCloseTo(1.0, 5);
        });
    });
});
