import { describe, it, expect } from "bun:test";
import {
    vec3New,
    vec3Zero,
    vec3UnitX,
    vec3UnitY,
    vec3UnitZ,
    vec3Normalize,
    vec3Cross,
    vec3Dot,
    vec3Length,
    vec3LengthSq,
    vec3Add,
    vec3Sub,
    vec3Mul,
    vec3MulScalar,
    vec3DivScalar,
    vec3Negate,
    vec3Distance,
    vec3DistanceSq,
    vec3Lerp,
    vec3Reflect,
} from "./vec3";

describe("Vec3 Math Functions", () => {
    describe("create functions", () => {
        it("should create Vec3 with given components", () => {
            const v = vec3New(1, 2, 3);
            expect(v).toEqual([1, 2, 3]);
        });

        it("should create zero vector", () => {
            const v = vec3Zero();
            expect(v).toEqual([0, 0, 0]);
        });

        it("should create unit vectors", () => {
            expect(vec3UnitX()).toEqual([1, 0, 0]);
            expect(vec3UnitY()).toEqual([0, 1, 0]);
            expect(vec3UnitZ()).toEqual([0, 0, 1]);
        });
    });

    describe("normalize", () => {
        it("should normalize a vector", () => {
            const v = vec3New(3, 4, 0);
            const out = vec3Zero();
            const result = vec3Normalize(out, v);

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(0.6);
            expect(result[1]).toBeCloseTo(0.8);
            expect(result[2]).toBeCloseTo(0);
        });

        it("should handle zero vector", () => {
            const v = vec3Zero();
            const out = vec3Zero();
            const result = vec3Normalize(out, v);

            expect(result).toBe(out);
            expect(result).toEqual([0, 0, 0]);
        });

        it("should normalize unit vector", () => {
            const v = vec3UnitX();
            const out = vec3Zero();
            const result = vec3Normalize(out, v);

            expect(result).toBe(out);
            expect(result).toEqual([1, 0, 0]);
        });
    });

    describe("cross", () => {
        it("should calculate cross product", () => {
            const a = vec3New(1, 0, 0);
            const b = vec3New(0, 1, 0);
            const out = vec3Zero();
            const result = vec3Cross(out, a, b);

            expect(result).toBe(out);
            expect(result).toEqual([0, 0, 1]);
        });

        it("should calculate cross product with negative result", () => {
            const a = vec3New(0, 1, 0);
            const b = vec3New(1, 0, 0);
            const out = vec3Zero();
            const result = vec3Cross(out, a, b);

            expect(result).toBe(out);
            expect(result).toEqual([0, 0, -1]);
        });

        it("should handle parallel vectors", () => {
            const a = vec3New(1, 2, 3);
            const b = vec3New(2, 4, 6);
            const out = vec3Zero();
            const result = vec3Cross(out, a, b);

            expect(result).toBe(out);
            expect(result).toEqual([0, 0, 0]);
        });
    });

    describe("dot", () => {
        it("should calculate dot product", () => {
            const a = vec3New(1, 2, 3);
            const b = vec3New(4, 5, 6);
            const result = vec3Dot(a, b);

            expect(result).toBe(32); // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
        });

        it("should return zero for perpendicular vectors", () => {
            const a = vec3New(1, 0, 0);
            const b = vec3New(0, 1, 0);
            const result = vec3Dot(a, b);

            expect(result).toBe(0);
        });

        it("should return zero for zero vector", () => {
            const a = vec3Zero();
            const b = vec3New(1, 2, 3);
            const result = vec3Dot(a, b);

            expect(result).toBe(0);
        });
    });

    describe("length", () => {
        it("should calculate vector length", () => {
            const v = vec3New(3, 4, 0);
            const result = vec3Length(v);

            expect(result).toBe(5);
        });

        it("should return zero for zero vector", () => {
            const v = vec3Zero();
            const result = vec3Length(v);

            expect(result).toBe(0);
        });

        it("should calculate 3D vector length", () => {
            const v = vec3New(1, 2, 2);
            const result = vec3Length(v);

            expect(result).toBe(3);
        });
    });

    describe("lengthSq", () => {
        it("should calculate squared length", () => {
            const v = vec3New(3, 4, 0);
            const result = vec3LengthSq(v);

            expect(result).toBe(25);
        });

        it("should return zero for zero vector", () => {
            const v = vec3Zero();
            const result = vec3LengthSq(v);

            expect(result).toBe(0);
        });
    });

    describe("add", () => {
        it("should add two vectors", () => {
            const a = vec3New(1, 2, 3);
            const b = vec3New(4, 5, 6);
            const out = vec3Zero();
            const result = vec3Add(out, a, b);

            expect(result).toBe(out);
            expect(result).toEqual([5, 7, 9]);
        });

        it("should add zero vector", () => {
            const a = vec3New(1, 2, 3);
            const b = vec3Zero();
            const out = vec3Zero();
            const result = vec3Add(out, a, b);

            expect(result).toBe(out);
            expect(result).toEqual([1, 2, 3]);
        });
    });

    describe("sub", () => {
        it("should subtract two vectors", () => {
            const a = vec3New(5, 7, 9);
            const b = vec3New(1, 2, 3);
            const out = vec3Zero();
            const result = vec3Sub(out, a, b);

            expect(result).toBe(out);
            expect(result).toEqual([4, 5, 6]);
        });

        it("should subtract zero vector", () => {
            const a = vec3New(1, 2, 3);
            const b = vec3Zero();
            const out = vec3Zero();
            const result = vec3Sub(out, a, b);

            expect(result).toBe(out);
            expect(result).toEqual([1, 2, 3]);
        });
    });

    describe("mulScalar", () => {
        it("should multiply vector by scalar", () => {
            const v = vec3New(1, 2, 3);
            const out = vec3Zero();
            const result = vec3Mul(out, v, 2);

            expect(result).toBe(out);
            expect(result).toEqual([2, 4, 6]);
        });

        it("should multiply by zero", () => {
            const v = vec3New(1, 2, 3);
            const out = vec3Zero();
            const result = vec3Mul(out, v, 0);

            expect(result).toBe(out);
            expect(result).toEqual([0, 0, 0]);
        });

        it("should multiply by negative scalar", () => {
            const v = vec3New(1, 2, 3);
            const out = vec3Zero();
            const result = vec3Mul(out, v, -1);

            expect(result).toBe(out);
            expect(result).toEqual([-1, -2, -3]);
        });
    });

    describe("vec3MulScalar", () => {
        it("should multiply vector by scalar", () => {
            const v = vec3New(1, 2, 3);
            const out = vec3Zero();
            const result = vec3MulScalar(out, v, 2);

            expect(result).toBe(out);
            expect(result).toEqual([2, 4, 6]);
        });

        it("should multiply by zero", () => {
            const v = vec3New(1, 2, 3);
            const out = vec3Zero();
            const result = vec3MulScalar(out, v, 0);

            expect(result).toBe(out);
            expect(result).toEqual([0, 0, 0]);
        });

        it("should multiply by negative scalar", () => {
            const v = vec3New(1, 2, 3);
            const out = vec3Zero();
            const result = vec3MulScalar(out, v, -1);

            expect(result).toBe(out);
            expect(result).toEqual([-1, -2, -3]);
        });

        it("should multiply by fractional scalar", () => {
            const v = vec3New(2, 4, 6);
            const out = vec3Zero();
            const result = vec3MulScalar(out, v, 0.5);

            expect(result).toBe(out);
            expect(result).toEqual([1, 2, 3]);
        });

        it("should multiply by large scalar", () => {
            const v = vec3New(1, 2, 3);
            const out = vec3Zero();
            const result = vec3MulScalar(out, v, 1000);

            expect(result).toBe(out);
            expect(result).toEqual([1000, 2000, 3000]);
        });

        it("should handle zero vector", () => {
            const v = vec3Zero();
            const out = vec3Zero();
            const result = vec3MulScalar(out, v, 5);

            expect(result).toBe(out);
            expect(result).toEqual([0, 0, 0]);
        });

        it("should handle unit vectors", () => {
            const v = vec3UnitX();
            const out = vec3Zero();
            const result = vec3MulScalar(out, v, 3);

            expect(result).toBe(out);
            expect(result).toEqual([3, 0, 0]);
        });

        it("should handle negative vector with positive scalar", () => {
            const v = vec3New(-1, -2, -3);
            const out = vec3Zero();
            const result = vec3MulScalar(out, v, 2);

            expect(result).toBe(out);
            expect(result).toEqual([-2, -4, -6]);
        });

        it("should handle negative vector with negative scalar", () => {
            const v = vec3New(-1, -2, -3);
            const out = vec3Zero();
            const result = vec3MulScalar(out, v, -2);

            expect(result).toBe(out);
            expect(result).toEqual([2, 4, 6]);
        });

        it("should maintain precision with small numbers", () => {
            const v = vec3New(0.1, 0.2, 0.3);
            const out = vec3Zero();
            const result = vec3MulScalar(out, v, 0.1);

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(0.01);
            expect(result[1]).toBeCloseTo(0.02);
            expect(result[2]).toBeCloseTo(0.03);
        });
    });

    describe("divScalar", () => {
        it("should divide vector by scalar", () => {
            const v = vec3New(2, 4, 6);
            const out = vec3Zero();
            const result = vec3DivScalar(out, v, 2);

            expect(result).toBe(out);
            expect(result).toEqual([1, 2, 3]);
        });

        it("should handle division by negative scalar", () => {
            const v = vec3New(2, 4, 6);
            const out = vec3Zero();
            const result = vec3DivScalar(out, v, -2);

            expect(result).toBe(out);
            expect(result).toEqual([-1, -2, -3]);
        });
    });

    describe("negate", () => {
        it("should negate vector", () => {
            const v = vec3New(1, 2, 3);
            const out = vec3Zero();
            const result = vec3Negate(out, v);

            expect(result).toBe(out);
            expect(result).toEqual([-1, -2, -3]);
        });

        it("should negate zero vector", () => {
            const v = vec3Zero();
            const out = vec3Zero();
            const result = vec3Negate(out, v);

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(0);
        });
    });

    describe("distance", () => {
        it("should calculate distance between points", () => {
            const a = vec3New(0, 0, 0);
            const b = vec3New(3, 4, 0);
            const result = vec3Distance(a, b);

            expect(result).toBe(5);
        });

        it("should return zero for same points", () => {
            const a = vec3New(1, 2, 3);
            const b = vec3New(1, 2, 3);
            const result = vec3Distance(a, b);

            expect(result).toBe(0);
        });
    });

    describe("distanceSq", () => {
        it("should calculate squared distance", () => {
            const a = vec3New(0, 0, 0);
            const b = vec3New(3, 4, 0);
            const result = vec3DistanceSq(a, b);

            expect(result).toBe(25);
        });

        it("should return zero for same points", () => {
            const a = vec3New(1, 2, 3);
            const b = vec3New(1, 2, 3);
            const result = vec3DistanceSq(a, b);

            expect(result).toBe(0);
        });
    });

    describe("lerp", () => {
        it("should interpolate between vectors", () => {
            const a = vec3New(0, 0, 0);
            const b = vec3New(10, 10, 10);
            const out = vec3Zero();
            const result = vec3Lerp(out, a, b, 0.5);

            expect(result).toBe(out);
            expect(result).toEqual([5, 5, 5]);
        });

        it("should return first vector at t=0", () => {
            const a = vec3New(1, 2, 3);
            const b = vec3New(4, 5, 6);
            const out = vec3Zero();
            const result = vec3Lerp(out, a, b, 0);

            expect(result).toBe(out);
            expect(result).toEqual([1, 2, 3]);
        });

        it("should return second vector at t=1", () => {
            const a = vec3New(1, 2, 3);
            const b = vec3New(4, 5, 6);
            const out = vec3Zero();
            const result = vec3Lerp(out, a, b, 1);

            expect(result).toBe(out);
            expect(result).toEqual([4, 5, 6]);
        });
    });

    describe("reflect", () => {
        it("should reflect vector off surface", () => {
            const incident = vec3New(1, -1, 0);
            const normal = vec3New(0, 1, 0);
            const out = vec3Zero();
            const result = vec3Reflect(out, incident, normal);

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(1);
            expect(result[1]).toBeCloseTo(1);
            expect(result[2]).toBeCloseTo(0);
        });

        it("should reflect vector at angle", () => {
            const incident = vec3New(1, 0, 0);
            const normal = vec3New(1, 1, 0);
            const normalizedNormal = vec3Zero();
            vec3Normalize(normalizedNormal, normal);
            const out = vec3Zero();
            const result = vec3Reflect(out, incident, normalizedNormal);

            expect(result).toBe(out);
            // The reflected vector should have negative x component (within floating point precision)
            expect(result[0]).toBeLessThanOrEqual(1e-15);
        });
    });

    describe("edge cases and integration", () => {
        it("should handle chained operations", () => {
            const a = vec3New(1, 2, 3);
            const b = vec3New(4, 5, 6);
            const temp1 = vec3Zero();
            const temp2 = vec3Zero();
            const result = vec3Zero();

            // result = vec3Normalize(a + b * 2)
            vec3Mul(temp1, b, 2);
            vec3Add(temp2, a, temp1);
            vec3Normalize(result, temp2);

            expect(vec3Length(result)).toBeCloseTo(1);
        });

        it("should maintain precision with small numbers", () => {
            const v = vec3New(0.1, 0.2, 0.3);
            const out = vec3Zero();
            const result = vec3Normalize(out, v);

            expect(vec3Length(result)).toBeCloseTo(1);
        });

        it("should handle large numbers", () => {
            const v = vec3New(1000, 2000, 3000);
            const out = vec3Zero();
            const result = vec3Normalize(out, v);

            expect(vec3Length(result)).toBeCloseTo(1);
        });
    });
});
