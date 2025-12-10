import { describe, it, expect } from "bun:test";
import { EPSILON, degToRad, radToDeg, clamp, nextPowerOf2, normalizeAngle, normalizeArcLength, angleIsBetween } from "./utils";

describe("Math Utility Functions", () => {
    describe("EPSILON", () => {
        it("should be a small positive number", () => {
            expect(EPSILON).toBeGreaterThan(0);
            expect(EPSILON).toBeLessThan(0.001);
        });
    });

    describe("clamp", () => {
        it("should clamp values within range", () => {
            expect(clamp(5, 0, 10)).toBe(5);
            expect(clamp(-5, 0, 10)).toBe(0);
            expect(clamp(15, 0, 10)).toBe(10);
        });

        it("should handle edge cases", () => {
            expect(clamp(0, 0, 10)).toBe(0);
            expect(clamp(10, 0, 10)).toBe(10);
        });
    });

    describe("degToRad", () => {
        it("should convert degrees to radians", () => {
            expect(degToRad(0)).toBe(0);
            expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
            expect(degToRad(180)).toBeCloseTo(Math.PI);
            expect(degToRad(270)).toBeCloseTo(3 * Math.PI / 2);
            expect(degToRad(360)).toBeCloseTo(2 * Math.PI);
        });

        it("should handle negative degrees", () => {
            expect(degToRad(-90)).toBeCloseTo(-Math.PI / 2);
            expect(degToRad(-180)).toBeCloseTo(-Math.PI);
            expect(degToRad(-360)).toBeCloseTo(-2 * Math.PI);
        });

        it("should handle fractional degrees", () => {
            expect(degToRad(45)).toBeCloseTo(Math.PI / 4);
            expect(degToRad(30)).toBeCloseTo(Math.PI / 6);
            expect(degToRad(60)).toBeCloseTo(Math.PI / 3);
        });

        it("should handle large angles", () => {
            expect(degToRad(720)).toBeCloseTo(4 * Math.PI);
            expect(degToRad(1080)).toBeCloseTo(6 * Math.PI);
        });

        it("should handle small angles", () => {
            expect(degToRad(1)).toBeCloseTo(Math.PI / 180);
            expect(degToRad(0.5)).toBeCloseTo(Math.PI / 360);
        });
    });

    describe("radToDeg", () => {
        it("should convert radians to degrees", () => {
            expect(radToDeg(0)).toBe(0);
            expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
            expect(radToDeg(Math.PI)).toBeCloseTo(180);
            expect(radToDeg(3 * Math.PI / 2)).toBeCloseTo(270);
            expect(radToDeg(2 * Math.PI)).toBeCloseTo(360);
        });

        it("should handle negative radians", () => {
            expect(radToDeg(-Math.PI / 2)).toBeCloseTo(-90);
            expect(radToDeg(-Math.PI)).toBeCloseTo(-180);
            expect(radToDeg(-2 * Math.PI)).toBeCloseTo(-360);
        });

        it("should handle fractional radians", () => {
            expect(radToDeg(Math.PI / 4)).toBeCloseTo(45);
            expect(radToDeg(Math.PI / 6)).toBeCloseTo(30);
            expect(radToDeg(Math.PI / 3)).toBeCloseTo(60);
        });

        it("should handle large angles", () => {
            expect(radToDeg(4 * Math.PI)).toBeCloseTo(720);
            expect(radToDeg(6 * Math.PI)).toBeCloseTo(1080);
        });

        it("should handle small angles", () => {
            expect(radToDeg(Math.PI / 180)).toBeCloseTo(1);
            expect(radToDeg(Math.PI / 360)).toBeCloseTo(0.5);
        });
    });

    describe("round-trip conversion", () => {
        it("should be inverse operations", () => {
            const testAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 270, 360];

            for (const deg of testAngles) {
                const rad = degToRad(deg);
                const backToDeg = radToDeg(rad);
                expect(backToDeg).toBeCloseTo(deg);
            }
        });

        it("should handle negative round-trip conversion", () => {
            const testAngles = [-30, -45, -90, -180, -270, -360];

            for (const deg of testAngles) {
                const rad = degToRad(deg);
                const backToDeg = radToDeg(rad);
                expect(backToDeg).toBeCloseTo(deg);
            }
        });

        it("should handle fractional round-trip conversion", () => {
            const testAngles = [0.5, 1.5, 22.5, 33.75, 67.5];

            for (const deg of testAngles) {
                const rad = degToRad(deg);
                const backToDeg = radToDeg(rad);
                expect(backToDeg).toBeCloseTo(deg);
            }
        });
    });

    describe("nextPowerOf2", () => {
        it("should return correct powers of 2", () => {
            expect(nextPowerOf2(1)).toBe(2);
            expect(nextPowerOf2(2)).toBe(2);
            expect(nextPowerOf2(3)).toBe(4);
            expect(nextPowerOf2(4)).toBe(4);
            expect(nextPowerOf2(5)).toBe(8);
            expect(nextPowerOf2(8)).toBe(8);
            expect(nextPowerOf2(9)).toBe(16);
            expect(nextPowerOf2(16)).toBe(16);
            expect(nextPowerOf2(17)).toBe(32);
            expect(nextPowerOf2(32)).toBe(32);
        });

        it("should handle edge cases", () => {
            expect(nextPowerOf2(0)).toBe(1);
            expect(nextPowerOf2(-1)).toBe(1);
            expect(nextPowerOf2(-10)).toBe(1);
        });

        it("should handle large numbers", () => {
            expect(nextPowerOf2(1000)).toBe(1024);
            expect(nextPowerOf2(1024)).toBe(1024);
            expect(nextPowerOf2(1025)).toBe(2048);
            expect(nextPowerOf2(10000)).toBe(16384);
            expect(nextPowerOf2(16384)).toBe(16384);
            expect(nextPowerOf2(16385)).toBe(32768);
        });

        it("should handle fractional numbers", () => {
            expect(nextPowerOf2(0.5)).toBe(1);
            expect(nextPowerOf2(1.5)).toBe(2);
            expect(nextPowerOf2(2.1)).toBe(4);
            expect(nextPowerOf2(3.9)).toBe(4);
            expect(nextPowerOf2(7.1)).toBe(8);
            expect(nextPowerOf2(15.9)).toBe(16);
        });

        it("should handle very small positive numbers", () => {
            expect(nextPowerOf2(0.001)).toBe(1);
            expect(nextPowerOf2(0.1)).toBe(1);
            expect(nextPowerOf2(0.9)).toBe(1);
        });

        it("should handle powers of 2 exactly", () => {
            const powers = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
            for (const power of powers) {
                if (power === 1) {
                    expect(nextPowerOf2(power)).toBe(2);
                } else {
                    expect(nextPowerOf2(power)).toBe(power);
                }
            }
        });

        it("should handle numbers just above powers of 2", () => {
            expect(nextPowerOf2(3)).toBe(4);
            expect(nextPowerOf2(5)).toBe(8);
            expect(nextPowerOf2(9)).toBe(16);
            expect(nextPowerOf2(17)).toBe(32);
            expect(nextPowerOf2(33)).toBe(64);
            expect(nextPowerOf2(65)).toBe(128);
            expect(nextPowerOf2(129)).toBe(256);
            expect(nextPowerOf2(257)).toBe(512);
            expect(nextPowerOf2(513)).toBe(1024);
        });
    });

    describe("normalizeAngle", () => {
        it("should keep angles in [0, 2π)", () => {
            expect(normalizeAngle(0)).toBeCloseTo(0);
            expect(normalizeAngle(Math.PI / 2)).toBeCloseTo(Math.PI / 2);
            expect(normalizeAngle(Math.PI)).toBeCloseTo(Math.PI);
            expect(normalizeAngle(2 * Math.PI - 1e-9)).toBeCloseTo(2 * Math.PI - 1e-9);
        });

        it("should wrap negative angles into [0, 2π)", () => {
            expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo(3 * Math.PI / 2);
            expect(normalizeAngle(-Math.PI)).toBeCloseTo(Math.PI);
            expect(normalizeAngle(-2 * Math.PI)).toBeCloseTo(0);
            expect(normalizeAngle(-3 * Math.PI / 2)).toBeCloseTo(Math.PI / 2);
        });

        it("should reduce multiples correctly", () => {
            expect(normalizeAngle(5 * Math.PI)).toBeCloseTo(Math.PI);
            expect(normalizeAngle(4 * Math.PI + Math.PI / 2)).toBeCloseTo(Math.PI / 2);
            expect(normalizeAngle(2 * Math.PI)).toBeCloseTo(0);
        });
    });

    describe("normalizeArcLength", () => {
        const twoPi = 2 * Math.PI;

        it("should compute forward arc without wrap", () => {
            expect(normalizeArcLength(0, Math.PI)).toBeCloseTo(Math.PI);
            expect(normalizeArcLength(Math.PI / 4, Math.PI / 2)).toBeCloseTo(Math.PI / 4);
        });

        it("should wrap negative deltas into [0, 2π)", () => {
            expect(normalizeArcLength(Math.PI, Math.PI / 2)).toBeCloseTo(3 * Math.PI / 2);
            expect(normalizeArcLength(Math.PI / 2, 0)).toBeCloseTo(3 * Math.PI / 2);
        });

        it("should return 0 for zero-length arcs", () => {
            expect(normalizeArcLength(0, 0)).toBeCloseTo(0);
            expect(normalizeArcLength(Math.PI / 3, Math.PI / 3)).toBeCloseTo(0);
        });

        it("should preserve full-circle arcs as 2π (not 0)", () => {
            expect(normalizeArcLength(0, twoPi)).toBeCloseTo(twoPi);
            expect(normalizeArcLength(Math.PI / 3, Math.PI / 3 + twoPi)).toBeCloseTo(twoPi);
            expect(normalizeArcLength(0, -twoPi)).toBeCloseTo(twoPi);
        });
    });

    describe("angleIsBetween", () => {
        const twoPi = 2 * Math.PI;

        it("should be true within non-wrapping arc including boundaries", () => {
            const start = 0;
            const arc = Math.PI; // [0, π]
            expect(angleIsBetween(0, start, arc)).toBe(true);
            expect(angleIsBetween(Math.PI / 2, start, arc)).toBe(true);
            expect(angleIsBetween(Math.PI, start, arc)).toBe(true);
            expect(angleIsBetween(3 * Math.PI / 2, start, arc)).toBe(false);
        });

        it("should handle wrapping arcs across 2π correctly", () => {
            const start = 3 * Math.PI / 2; // 270°
            const arc = Math.PI; // covers [3π/2..2π] ∪ [0..π/2]
            expect(angleIsBetween(0, start, arc)).toBe(true);
            expect(angleIsBetween(Math.PI / 4, start, arc)).toBe(true);
            expect(angleIsBetween(Math.PI, start, arc)).toBe(false);
            expect(angleIsBetween(3 * Math.PI / 2, start, arc)).toBe(true);
        });

        it("should always be true for arcLen ≥ 2π", () => {
            const start = Math.PI / 6;
            expect(angleIsBetween(0, start, twoPi)).toBe(true);
            expect(angleIsBetween(Math.PI, start, twoPi * 2)).toBe(true);
        });

        it("should always be false for arcLen ≤ 0", () => {
            const start = 0;
            expect(angleIsBetween(0, start, 0)).toBe(false);
            expect(angleIsBetween(Math.PI / 2, start, -1)).toBe(false);
        });

        it("should be inclusive of the computed end boundary", () => {
            const start = Math.PI / 3;
            const arc = Math.PI / 6;
            const end = (start + arc) % twoPi;
            expect(angleIsBetween(end, start, arc)).toBe(true);
            expect(angleIsBetween(start, start, arc)).toBe(true);
        });
    });
    describe("edge cases", () => {
        it("should handle very small numbers", () => {
            expect(degToRad(0.001)).toBeCloseTo(Math.PI / 180000);
            expect(radToDeg(Math.PI / 180000)).toBeCloseTo(0.001);
        });

        it("should handle very large numbers", () => {
            expect(degToRad(10000)).toBeCloseTo(10000 * Math.PI / 180);
            expect(radToDeg(10000 * Math.PI / 180)).toBeCloseTo(10000);
        });

        it("should handle zero", () => {
            expect(degToRad(0)).toBe(0);
            expect(radToDeg(0)).toBe(0);
        });
    });
});
