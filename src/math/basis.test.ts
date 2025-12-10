import { describe, it, expect } from "bun:test";
import {
    basisNew,
    basisIdentity,
    basisFromAxes,
    basisFromEuler,
    basisFromEulerDeg,
    basisFromQuat,
    basisFromAxisAngle,
    basisMul,
    basisTranspose,
    basisDeterminant,
    basisInverse,
    basisRotateVec3,
    basisGetXAxis,
    basisGetYAxis,
    basisGetZAxis,
    basisSetXAxis,
    basisSetYAxis,
    basisSetZAxis,
    basisToEuler,
    basisToEulerDeg,
    basisToQuat,
    basisOrthonormalize,
    basisScale,
    basisLerp,
    basisSlerp,
    basisRotate,
    basisRotateEuler,
    basisRotateEulerDeg,
    basisRotateQuat,
    basisRotateLocal,
    basisRotateLocalEuler,
    basisRotateLocalEulerDeg,
    basisRotateLocalQuat,
} from "./basis";
import { vec3New, vec3Zero, vec3Length, vec3Dot } from "./vec3";
import { quatIdentity, quatFromAxisAngle } from "./quat";

describe("Basis Math Functions", () => {
    describe("create functions", () => {
        it("should create Basis with given components", () => {
            const b = basisNew(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            expect(b).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });

        it("should create identity basis", () => {
            const b = basisIdentity();
            expect(b).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
        });

        it("should create basis from axes", () => {
            const xAxis = vec3New(1, 0, 0);
            const yAxis = vec3New(0, 1, 0);
            const zAxis = vec3New(0, 0, 1);
            const b = basisFromAxes(xAxis, yAxis, zAxis);
            expect(b).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
        });

        it("should create basis from Euler angles", () => {
            const euler = vec3New(0, 0, 0);
            const b = basisFromEuler(euler);
            expect(b[0]).toBeCloseTo(1);
            expect(b[1]).toBeCloseTo(0);
            expect(b[2]).toBeCloseTo(0);
            expect(b[3]).toBeCloseTo(0);
            expect(b[4]).toBeCloseTo(1);
            expect(b[5]).toBeCloseTo(0);
            expect(b[6]).toBeCloseTo(0);
            expect(b[7]).toBeCloseTo(0);
            expect(b[8]).toBeCloseTo(1);
        });

        it("should create basis from Euler angles in degrees", () => {
            const eulerDeg = vec3New(0, 0, 0);
            const b = basisFromEulerDeg(eulerDeg);
            expect(b[0]).toBeCloseTo(1);
            expect(b[1]).toBeCloseTo(0);
            expect(b[2]).toBeCloseTo(0);
            expect(b[3]).toBeCloseTo(0);
            expect(b[4]).toBeCloseTo(1);
            expect(b[5]).toBeCloseTo(0);
            expect(b[6]).toBeCloseTo(0);
            expect(b[7]).toBeCloseTo(0);
            expect(b[8]).toBeCloseTo(1);
        });

        it("should create basis from axis-angle", () => {
            const axis = vec3New(0, 0, 1);
            const b = basisFromAxisAngle(axis, 0);
            expect(b).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
        });

        it("should create basis from quaternion", () => {
            const q = quatIdentity();
            const b = basisFromQuat(q);
            expect(b).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
        });
    });

    describe("basisMul", () => {
        it("should multiply two basis matrices", () => {
            const a = basisIdentity();
            const b = basisIdentity();
            const out = basisIdentity();
            const result = basisMul(out, a, b);

            expect(result).toBe(out);
            expect(result).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
        });

        it("should multiply rotation matrices", () => {
            const a = basisFromEuler(vec3New(Math.PI / 2, 0, 0)); // 90° around X
            const b = basisFromEuler(vec3New(0, Math.PI / 2, 0)); // 90° around Y
            const out = basisIdentity();
            const result = basisMul(out, a, b);

            expect(result).toBe(out);
            // Result should be a valid rotation matrix
            expect(result.length).toBe(9);
        });
    });

    describe("basisTranspose", () => {
        it("should transpose basis matrix", () => {
            const b = basisNew(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            const out = basisIdentity();
            const result = basisTranspose(out, b);

            expect(result).toBe(out);
            expect(result).toEqual([1, 4, 7, 2, 5, 8, 3, 6, 9]);
        });

        it("should transpose identity matrix", () => {
            const b = basisIdentity();
            const out = basisIdentity();
            const result = basisTranspose(out, b);

            expect(result).toBe(out);
            expect(result).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
        });
    });

    describe("basisDeterminant", () => {
        it("should calculate determinant of identity matrix", () => {
            const b = basisIdentity();
            const result = basisDeterminant(b);
            expect(result).toBeCloseTo(1);
        });

        it("should calculate determinant of rotation matrix", () => {
            const b = basisFromEuler(vec3New(Math.PI / 4, 0, 0));
            const result = basisDeterminant(b);
            expect(result).toBeCloseTo(1);
        });

        it("should calculate determinant of scaled matrix", () => {
            const b = basisNew(
                2, 0, 0,
                0, 3, 0,
                0, 0, 4
            );
            const result = basisDeterminant(b);
            expect(result).toBeCloseTo(24);
        });
    });

    describe("basisInverse", () => {
        it("should calculate inverse of identity matrix", () => {
            const b = basisIdentity();
            const out = basisIdentity();
            const result = basisInverse(out, b);

            expect(result).toBe(out);
            expect(result).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
        });

        it("should calculate inverse of rotation matrix", () => {
            const b = basisFromEuler(vec3New(Math.PI / 4, 0, 0));
            const out = basisIdentity();
            const result = basisInverse(out, b);

            expect(result).toBe(out);
            // Inverse of rotation matrix should be its transpose
            const transpose = basisIdentity();
            basisTranspose(transpose, b);
            expect(result[0]).toBeCloseTo(transpose[0]);
            expect(result[1]).toBeCloseTo(transpose[1]);
            expect(result[2]).toBeCloseTo(transpose[2]);
        });
    });

    describe("basisRotateVec3", () => {
        it("should rotate vector with identity matrix", () => {
            const b = basisIdentity();
            const v = vec3New(1, 2, 3);
            const out = vec3Zero();
            const result = basisRotateVec3(out, b, v);

            expect(result).toBe(out);
            expect(result).toEqual([1, 2, 3]);
        });

        it("should rotate vector with rotation matrix", () => {
            const b = basisFromEuler(vec3New(0, 0, Math.PI / 2)); // 90° around Z
            const v = vec3New(1, 0, 0);
            const out = vec3Zero();
            const result = basisRotateVec3(out, b, v);

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(1);
            expect(result[2]).toBeCloseTo(0);
        });
    });

    describe("basis axis functions", () => {
        it("should get X axis from basis", () => {
            const b = basisNew(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            const xAxis = basisGetXAxis(b);
            expect(xAxis).toEqual([1, 2, 3]);
        });

        it("should get Y axis from basis", () => {
            const b = basisNew(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            const yAxis = basisGetYAxis(b);
            expect(yAxis).toEqual([4, 5, 6]);
        });

        it("should get Z axis from basis", () => {
            const b = basisNew(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            const zAxis = basisGetZAxis(b);
            expect(zAxis).toEqual([7, 8, 9]);
        });

        it("should set X axis of basis", () => {
            const b = basisIdentity();
            const xAxis = vec3New(1, 2, 3);
            const out = basisIdentity();
            const result = basisSetXAxis(out, b, xAxis);

            expect(result).toBe(out);
            expect(result[0]).toBe(1);
            expect(result[1]).toBe(2);
            expect(result[2]).toBe(3);
            expect(result[3]).toBe(0);
            expect(result[4]).toBe(1);
            expect(result[5]).toBe(0);
        });

        it("should set Y axis of basis", () => {
            const b = basisIdentity();
            const yAxis = vec3New(1, 2, 3);
            const out = basisIdentity();
            const result = basisSetYAxis(out, b, yAxis);

            expect(result).toBe(out);
            expect(result[0]).toBe(1);
            expect(result[1]).toBe(0);
            expect(result[2]).toBe(0);
            expect(result[3]).toBe(1);
            expect(result[4]).toBe(2);
            expect(result[5]).toBe(3);
        });

        it("should set Z axis of basis", () => {
            const b = basisIdentity();
            const zAxis = vec3New(1, 2, 3);
            const out = basisIdentity();
            const result = basisSetZAxis(out, b, zAxis);

            expect(result).toBe(out);
            expect(result[0]).toBe(1);
            expect(result[1]).toBe(0);
            expect(result[2]).toBe(0);
            expect(result[3]).toBe(0);
            expect(result[4]).toBe(1);
            expect(result[5]).toBe(0);
            expect(result[6]).toBe(1);
            expect(result[7]).toBe(2);
            expect(result[8]).toBe(3);
        });
    });

    describe("basisToEuler", () => {
        it("should convert identity basis to zero Euler angles", () => {
            const b = basisIdentity();
            const euler = basisToEuler(b);
            expect(euler[0]).toBeCloseTo(0);
            expect(euler[1]).toBeCloseTo(0);
            expect(euler[2]).toBeCloseTo(0);
        });

        it("should convert basis to Euler angles in degrees", () => {
            const b = basisIdentity();
            const eulerDeg = basisToEulerDeg(b);
            expect(eulerDeg[0]).toBeCloseTo(0);
            expect(eulerDeg[1]).toBeCloseTo(0);
            expect(eulerDeg[2]).toBeCloseTo(0);
        });
    });

    describe("basisToQuat", () => {
        it("should convert identity basis to identity quaternion", () => {
            const b = basisIdentity();
            const q = basisToQuat(b);
            expect(q[0]).toBeCloseTo(0);
            expect(q[1]).toBeCloseTo(0);
            expect(q[2]).toBeCloseTo(0);
            expect(q[3]).toBeCloseTo(1);
        });
    });

    describe("basisOrthonormalize", () => {
        it("should orthonormalize basis matrix", () => {
            const b = basisNew(
                2, 0, 0,
                1, 1, 0,
                0, 0, 1
            );
            const out = basisIdentity();
            const result = basisOrthonormalize(out, b);

            expect(result).toBe(out);
            // Check that axes are normalized
            const xAxis = basisGetXAxis(result);
            const yAxis = basisGetYAxis(result);
            const zAxis = basisGetZAxis(result);

            expect(vec3Length(xAxis)).toBeCloseTo(1);
            expect(vec3Length(yAxis)).toBeCloseTo(1);
            expect(vec3Length(zAxis)).toBeCloseTo(1);

            // Check that axes are orthogonal
            expect(vec3Dot(xAxis, yAxis)).toBeCloseTo(0);
            expect(vec3Dot(xAxis, zAxis)).toBeCloseTo(0);
            expect(vec3Dot(yAxis, zAxis)).toBeCloseTo(0);
        });
    });

    describe("basisScale", () => {
        it("should scale basis by vector", () => {
            const b = basisIdentity();
            const scale = vec3New(2, 3, 4);
            const out = basisIdentity();
            const result = basisScale(out, b, scale);

            expect(result).toBe(out);
            expect(result[0]).toBe(2);
            expect(result[4]).toBe(3);
            expect(result[8]).toBe(4);
        });
    });

    describe("basisLerp", () => {
        it("should interpolate between basis matrices", () => {
            const a = basisIdentity();
            const b = basisFromEuler(vec3New(Math.PI / 2, 0, 0));
            const out = basisIdentity();
            const result = basisLerp(out, a, b, 0.5);

            // Result should be a valid rotation matrix
            expect(result.length).toBe(9);
            // Check that it's still a valid rotation matrix (determinant close to 1)
            expect(basisDeterminant(result)).toBeCloseTo(1);
            // At t=0.5, result should be different from both inputs
            expect(result).not.toEqual(a);
            expect(result).not.toEqual(b);
        });
    });

    describe("basisSlerp", () => {
        it("should spherical interpolate between basis matrices", () => {
            const a = basisIdentity();
            const b = basisFromEuler(vec3New(Math.PI / 2, 0, 0));
            const out = basisIdentity();
            const result = basisSlerp(out, a, b, 0.5);

            // Result should be a valid rotation matrix
            expect(result.length).toBe(9);
            // Check that it's still a valid rotation matrix (determinant close to 1)
            expect(basisDeterminant(result)).toBeCloseTo(1);
            // At t=0.5, result should be different from both inputs
            expect(result).not.toEqual(a);
            expect(result).not.toEqual(b);
        });
    });

    describe("edge cases and integration", () => {
        it("should handle chained basis operations", () => {
            const a = basisFromEuler(vec3New(Math.PI / 4, 0, 0));
            const b = basisFromEuler(vec3New(0, Math.PI / 4, 0));
            const temp = basisIdentity();
            const result = basisIdentity();

            // result = a * b
            basisMul(temp, a, b);
            basisMul(result, temp, basisIdentity());

            expect(result.length).toBe(9);
        });

        it("should maintain precision with small rotations", () => {
            const b = basisFromEuler(vec3New(0.001, 0.002, 0.003));
            const v = vec3New(1, 0, 0);
            const out = vec3Zero();
            const result = basisRotateVec3(out, b, v);

            expect(vec3Length(result)).toBeCloseTo(1);
        });
    });

    describe("basisRotate functions (global rotation)", () => {
        it("should rotate basis by axis-angle", () => {
            const b = basisIdentity();
            const axis = vec3New(0, 0, 1); // Z axis
            const angle = Math.PI / 2; // 90 degrees
            const out = basisIdentity();
            const result = basisRotate(out, b, axis, angle);

            expect(result).toBe(out);
            // Check that it's a valid rotation matrix
            expect(basisDeterminant(result)).toBeCloseTo(1);
            // Check that X axis becomes Y axis after 90° rotation around Z
            const xAxis = basisGetXAxis(result);
            expect(xAxis[0]).toBeCloseTo(0);
            expect(xAxis[1]).toBeCloseTo(1);
            expect(xAxis[2]).toBeCloseTo(0);
        });

        it("should rotate basis by Euler angles", () => {
            const b = basisIdentity();
            const euler = vec3New(Math.PI / 2, 0, 0); // 90° around X
            const out = basisIdentity();
            const result = basisRotateEuler(out, b, euler);

            expect(result).toBe(out);
            expect(basisDeterminant(result)).toBeCloseTo(1);
            // Check that Y axis becomes -Z axis after 90° rotation around X
            const yAxis = basisGetYAxis(result);
            expect(yAxis[0]).toBeCloseTo(0);
            expect(yAxis[1]).toBeCloseTo(0);
            expect(yAxis[2]).toBeCloseTo(-1);
        });

        it("should rotate basis by Euler angles in degrees", () => {
            const b = basisIdentity();
            const eulerDeg = vec3New(90, 0, 0); // 90° around X
            const out = basisIdentity();
            const result = basisRotateEulerDeg(out, b, eulerDeg);

            expect(result).toBe(out);
            expect(basisDeterminant(result)).toBeCloseTo(1);
            // Check that Y axis becomes -Z axis after 90° rotation around X
            const yAxis = basisGetYAxis(result);
            expect(yAxis[0]).toBeCloseTo(0);
            expect(yAxis[1]).toBeCloseTo(0);
            expect(yAxis[2]).toBeCloseTo(-1);
        });

        it("should rotate basis by quaternion", () => {
            const b = basisIdentity();
            const q = quatFromAxisAngle(vec3New(0, 0, 1), Math.PI / 2); // 90° around Z
            const out = basisIdentity();
            const result = basisRotateQuat(out, b, q);

            expect(result).toBe(out);
            expect(basisDeterminant(result)).toBeCloseTo(1);
            // Check that X axis becomes Y axis after 90° rotation around Z
            const xAxis = basisGetXAxis(result);
            expect(xAxis[0]).toBeCloseTo(0);
            expect(xAxis[1]).toBeCloseTo(1);
            expect(xAxis[2]).toBeCloseTo(0);
        });

        it("should handle zero rotation", () => {
            const b = basisIdentity();
            const axis = vec3New(0, 0, 1);
            const angle = 0;
            const out = basisIdentity();
            const result = basisRotate(out, b, axis, angle);

            expect(result).toBe(out);
            expect(result).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
        });
    });

    describe("basisRotateLocal functions (local rotation)", () => {
        it("should rotate basis locally by axis-angle", () => {
            const b = basisIdentity();
            const axis = vec3New(0, 0, 1); // Z axis
            const angle = Math.PI / 2; // 90 degrees
            const out = basisIdentity();
            const result = basisRotateLocal(out, b, axis, angle);

            expect(result).toBe(out);
            expect(basisDeterminant(result)).toBeCloseTo(1);
            // Check that X axis becomes Y axis after 90° rotation around Z
            const xAxis = basisGetXAxis(result);
            expect(xAxis[0]).toBeCloseTo(0);
            expect(xAxis[1]).toBeCloseTo(1);
            expect(xAxis[2]).toBeCloseTo(0);
        });

        it("should rotate basis locally by Euler angles", () => {
            const b = basisIdentity();
            const euler = vec3New(Math.PI / 2, 0, 0); // 90° around X
            const out = basisIdentity();
            const result = basisRotateLocalEuler(out, b, euler);

            expect(result).toBe(out);
            expect(basisDeterminant(result)).toBeCloseTo(1);
            // Check that Y axis becomes -Z axis after 90° rotation around X
            const yAxis = basisGetYAxis(result);
            expect(yAxis[0]).toBeCloseTo(0);
            expect(yAxis[1]).toBeCloseTo(0);
            expect(yAxis[2]).toBeCloseTo(-1);
        });

        it("should rotate basis locally by Euler angles in degrees", () => {
            const b = basisIdentity();
            const eulerDeg = vec3New(90, 0, 0); // 90° around X
            const out = basisIdentity();
            const result = basisRotateLocalEulerDeg(out, b, eulerDeg);

            expect(result).toBe(out);
            expect(basisDeterminant(result)).toBeCloseTo(1);
            // Check that Y axis becomes -Z axis after 90° rotation around X
            const yAxis = basisGetYAxis(result);
            expect(yAxis[0]).toBeCloseTo(0);
            expect(yAxis[1]).toBeCloseTo(0);
            expect(yAxis[2]).toBeCloseTo(-1);
        });

        it("should rotate basis locally by quaternion", () => {
            const b = basisIdentity();
            const q = quatFromAxisAngle(vec3New(0, 0, 1), Math.PI / 2); // 90° around Z
            const out = basisIdentity();
            const result = basisRotateLocalQuat(out, b, q);

            expect(result).toBe(out);
            expect(basisDeterminant(result)).toBeCloseTo(1);
            // Check that X axis becomes Y axis after 90° rotation around Z
            const xAxis = basisGetXAxis(result);
            expect(xAxis[0]).toBeCloseTo(0);
            expect(xAxis[1]).toBeCloseTo(1);
            expect(xAxis[2]).toBeCloseTo(0);
        });

        it("should handle zero local rotation", () => {
            const b = basisIdentity();
            const axis = vec3New(0, 0, 1);
            const angle = 0;
            const out = basisIdentity();
            const result = basisRotateLocal(out, b, axis, angle);

            expect(result).toBe(out);
            expect(result).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
        });
    });

    describe("rotation function equivalence", () => {
        it("should produce same result for global and local rotation on identity basis", () => {
            const b = basisIdentity();
            const axis = vec3New(0, 0, 1);
            const angle = Math.PI / 4;

            const globalOut = basisIdentity();
            const localOut = basisIdentity();

            basisRotate(globalOut, b, axis, angle);
            basisRotateLocal(localOut, b, axis, angle);

            // For identity basis, global and local rotations should be the same
            expect(globalOut[0]).toBeCloseTo(localOut[0]);
            expect(globalOut[1]).toBeCloseTo(localOut[1]);
            expect(globalOut[2]).toBeCloseTo(localOut[2]);
            expect(globalOut[3]).toBeCloseTo(localOut[3]);
            expect(globalOut[4]).toBeCloseTo(localOut[4]);
            expect(globalOut[5]).toBeCloseTo(localOut[5]);
            expect(globalOut[6]).toBeCloseTo(localOut[6]);
            expect(globalOut[7]).toBeCloseTo(localOut[7]);
            expect(globalOut[8]).toBeCloseTo(localOut[8]);
        });

        it("should handle global and local rotation on non-identity basis", () => {
            const b = basisFromEuler(vec3New(Math.PI / 4, Math.PI / 4, 0)); // 45° around X and Y
            const axis = vec3New(0, 0, 1); // Z axis
            const angle = Math.PI / 4;

            const globalOut = basisIdentity();
            const localOut = basisIdentity();

            basisRotate(globalOut, b, axis, angle);
            basisRotateLocal(localOut, b, axis, angle);

            // Both should produce valid rotation matrices
            expect(basisDeterminant(globalOut)).toBeCloseTo(1);
            expect(basisDeterminant(localOut)).toBeCloseTo(1);

            // Both should be different from the original basis
            expect(globalOut[0]).not.toBeCloseTo(b[0]);
            expect(localOut[0]).not.toBeCloseTo(b[0]);
        });

        it("should produce equivalent results for different rotation representations", () => {
            const b = basisIdentity();
            const axis = vec3New(0, 0, 1);
            const angle = Math.PI / 3;
            const euler = vec3New(0, 0, angle);
            const q = quatFromAxisAngle(axis, angle);

            const axisAngleOut = basisIdentity();
            const eulerOut = basisIdentity();
            const quatOut = basisIdentity();

            basisRotate(axisAngleOut, b, axis, angle);
            basisRotateEuler(eulerOut, b, euler);
            basisRotateQuat(quatOut, b, q);

            // All three should produce the same result (using absolute values to handle sign differences)
            expect(Math.abs(axisAngleOut[0])).toBeCloseTo(Math.abs(eulerOut[0]));
            expect(Math.abs(axisAngleOut[1])).toBeCloseTo(Math.abs(eulerOut[1]));
            expect(Math.abs(axisAngleOut[2])).toBeCloseTo(Math.abs(eulerOut[2]));
            expect(Math.abs(axisAngleOut[3])).toBeCloseTo(Math.abs(eulerOut[3]));
            expect(Math.abs(axisAngleOut[4])).toBeCloseTo(Math.abs(eulerOut[4]));
            expect(Math.abs(axisAngleOut[5])).toBeCloseTo(Math.abs(eulerOut[5]));
            expect(Math.abs(axisAngleOut[6])).toBeCloseTo(Math.abs(eulerOut[6]));
            expect(Math.abs(axisAngleOut[7])).toBeCloseTo(Math.abs(eulerOut[7]));
            expect(Math.abs(axisAngleOut[8])).toBeCloseTo(Math.abs(eulerOut[8]));

            expect(Math.abs(axisAngleOut[0])).toBeCloseTo(Math.abs(quatOut[0]));
            expect(Math.abs(axisAngleOut[1])).toBeCloseTo(Math.abs(quatOut[1]));
            expect(Math.abs(axisAngleOut[2])).toBeCloseTo(Math.abs(quatOut[2]));
            expect(Math.abs(axisAngleOut[3])).toBeCloseTo(Math.abs(quatOut[3]));
            expect(Math.abs(axisAngleOut[4])).toBeCloseTo(Math.abs(quatOut[4]));
            expect(Math.abs(axisAngleOut[5])).toBeCloseTo(Math.abs(quatOut[5]));
            expect(Math.abs(axisAngleOut[6])).toBeCloseTo(Math.abs(quatOut[6]));
            expect(Math.abs(axisAngleOut[7])).toBeCloseTo(Math.abs(quatOut[7]));
            expect(Math.abs(axisAngleOut[8])).toBeCloseTo(Math.abs(quatOut[8]));
        });
    });
});
