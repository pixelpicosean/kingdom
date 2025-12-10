import { describe, it, expect } from "bun:test";
import {
    vec2New,
    vec2Zero,
    vec2UnitX,
    vec2UnitY,
    vec2Normalize,
    vec2Dot,
    vec2Length,
    vec2LengthSq,
    vec2Add,
    vec2Sub,
    vec2Mul,
    vec2DivScalar,
    vec2Negate,
    vec2Distance,
    vec2DistanceSq,
    vec2Lerp,
    vec2Reflect,
    vec2Cross,
    vec2Rotate,
    vec2Angle,
} from "./vec2";

describe("Vec2 Math Functions", () => {
    describe("create functions", () => {
        it("should create Vec2 with given components", () => {
            const v = vec2New(1, 2);
            expect(v).toEqual([1, 2]);
        });

        it("should create zero vector", () => {
            const v = vec2Zero();
            expect(v).toEqual([0, 0]);
        });

        it("should create unit vectors", () => {
            expect(vec2UnitX()).toEqual([1, 0]);
            expect(vec2UnitY()).toEqual([0, 1]);
        });
    });

    describe("vec2Normalize", () => {
        it("should normalize a vector", () => {
            const v = vec2New(3, 4);
            const out = vec2Zero();
            const result = vec2Normalize(out, v);

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(0.6);
            expect(result[1]).toBeCloseTo(0.8);
        });

        it("should handle zero vector", () => {
            const v = vec2Zero();
            const out = vec2Zero();
            const result = vec2Normalize(out, v);

            expect(result).toBe(out);
            expect(result).toEqual([0, 0]);
        });

        it("should normalize unit vector", () => {
            const v = vec2UnitX();
            const out = vec2Zero();
            const result = vec2Normalize(out, v);

            expect(result).toBe(out);
            expect(result).toEqual([1, 0]);
        });
    });

    describe("vec2Dot", () => {
        it("should calculate dot product", () => {
            const a = vec2New(1, 2);
            const b = vec2New(3, 4);
            const result = vec2Dot(a, b);

            expect(result).toBe(11); // 1*3 + 2*4 = 3 + 8 = 11
        });

        it("should return zero for perpendicular vectors", () => {
            const a = vec2New(1, 0);
            const b = vec2New(0, 1);
            const result = vec2Dot(a, b);

            expect(result).toBe(0);
        });

        it("should return zero for zero vector", () => {
            const a = vec2Zero();
            const b = vec2New(1, 2);
            const result = vec2Dot(a, b);

            expect(result).toBe(0);
        });
    });

    describe("vec2Length", () => {
        it("should calculate vector length", () => {
            const v = vec2New(3, 4);
            const result = vec2Length(v);

            expect(result).toBe(5);
        });

        it("should return zero for zero vector", () => {
            const v = vec2Zero();
            const result = vec2Length(v);

            expect(result).toBe(0);
        });
    });

    describe("vec2LengthSq", () => {
        it("should calculate squared length", () => {
            const v = vec2New(3, 4);
            const result = vec2LengthSq(v);

            expect(result).toBe(25);
        });

        it("should return zero for zero vector", () => {
            const v = vec2Zero();
            const result = vec2LengthSq(v);

            expect(result).toBe(0);
        });
    });

    describe("vec2Add", () => {
        it("should add two vectors", () => {
            const a = vec2New(1, 2);
            const b = vec2New(3, 4);
            const out = vec2Zero();
            const result = vec2Add(out, a, b);

            expect(result).toBe(out);
            expect(result).toEqual([4, 6]);
        });

        it("should add zero vector", () => {
            const a = vec2New(1, 2);
            const b = vec2Zero();
            const out = vec2Zero();
            const result = vec2Add(out, a, b);

            expect(result).toBe(out);
            expect(result).toEqual([1, 2]);
        });
    });

    describe("vec2Sub", () => {
        it("should subtract two vectors", () => {
            const a = vec2New(5, 7);
            const b = vec2New(1, 2);
            const out = vec2Zero();
            const result = vec2Sub(out, a, b);

            expect(result).toBe(out);
            expect(result).toEqual([4, 5]);
        });

        it("should subtract zero vector", () => {
            const a = vec2New(1, 2);
            const b = vec2Zero();
            const out = vec2Zero();
            const result = vec2Sub(out, a, b);

            expect(result).toBe(out);
            expect(result).toEqual([1, 2]);
        });
    });

    describe("vec2Mul", () => {
        it("should multiply vector by scalar", () => {
            const v = vec2New(1, 2);
            const out = vec2Zero();
            const result = vec2Mul(out, v, 2);

            expect(result).toBe(out);
            expect(result).toEqual([2, 4]);
        });

        it("should multiply by zero", () => {
            const v = vec2New(1, 2);
            const out = vec2Zero();
            const result = vec2Mul(out, v, 0);

            expect(result).toBe(out);
            expect(result).toEqual([0, 0]);
        });

        it("should multiply by negative scalar", () => {
            const v = vec2New(1, 2);
            const out = vec2Zero();
            const result = vec2Mul(out, v, -1);

            expect(result).toBe(out);
            expect(result).toEqual([-1, -2]);
        });
    });

    describe("vec2DivScalar", () => {
        it("should divide vector by scalar", () => {
            const v = vec2New(2, 4);
            const out = vec2Zero();
            const result = vec2DivScalar(out, v, 2);

            expect(result).toBe(out);
            expect(result).toEqual([1, 2]);
        });

        it("should handle division by negative scalar", () => {
            const v = vec2New(2, 4);
            const out = vec2Zero();
            const result = vec2DivScalar(out, v, -2);

            expect(result).toBe(out);
            expect(result).toEqual([-1, -2]);
        });
    });

    describe("vec2Negate", () => {
        it("should negate vector", () => {
            const v = vec2New(1, 2);
            const out = vec2Zero();
            const result = vec2Negate(out, v);

            expect(result).toBe(out);
            expect(result).toEqual([-1, -2]);
        });

        it("should negate zero vector", () => {
            const v = vec2Zero();
            const out = vec2Zero();
            const result = vec2Negate(out, v);

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(0);
        });
    });

    describe("vec2Distance", () => {
        it("should calculate distance between points", () => {
            const a = vec2New(0, 0);
            const b = vec2New(3, 4);
            const result = vec2Distance(a, b);

            expect(result).toBe(5);
        });

        it("should return zero for same points", () => {
            const a = vec2New(1, 2);
            const b = vec2New(1, 2);
            const result = vec2Distance(a, b);

            expect(result).toBe(0);
        });
    });

    describe("vec2DistanceSq", () => {
        it("should calculate squared distance", () => {
            const a = vec2New(0, 0);
            const b = vec2New(3, 4);
            const result = vec2DistanceSq(a, b);

            expect(result).toBe(25);
        });

        it("should return zero for same points", () => {
            const a = vec2New(1, 2);
            const b = vec2New(1, 2);
            const result = vec2DistanceSq(a, b);

            expect(result).toBe(0);
        });
    });

    describe("vec2Lerp", () => {
        it("should interpolate between vectors", () => {
            const a = vec2New(0, 0);
            const b = vec2New(10, 10);
            const out = vec2Zero();
            const result = vec2Lerp(out, a, b, 0.5);

            expect(result).toBe(out);
            expect(result).toEqual([5, 5]);
        });

        it("should return first vector at t=0", () => {
            const a = vec2New(1, 2);
            const b = vec2New(4, 5);
            const out = vec2Zero();
            const result = vec2Lerp(out, a, b, 0);

            expect(result).toBe(out);
            expect(result).toEqual([1, 2]);
        });

        it("should return second vector at t=1", () => {
            const a = vec2New(1, 2);
            const b = vec2New(4, 5);
            const out = vec2Zero();
            const result = vec2Lerp(out, a, b, 1);

            expect(result).toBe(out);
            expect(result).toEqual([4, 5]);
        });
    });

    describe("vec2Reflect", () => {
        it("should reflect vector off surface", () => {
            const incident = vec2New(1, -1);
            const normal = vec2New(0, 1);
            const out = vec2Zero();
            const result = vec2Reflect(out, incident, normal);

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(1);
            expect(result[1]).toBeCloseTo(1);
        });

        it("should reflect vector at angle", () => {
            const incident = vec2New(1, 0);
            const normal = vec2New(1, 1);
            const normalizedNormal = vec2Zero();
            vec2Normalize(normalizedNormal, normal);
            const out = vec2Zero();
            const result = vec2Reflect(out, incident, normalizedNormal);

            expect(result).toBe(out);
            // The reflected vector should have negative x component (within floating point precision)
            expect(result[0]).toBeLessThanOrEqual(1e-15);
        });
    });

    describe("vec2Cross", () => {
        it("should calculate cross product", () => {
            const a = vec2New(1, 0);
            const b = vec2New(0, 1);
            const result = vec2Cross(a, b);

            expect(result).toBe(1);
        });

        it("should calculate cross product with negative result", () => {
            const a = vec2New(0, 1);
            const b = vec2New(1, 0);
            const result = vec2Cross(a, b);

            expect(result).toBe(-1);
        });

        it("should handle parallel vectors", () => {
            const a = vec2New(1, 2);
            const b = vec2New(2, 4);
            const result = vec2Cross(a, b);

            expect(result).toBe(0);
        });
    });

    describe("vec2Rotate", () => {
        it("should rotate vector by 90 degrees", () => {
            const v = vec2New(1, 0);
            const out = vec2Zero();
            const result = vec2Rotate(out, v, Math.PI / 2);

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(1);
        });

        it("should rotate vector by 180 degrees", () => {
            const v = vec2New(1, 0);
            const out = vec2Zero();
            const result = vec2Rotate(out, v, Math.PI);

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(-1);
            expect(result[1]).toBeCloseTo(0);
        });

        it("should handle zero rotation", () => {
            const v = vec2New(1, 2);
            const out = vec2Zero();
            const result = vec2Rotate(out, v, 0);

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(1);
            expect(result[1]).toBeCloseTo(2);
        });
    });

    describe("vec2Angle", () => {
        it("should calculate angle between vectors", () => {
            const a = vec2New(1, 0);
            const b = vec2New(0, 1);
            const result = vec2Angle(a, b);

            expect(result).toBeCloseTo(Math.PI / 2);
        });

        it("should calculate angle between same vectors", () => {
            const a = vec2New(1, 0);
            const b = vec2New(1, 0);
            const result = vec2Angle(a, b);

            expect(result).toBeCloseTo(0);
        });

        it("should calculate angle between opposite vectors", () => {
            const a = vec2New(1, 0);
            const b = vec2New(-1, 0);
            const result = vec2Angle(a, b);

            expect(result).toBeCloseTo(Math.PI);
        });

        it("should handle zero vectors", () => {
            const a = vec2Zero();
            const b = vec2New(1, 0);
            const result = vec2Angle(a, b);

            expect(result).toBe(0);
        });
    });

    describe("edge cases and integration", () => {
        it("should handle chained operations", () => {
            const a = vec2New(1, 2);
            const b = vec2New(3, 4);
            const temp1 = vec2Zero();
            const temp2 = vec2Zero();
            const result = vec2Zero();

            // result = normalize(a + b * 2)
            vec2Mul(temp1, b, 2);
            vec2Add(temp2, a, temp1);
            vec2Normalize(result, temp2);

            expect(vec2Length(result)).toBeCloseTo(1);
        });

        it("should maintain precision with small numbers", () => {
            const v = vec2New(0.1, 0.2);
            const out = vec2Zero();
            const result = vec2Normalize(out, v);

            expect(vec2Length(result)).toBeCloseTo(1);
        });

        it("should handle large numbers", () => {
            const v = vec2New(1000, 2000);
            const out = vec2Zero();
            const result = vec2Normalize(out, v);

            expect(vec2Length(result)).toBeCloseTo(1);
        });
    });
});
