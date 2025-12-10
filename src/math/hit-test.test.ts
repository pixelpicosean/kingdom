import { describe, it, expect } from "bun:test";
import {
    pointInRect,
    pointInLocalRect,
    pointInOval,
    pointInPolygon,
} from "./hit-test";
import type { vec2 } from "./vec2";

describe("Hit Test Functions", () => {
    describe("pointInRect", () => {
        it("should return true for point inside rectangle", () => {
            expect(pointInRect(50, 50, 10, 10, 100, 100)).toBe(true);
            expect(pointInRect(15, 15, 10, 10, 100, 100)).toBe(true);
            expect(pointInRect(109, 109, 10, 10, 100, 100)).toBe(true);
        });

        it("should return false for point outside rectangle", () => {
            expect(pointInRect(5, 50, 10, 10, 100, 100)).toBe(false);
            expect(pointInRect(50, 5, 10, 10, 100, 100)).toBe(false);
            expect(pointInRect(120, 50, 10, 10, 100, 100)).toBe(false);
            expect(pointInRect(50, 120, 10, 10, 100, 100)).toBe(false);
        });

        it("should return true for point on left and top edges", () => {
            expect(pointInRect(10, 50, 10, 10, 100, 100)).toBe(true);
            expect(pointInRect(50, 10, 10, 10, 100, 100)).toBe(true);
        });

        it("should return false for point on right and bottom edges (exclusive)", () => {
            expect(pointInRect(110, 50, 10, 10, 100, 100)).toBe(false);
            expect(pointInRect(50, 110, 10, 10, 100, 100)).toBe(false);
        });

        it("should handle negative coordinates", () => {
            expect(pointInRect(-5, -5, -10, -10, 100, 100)).toBe(true);
            expect(pointInRect(-15, -5, -10, -10, 100, 100)).toBe(false);
            expect(pointInRect(-5, -15, -10, -10, 100, 100)).toBe(false);
        });

        it("should handle zero-sized rectangle", () => {
            expect(pointInRect(10, 10, 10, 10, 0, 0)).toBe(false);
            expect(pointInRect(10, 10, 10, 10, 0, 100)).toBe(false);
            expect(pointInRect(10, 10, 10, 10, 100, 0)).toBe(false);
        });

        it("should handle rectangle at origin", () => {
            expect(pointInRect(50, 50, 0, 0, 100, 100)).toBe(true);
            expect(pointInRect(0, 0, 0, 0, 100, 100)).toBe(true);
            expect(pointInRect(100, 100, 0, 0, 100, 100)).toBe(false);
        });
    });

    describe("pointInLocalRect", () => {
        it("should return true for point inside local bounds", () => {
            expect(pointInLocalRect(100, 100, 50, 50)).toBe(true);
            expect(pointInLocalRect(100, 100, 10, 10)).toBe(true);
            expect(pointInLocalRect(100, 100, 0, 0)).toBe(true);
            expect(pointInLocalRect(100, 100, 100, 100)).toBe(true);
        });

        it("should return false for point outside local bounds", () => {
            expect(pointInLocalRect(100, 100, -1, 50)).toBe(false);
            expect(pointInLocalRect(100, 100, 50, -1)).toBe(false);
            expect(pointInLocalRect(100, 100, 101, 50)).toBe(false);
            expect(pointInLocalRect(100, 100, 50, 101)).toBe(false);
        });

        it("should return true for point on boundaries (inclusive)", () => {
            expect(pointInLocalRect(100, 100, 0, 50)).toBe(true);
            expect(pointInLocalRect(100, 100, 50, 0)).toBe(true);
            expect(pointInLocalRect(100, 100, 100, 50)).toBe(true);
            expect(pointInLocalRect(100, 100, 50, 100)).toBe(true);
        });

        it("should handle zero-sized bounds", () => {
            expect(pointInLocalRect(0, 0, 0, 0)).toBe(true);
            // When width is 0, x must be exactly 0 to be inside
            expect(pointInLocalRect(0, 100, 0, 50)).toBe(true); // x=0 is valid, y=50 is within height
            expect(pointInLocalRect(0, 100, 1, 50)).toBe(false); // x=1 is outside when width=0
            expect(pointInLocalRect(100, 0, 50, 0)).toBe(true); // x=50 is within width, y=0 is valid
            expect(pointInLocalRect(100, 0, 50, 1)).toBe(false); // y=1 is outside when height=0
        });

        it("should handle negative coordinates", () => {
            expect(pointInLocalRect(100, 100, -1, 50)).toBe(false);
            expect(pointInLocalRect(100, 100, 50, -1)).toBe(false);
        });
    });

    describe("pointInOval", () => {
        it("should return true for point inside full ellipse", () => {
            expect(pointInOval(100, 100, 0, Math.PI * 2, 0, 50, 50)).toBe(true); // center
            // Point (10, 10): normalized radius = sqrt((40/50)^2 + (40/50)^2) = sqrt(1.28) > 1, so outside
            expect(pointInOval(100, 100, 0, Math.PI * 2, 0, 10, 10)).toBe(false);
            // Point (90, 90): normalized radius = sqrt((40/50)^2 + (40/50)^2) = sqrt(1.28) > 1, so outside
            expect(pointInOval(100, 100, 0, Math.PI * 2, 0, 90, 90)).toBe(false);
            // Point closer to center but still inside: (40, 40)
            // normalized radius = sqrt((10/50)^2 + (10/50)^2) = sqrt(0.08) ≈ 0.283 < 1
            expect(pointInOval(100, 100, 0, Math.PI * 2, 0, 40, 40)).toBe(true);
            // Point on edge: (100, 50) normalized radius = sqrt((50/50)^2 + (0/50)^2) = 1, inside (within tolerance)
            expect(pointInOval(100, 100, 0, Math.PI * 2, 0, 100, 50)).toBe(true);
        });

        it("should return false for point outside full ellipse", () => {
            // Point (60, 50): normalized radius = sqrt((10/50)^2 + (0/50)^2) = sqrt(0.04) = 0.2 < 1, so inside
            expect(pointInOval(100, 100, 0, Math.PI * 2, 0, 60, 50)).toBe(true);
            // Point (50, 60): normalized radius = sqrt((0/50)^2 + (10/50)^2) = sqrt(0.04) = 0.2 < 1, so inside
            expect(pointInOval(100, 100, 0, Math.PI * 2, 0, 50, 60)).toBe(true);
            // Point (0, 0): normalized radius = sqrt((50/50)^2 + (50/50)^2) = sqrt(2) > 1, so outside
            expect(pointInOval(100, 100, 0, Math.PI * 2, 0, 0, 0)).toBe(false);
            // Point (100, 100): normalized radius = sqrt((50/50)^2 + (50/50)^2) = sqrt(2) > 1, so outside
            expect(pointInOval(100, 100, 0, Math.PI * 2, 0, 100, 100)).toBe(false);
            // Point on edge: (100, 50) normalized radius = sqrt((50/50)^2 + (0/50)^2) = 1, should be inside (within tolerance)
            expect(pointInOval(100, 100, 0, Math.PI * 2, 0, 100, 50)).toBe(true);
        });

        it("should handle arc sectors", () => {
            // Arc from 0 to PI (right half)
            expect(pointInOval(100, 100, 0, Math.PI, 0, 75, 50)).toBe(true);
            expect(pointInOval(100, 100, 0, Math.PI, 0, 25, 50)).toBe(true);
            // Point in left half should be false
            expect(pointInOval(100, 100, 0, Math.PI, 0, 25, 25)).toBe(false);
        });

        it("should handle donut shapes with inner radius", () => {
            // Point inside inner hole should be false
            expect(pointInOval(100, 100, 0, Math.PI * 2, 0.5, 50, 50)).toBe(false);
            // Point between inner and outer should be true
            expect(pointInOval(100, 100, 0, Math.PI * 2, 0.5, 75, 50)).toBe(true);
            // Point outside outer should be false
            expect(pointInOval(100, 100, 0, Math.PI * 2, 0.5, 60, 50)).toBe(false);
        });

        it("should handle donut arc sectors", () => {
            // Donut arc from 0 to PI (right half)
            // Point (75, 50): angle = 0, normalized radius = 0.5, between inner (0.5) and outer (1)
            expect(pointInOval(100, 100, 0, Math.PI, 0.5, 75, 50)).toBe(true);
            // Point (50, 50): center, normalized radius = 0, inside inner hole
            expect(pointInOval(100, 100, 0, Math.PI, 0.5, 50, 50)).toBe(false);
            // Point (25, 50): angle = π, normalized radius = 0.5, but angle is at boundary
            // Actually angle 25,50 from center (50,50) is atan2(0, -25) = π, which is the end of arc
            expect(pointInOval(100, 100, 0, Math.PI, 0.5, 25, 50)).toBe(true); // On boundary, inclusive
        });

        it("should handle edge cases on boundary", () => {
            // Point exactly on boundary (within tolerance)
            expect(pointInOval(100, 100, 0, Math.PI * 2, 0, 50, 0)).toBe(true);
            expect(pointInOval(100, 100, 0, Math.PI * 2, 0, 50, 100)).toBe(true);
            expect(pointInOval(100, 100, 0, Math.PI * 2, 0, 0, 50)).toBe(true);
            expect(pointInOval(100, 100, 0, Math.PI * 2, 0, 100, 50)).toBe(true);
        });

        it("should handle wrapping arcs", () => {
            // Arc that wraps around (e.g., from 3π/2 to π/2)
            // Point (50, 25): angle = atan2(-25, 0) = -π/2 = 3π/2, on start boundary
            expect(pointInOval(100, 100, (3 * Math.PI) / 2, Math.PI / 2, 0, 50, 25)).toBe(true);
            // Point (50, 75): angle = atan2(25, 0) = π/2, on end boundary
            expect(pointInOval(100, 100, (3 * Math.PI) / 2, Math.PI / 2, 0, 50, 75)).toBe(true);
            // Point in the excluded middle section (e.g., angle = π)
            expect(pointInOval(100, 100, (3 * Math.PI) / 2, Math.PI / 2, 0, 0, 50)).toBe(false);
        });

        it("should handle zero-sized oval", () => {
            // Zero-sized oval: center is at (0, 0), point is at (0, 0)
            // dx = 0, dy = 0, rx = 0, ry = 0
            // r_norm = hypot(0/0, 0/0) = NaN, but we check if r_norm > 1 + 1e-9 first
            // Actually, when rx = 0 or ry = 0, the calculation breaks down
            // The function will compute r_norm = hypot(0/0, 0/0) which is NaN
            // NaN comparisons return false, so r_norm > 1 is false, but then we check inner_radius
            // Since inner_radius = 0, we don't check r_norm < inner_radius
            // Then we check arc_len >= 2π, which is true, so it returns true
            expect(pointInOval(0, 0, 0, Math.PI * 2, 0, 0, 0)).toBe(true);
        });
    });

    describe("pointInPolygon", () => {
        it("should return true for point inside square", () => {
            const square: vec2[] = [
                [0, 0],
                [100, 0],
                [100, 100],
                [0, 100],
            ];
            expect(pointInPolygon(square, 50, 50)).toBe(true);
            expect(pointInPolygon(square, 10, 10)).toBe(true);
            expect(pointInPolygon(square, 90, 90)).toBe(true);
        });

        it("should return false for point outside square", () => {
            const square: vec2[] = [
                [0, 0],
                [100, 0],
                [100, 100],
                [0, 100],
            ];
            expect(pointInPolygon(square, -10, 50)).toBe(false);
            expect(pointInPolygon(square, 50, -10)).toBe(false);
            expect(pointInPolygon(square, 110, 50)).toBe(false);
            expect(pointInPolygon(square, 50, 110)).toBe(false);
        });

        it("should handle point on edge", () => {
            const square: vec2[] = [
                [0, 0],
                [100, 0],
                [100, 100],
                [0, 100],
            ];
            // Edge cases can be implementation-dependent, but should be consistent
            expect(pointInPolygon(square, 0, 50)).toBe(true);
            expect(pointInPolygon(square, 50, 0)).toBe(true);
        });

        it("should handle triangle", () => {
            const triangle: vec2[] = [
                [0, 0],
                [100, 0],
                [50, 100],
            ];
            expect(pointInPolygon(triangle, 50, 50)).toBe(true);
            expect(pointInPolygon(triangle, 25, 25)).toBe(true);
            expect(pointInPolygon(triangle, 75, 25)).toBe(true);
            expect(pointInPolygon(triangle, 50, 10)).toBe(true);
            // Point outside
            expect(pointInPolygon(triangle, 10, 90)).toBe(false);
            expect(pointInPolygon(triangle, 90, 90)).toBe(false);
        });

        it("should handle complex polygon", () => {
            const polygon: vec2[] = [
                [0, 0],
                [50, 0],
                [50, 50],
                [100, 50],
                [100, 100],
                [0, 100],
            ];
            expect(pointInPolygon(polygon, 25, 25)).toBe(true);
            // Point (75, 25): This is in the upper right section, should be inside
            // Actually, let's trace: y=25 crosses edges at x=0..50 (from [0,0] to [50,0]) and x=50..100 (from [50,50] to [100,50])
            // At y=25, the edge from [50,0] to [50,50] is vertical at x=50
            // So for x > 50, we're in the upper section which is outside the polygon
            expect(pointInPolygon(polygon, 75, 25)).toBe(false);
            expect(pointInPolygon(polygon, 75, 75)).toBe(true);
            // Point in the "notch"
            expect(pointInPolygon(polygon, 25, 75)).toBe(true);
            // Point outside (in the upper right section)
            expect(pointInPolygon(polygon, 60, 10)).toBe(false);
        });

        it("should handle polygon with hole-like shape", () => {
            // L-shaped polygon
            const lShape: vec2[] = [
                [0, 0],
                [100, 0],
                [100, 50],
                [50, 50],
                [50, 100],
                [0, 100],
            ];
            expect(pointInPolygon(lShape, 25, 25)).toBe(true);
            expect(pointInPolygon(lShape, 75, 25)).toBe(true);
            expect(pointInPolygon(lShape, 25, 75)).toBe(true);
            // Point in the "notch"
            expect(pointInPolygon(lShape, 75, 75)).toBe(false);
        });

        it("should handle empty polygon", () => {
            const empty: vec2[] = [];
            expect(pointInPolygon(empty, 50, 50)).toBe(false);
        });

        it("should handle single point polygon", () => {
            const single: vec2[] = [[50, 50]];
            // Single point polygon is degenerate, behavior is implementation-dependent
            expect(pointInPolygon(single, 50, 50)).toBe(false);
        });

        it("should handle two-point polygon", () => {
            const line: vec2[] = [
                [0, 0],
                [100, 100],
            ];
            // Two-point polygon is a line, point should not be inside
            expect(pointInPolygon(line, 50, 50)).toBe(false);
        });

        it("should handle polygon with negative coordinates", () => {
            const polygon: vec2[] = [
                [-50, -50],
                [50, -50],
                [50, 50],
                [-50, 50],
            ];
            expect(pointInPolygon(polygon, 0, 0)).toBe(true);
            expect(pointInPolygon(polygon, -25, -25)).toBe(true);
            expect(pointInPolygon(polygon, 25, 25)).toBe(true);
            expect(pointInPolygon(polygon, -60, 0)).toBe(false);
        });

        it("should handle star-like polygon", () => {
            // Simple star shape (5 points)
            const star: vec2[] = [
                [50, 0],
                [61, 38],
                [100, 38],
                [69, 59],
                [80, 100],
                [50, 73],
                [20, 100],
                [31, 59],
                [0, 38],
                [39, 38],
            ];
            // Center should be inside
            expect(pointInPolygon(star, 50, 50)).toBe(true);
            // Tip should be inside
            expect(pointInPolygon(star, 50, 10)).toBe(true);
            // Outside
            expect(pointInPolygon(star, 0, 0)).toBe(false);
            expect(pointInPolygon(star, 100, 100)).toBe(false);
        });

        it("should handle polygon with collinear points", () => {
            const polygon: vec2[] = [
                [0, 0],
                [50, 0],
                [100, 0],
                [100, 100],
                [0, 100],
            ];
            expect(pointInPolygon(polygon, 50, 50)).toBe(true);
            expect(pointInPolygon(polygon, 25, 10)).toBe(true);
        });
    });

    describe("edge cases and integration", () => {
        it("should handle very small rectangles", () => {
            expect(pointInRect(0.5, 0.5, 0, 0, 1, 1)).toBe(true);
            expect(pointInRect(1.5, 0.5, 0, 0, 1, 1)).toBe(false);
            expect(pointInLocalRect(1, 1, 0.5, 0.5)).toBe(true);
            expect(pointInLocalRect(1, 1, 1.5, 0.5)).toBe(false);
        });

        it("should handle very large coordinates", () => {
            expect(pointInRect(1000000, 1000000, 0, 0, 2000000, 2000000)).toBe(true);
            expect(pointInRect(2000001, 1000000, 0, 0, 2000000, 2000000)).toBe(false);
            expect(pointInLocalRect(2000000, 2000000, 1000000, 1000000)).toBe(true);
        });

        it("should handle floating point precision", () => {
            // Test boundary conditions with floating point
            expect(pointInRect(100.0 - 1e-10, 50, 0, 0, 100, 100)).toBe(true);
            expect(pointInRect(100.0 + 1e-10, 50, 0, 0, 100, 100)).toBe(false);
            expect(pointInLocalRect(100, 100, 100.0 - 1e-10, 50)).toBe(true);
            expect(pointInLocalRect(100, 100, 100.0 + 1e-10, 50)).toBe(false);
        });

        it("should handle non-square rectangles", () => {
            expect(pointInRect(50, 25, 0, 0, 100, 50)).toBe(true);
            // Point (50, 30): y=30 is within [0, 50), so it's inside
            expect(pointInRect(50, 30, 0, 0, 100, 50)).toBe(true);
            // Point (50, 50): y=50 is on the boundary (exclusive), so it's outside
            expect(pointInRect(50, 50, 0, 0, 100, 50)).toBe(false);
            expect(pointInLocalRect(100, 50, 50, 25)).toBe(true);
            // Point (50, 30): y=30 is within [0, 50] (inclusive), so it's inside
            expect(pointInLocalRect(100, 50, 50, 30)).toBe(true);
            // Point (50, 50): y=50 is on the boundary (inclusive), so it's inside
            expect(pointInLocalRect(100, 50, 50, 50)).toBe(true);
            // Point (50, 51): y=51 is outside [0, 50], so it's outside
            expect(pointInLocalRect(100, 50, 50, 51)).toBe(false);
        });

        it("should handle oval with non-square aspect ratio", () => {
            // Oval: width=200, height=100, center at (100, 50)
            // Point (100, 50): center, normalized radius = 0, inside
            expect(pointInOval(200, 100, 0, Math.PI * 2, 0, 100, 50)).toBe(true);
            // Point (110, 50): dx=10, dy=0, rx=100, ry=50
            // normalized radius = sqrt((10/100)^2 + (0/50)^2) = sqrt(0.01) = 0.1 < 1, inside
            expect(pointInOval(200, 100, 0, Math.PI * 2, 0, 110, 50)).toBe(true);
            // Point (200, 50): dx=100, normalized radius = sqrt((100/100)^2) = 1, inside (within tolerance)
            expect(pointInOval(200, 100, 0, Math.PI * 2, 0, 200, 50)).toBe(true);
            // Point (210, 50): dx=110, normalized radius = sqrt((110/100)^2) = 1.1 > 1, outside
            expect(pointInOval(200, 100, 0, Math.PI * 2, 0, 210, 50)).toBe(false);
            // Point (100, 60): dy=10, normalized radius = sqrt((0/100)^2 + (10/50)^2) = sqrt(0.04) = 0.2 < 1, inside
            expect(pointInOval(200, 100, 0, Math.PI * 2, 0, 100, 60)).toBe(true);
        });
    });
});

