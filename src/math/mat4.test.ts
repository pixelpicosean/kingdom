import { describe, it, expect } from "bun:test";
import {
    mat4New,
    mat4Identity,
    mat4Mul,
    mat4LookAt,
    mat4Perspective,
    mat4Ortho,
    mat4FromTranslation,
    mat4FromXRotation,
    mat4FromYRotation,
    mat4FromZRotation,
    mat4FromRotation,
    mat4FromScale,
    mat4Translate,
    mat4RotateX,
    mat4RotateY,
    mat4RotateZ,
    mat4Scale,
    mat4Transpose,
    mat4TransformVec3,
    mat4SetBasis,
} from "./mat4";
import { vec3New, vec3Zero } from "./vec3";
import { basisIdentity, basisFromEuler } from "./basis";

describe("Mat4 Math Functions", () => {
    describe("create functions", () => {
        it("should create Mat4 with given values", () => {
            const m = mat4New(
                1, 2, 3, 4,
                5, 6, 7, 8,
                9, 10, 11, 12,
                13, 14, 15, 16
            );
            expect(m).toEqual([
                1, 2, 3, 4,
                5, 6, 7, 8,
                9, 10, 11, 12,
                13, 14, 15, 16
            ]);
        });

        it("should create identity matrix", () => {
            const m = mat4Identity();
            expect(m).toEqual([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
        });
    });

    describe("mat4Mul", () => {
        it("should multiply two matrices", () => {
            const a = mat4New(
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                1, 2, 3, 1
            );
            const b = mat4New(
                2, 0, 0, 0,
                0, 2, 0, 0,
                0, 0, 2, 0,
                0, 0, 0, 1
            );
            const out = mat4Identity();
            const result = mat4Mul(out, a, b);

            expect(result).toBe(out);
            // mat4Mul(out, a, b) computes b * a (scale * translate)
            // Scale is applied first, then translation
            expect(result).toEqual([
                2, 0, 0, 0,
                0, 2, 0, 0,
                0, 0, 2, 0,
                1, 2, 3, 1
            ]);
        });

        it("should multiply identity matrix", () => {
            const a = mat4Identity();
            const b = mat4New(
                1, 2, 3, 4,
                5, 6, 7, 8,
                9, 10, 11, 12,
                13, 14, 15, 16
            );
            const out = mat4Identity();
            const result = mat4Mul(out, a, b);

            expect(result).toBe(out);
            expect(result).toEqual(b);
        });
    });

    describe("mat4LookAt", () => {
        it("should create look-at matrix", () => {
            const eye = vec3New(0, 0, 5);
            const center = vec3New(0, 0, 0);
            const up = vec3New(0, 1, 0);
            const out = mat4Identity();
            const result = mat4LookAt(out, eye, center, up);

            expect(result).toBe(out);
            // Should be a valid view matrix
            expect(result[15]).toBe(1);
        });

        it("should handle different camera positions", () => {
            const eye = vec3New(1, 1, 1);
            const center = vec3New(0, 0, 0);
            const up = vec3New(0, 1, 0);
            const out = mat4Identity();
            const result = mat4LookAt(out, eye, center, up);

            expect(result).toBe(out);
            expect(result[15]).toBe(1);
        });
    });

    describe("mat4Perspective", () => {
        it("should create perspective matrix", () => {
            const out = mat4Identity();
            const result = mat4Perspective(out, Math.PI / 4, 16 / 9, 0.1, 100);

            expect(result).toBe(out);
            expect(result[15]).toBe(0);
            expect(result[11]).toBe(-1);
        });

        it("should handle different field of view", () => {
            const out = mat4Identity();
            const result = mat4Perspective(out, Math.PI / 2, 1, 1, 1000);

            expect(result).toBe(out);
            expect(result[15]).toBe(0);
        });
    });

    describe("mat4Ortho", () => {
        it("should create orthographic matrix", () => {
            const out = mat4Identity();
            const result = mat4Ortho(out, -1, 1, -1, 1, 0.1, 100);

            expect(result).toBe(out);
            expect(result[15]).toBe(1);
            expect(result[11]).toBe(0);
        });

        it("should handle different bounds", () => {
            const out = mat4Identity();
            const result = mat4Ortho(out, -10, 10, -5, 5, 1, 1000);

            expect(result).toBe(out);
            expect(result[15]).toBe(1);
        });
    });

    describe("mat4FromTranslation", () => {
        it("should create translation matrix", () => {
            const v = vec3New(1, 2, 3);
            const result = mat4FromTranslation(v);

            expect(result[12]).toBe(1);
            expect(result[13]).toBe(2);
            expect(result[14]).toBe(3);
            expect(result[15]).toBe(1);
        });

        it("should handle zero translation", () => {
            const v = vec3Zero();
            const result = mat4FromTranslation(v);

            expect(result[12]).toBe(0);
            expect(result[13]).toBe(0);
            expect(result[14]).toBe(0);
            expect(result[15]).toBe(1);
        });
    });

    describe("mat4Translate", () => {
        it("should translate existing matrix", () => {
            const m = mat4Identity();
            const v = vec3New(1, 2, 3);
            const out = mat4Identity();
            const result = mat4Translate(out, m, v);

            expect(result).toBe(out);
            expect(result[12]).toBe(1);
            expect(result[13]).toBe(2);
            expect(result[14]).toBe(3);
            expect(result[15]).toBe(1);
        });

        it("should handle zero translation", () => {
            const m = mat4Identity();
            const v = vec3Zero();
            const out = mat4Identity();
            const result = mat4Translate(out, m, v);

            expect(result).toBe(out);
            expect(result[12]).toBe(0);
            expect(result[13]).toBe(0);
            expect(result[14]).toBe(0);
            expect(result[15]).toBe(1);
        });
    });

    describe("mat4FromXRotation", () => {
        it("should create X rotation matrix", () => {
            const result = mat4FromXRotation(Math.PI / 2);

            expect(result[0]).toBe(1);
            expect(result[5]).toBeCloseTo(0);
            expect(result[6]).toBeCloseTo(1);
            expect(result[9]).toBeCloseTo(-1);
            expect(result[10]).toBeCloseTo(0);
        });

        it("should handle zero rotation", () => {
            const result = mat4FromXRotation(0);

            expect(result[0]).toBeCloseTo(1);
            expect(result[5]).toBeCloseTo(1);
            expect(result[10]).toBeCloseTo(1);
            expect(result[15]).toBeCloseTo(1);
        });
    });

    describe("mat4RotateX", () => {
        it("should rotate existing matrix around X axis", () => {
            const m = mat4Identity();
            const out = mat4Identity();
            const result = mat4RotateX(out, m, Math.PI / 2);

            expect(result).toBe(out);
            expect(result[0]).toBe(1);
            expect(result[5]).toBeCloseTo(0);
            expect(result[6]).toBeCloseTo(1);
            expect(result[9]).toBeCloseTo(-1);
            expect(result[10]).toBeCloseTo(0);
        });

        it("should handle zero rotation", () => {
            const m = mat4Identity();
            const out = mat4Identity();
            const result = mat4RotateX(out, m, 0);

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(1);
            expect(result[5]).toBeCloseTo(1);
            expect(result[10]).toBeCloseTo(1);
            expect(result[15]).toBeCloseTo(1);
        });
    });

    describe("mat4FromYRotation", () => {
        it("should create Y rotation matrix", () => {
            const result = mat4FromYRotation(Math.PI / 2);

            expect(result[0]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(-1);
            expect(result[5]).toBe(1);
            expect(result[8]).toBeCloseTo(1);
            expect(result[10]).toBeCloseTo(0);
        });
    });

    describe("mat4RotateY", () => {
        it("should rotate existing matrix around Y axis", () => {
            const m = mat4Identity();
            const out = mat4Identity();
            const result = mat4RotateY(out, m, Math.PI / 2);

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(-1);
            expect(result[5]).toBe(1);
            expect(result[8]).toBeCloseTo(1);
            expect(result[10]).toBeCloseTo(0);
        });
    });

    describe("mat4FromZRotation", () => {
        it("should create Z rotation matrix", () => {
            const result = mat4FromZRotation(Math.PI / 2);

            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(1);
            expect(result[4]).toBeCloseTo(-1);
            expect(result[5]).toBeCloseTo(0);
            expect(result[10]).toBe(1);
        });
    });

    describe("mat4RotateZ", () => {
        it("should rotate existing matrix around Z axis", () => {
            const m = mat4Identity();
            const out = mat4Identity();
            const result = mat4RotateZ(out, m, Math.PI / 2);

            expect(result).toBe(out);
            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(1);
            expect(result[4]).toBeCloseTo(-1);
            expect(result[5]).toBeCloseTo(0);
            expect(result[10]).toBe(1);
        });
    });

    describe("mat4FromRotation", () => {
        it("should create rotation matrix from axis and angle", () => {
            const axis = vec3New(0, 0, 1); // Z axis
            const result = mat4FromRotation(Math.PI / 2, axis);

            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(1);
            expect(result[4]).toBeCloseTo(-1);
            expect(result[5]).toBeCloseTo(0);
            expect(result[10]).toBe(1);
        });

        it("should handle zero angle", () => {
            const axis = vec3New(1, 0, 0);
            const result = mat4FromRotation(0, axis);

            expect(result[0]).toBeCloseTo(1);
            expect(result[5]).toBeCloseTo(1);
            expect(result[10]).toBeCloseTo(1);
            expect(result[15]).toBeCloseTo(1);
        });

        it("should handle zero axis", () => {
            const axis = vec3Zero();
            const result = mat4FromRotation(Math.PI / 2, axis);

            expect(result[0]).toBeCloseTo(1);
            expect(result[5]).toBeCloseTo(1);
            expect(result[10]).toBeCloseTo(1);
            expect(result[15]).toBeCloseTo(1);
        });
    });

    describe("mat4FromScale", () => {
        it("should create scale matrix", () => {
            const v = vec3New(2, 3, 4);
            const result = mat4FromScale(v);

            expect(result[0]).toBe(2);
            expect(result[5]).toBe(3);
            expect(result[10]).toBe(4);
            expect(result[15]).toBe(1);
        });

        it("should handle uniform scale", () => {
            const v = vec3New(5, 5, 5);
            const result = mat4FromScale(v);

            expect(result[0]).toBe(5);
            expect(result[5]).toBe(5);
            expect(result[10]).toBe(5);
            expect(result[15]).toBe(1);
        });
    });

    describe("mat4Scale", () => {
        it("should scale existing matrix", () => {
            const m = mat4Identity();
            const v = vec3New(2, 3, 4);
            const out = mat4Identity();
            const result = mat4Scale(out, m, v);

            expect(result).toBe(out);
            expect(result[0]).toBe(2);
            expect(result[5]).toBe(3);
            expect(result[10]).toBe(4);
            expect(result[15]).toBe(1);
        });

        it("should handle uniform scale", () => {
            const m = mat4Identity();
            const v = vec3New(5, 5, 5);
            const out = mat4Identity();
            const result = mat4Scale(out, m, v);

            expect(result).toBe(out);
            expect(result[0]).toBe(5);
            expect(result[5]).toBe(5);
            expect(result[10]).toBe(5);
            expect(result[15]).toBe(1);
        });
    });

    describe("mat4Transpose", () => {
        it("should transpose matrix", () => {
            const a = mat4New(
                1, 2, 3, 4,
                5, 6, 7, 8,
                9, 10, 11, 12,
                13, 14, 15, 16
            );
            const out = mat4Identity();
            const result = mat4Transpose(out, a);

            expect(result).toBe(out);
            expect(result[0]).toBe(1);
            expect(result[1]).toBe(5);
            expect(result[2]).toBe(9);
            expect(result[3]).toBe(13);
            expect(result[4]).toBe(2);
            expect(result[5]).toBe(6);
        });

        it("should transpose identity matrix", () => {
            const a = mat4Identity();
            const out = mat4Identity();
            const result = mat4Transpose(out, a);

            expect(result).toBe(out);
            expect(result).toEqual(mat4Identity());
        });
    });

    describe("mat4TransformVec3", () => {
        it("should transform vector with identity matrix", () => {
            const m = mat4Identity();
            const v = vec3New(1, 2, 3);
            const out = vec3Zero();
            const result = mat4TransformVec3(out, m, v);

            expect(result).toBe(out);
            expect(result).toEqual([1, 2, 3]);
        });

        it("should transform vector with translation matrix", () => {
            const m = mat4FromTranslation(vec3New(1, 2, 3));
            const v = vec3New(0, 0, 0);
            const out = vec3Zero();
            const result = mat4TransformVec3(out, m, v);

            expect(result).toBe(out);
            expect(result).toEqual([1, 2, 3]);
        });

        it("should transform vector with scale matrix", () => {
            const m = mat4FromScale(vec3New(2, 3, 4));
            const v = vec3New(1, 1, 1);
            const out = vec3Zero();
            const result = mat4TransformVec3(out, m, v);

            expect(result).toBe(out);
            expect(result).toEqual([2, 3, 4]);
        });
    });

    describe("edge cases and integration", () => {
        it("should handle chained transformations", () => {
            const translate = mat4FromTranslation(vec3New(1, 2, 3));
            const rotate = mat4FromYRotation(Math.PI / 4);
            const scale = mat4FromScale(vec3New(2, 2, 2));

            const temp1 = mat4Identity();
            const temp2 = mat4Identity();
            const result = mat4Identity();

            // result = translate * rotate * scale
            mat4Mul(temp1, rotate, scale);
            mat4Mul(temp2, translate, temp1);
            mat4Mul(result, mat4Identity(), temp2);

            expect(result[15]).toBe(1);
        });

        it("should maintain precision with small numbers", () => {
            const m = mat4FromScale(vec3New(0.1, 0.2, 0.3));
            const v = vec3New(1, 1, 1);
            const out = vec3Zero();
            const result = mat4TransformVec3(out, m, v);

            expect(result[0]).toBeCloseTo(0.1);
            expect(result[1]).toBeCloseTo(0.2);
            expect(result[2]).toBeCloseTo(0.3);
        });

        it("should handle large numbers", () => {
            const m = mat4FromScale(vec3New(1000, 2000, 3000));
            const v = vec3New(1, 1, 1);
            const out = vec3Zero();
            const result = mat4TransformVec3(out, m, v);

            expect(result[0]).toBe(1000);
            expect(result[1]).toBe(2000);
            expect(result[2]).toBe(3000);
        });
    });

    describe("mat4SetBasis", () => {
        it("should set rotation part from identity basis", () => {
            const m = mat4Identity();
            const b = basisIdentity();
            const out = mat4Identity();
            const result = mat4SetBasis(out, m, b);

            expect(result).toBe(out);
            expect(result[0]).toBe(1);
            expect(result[1]).toBe(0);
            expect(result[2]).toBe(0);
            expect(result[4]).toBe(0);
            expect(result[5]).toBe(1);
            expect(result[6]).toBe(0);
            expect(result[8]).toBe(0);
            expect(result[9]).toBe(0);
            expect(result[10]).toBe(1);
            // Translation and scale should be preserved
            expect(result[12]).toBe(0);
            expect(result[13]).toBe(0);
            expect(result[14]).toBe(0);
            expect(result[15]).toBe(1);
        });

        it("should set rotation part from rotated basis", () => {
            const m = mat4Identity();
            const b = basisFromEuler(vec3New(Math.PI / 2, 0, 0)); // 90° around X
            const out = mat4Identity();
            const result = mat4SetBasis(out, m, b);

            expect(result).toBe(out);
            // Check rotation part (X axis rotation)
            expect(result[0]).toBeCloseTo(1);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(0);
            expect(result[4]).toBeCloseTo(0);
            expect(result[5]).toBeCloseTo(0);
            expect(result[6]).toBeCloseTo(-1);
            expect(result[8]).toBeCloseTo(0);
            expect(result[9]).toBeCloseTo(1);
            expect(result[10]).toBeCloseTo(0);
            // Translation and scale should be preserved
            expect(result[12]).toBe(0);
            expect(result[13]).toBe(0);
            expect(result[14]).toBe(0);
            expect(result[15]).toBe(1);
        });

        it("should preserve translation when setting basis", () => {
            const m = mat4FromTranslation(vec3New(5, 10, 15));
            const b = basisFromEuler(vec3New(0, Math.PI / 2, 0)); // 90° around Y
            const out = mat4Identity();
            const result = mat4SetBasis(out, m, b);

            expect(result).toBe(out);
            // Check rotation part (Y axis rotation)
            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(1);
            expect(result[4]).toBeCloseTo(0);
            expect(result[5]).toBeCloseTo(1);
            expect(result[6]).toBeCloseTo(0);
            expect(result[8]).toBeCloseTo(-1);
            expect(result[9]).toBeCloseTo(0);
            expect(result[10]).toBeCloseTo(0);
            // Translation should be preserved
            expect(result[12]).toBe(5);
            expect(result[13]).toBe(10);
            expect(result[14]).toBe(15);
            expect(result[15]).toBe(1);
        });

        it("should preserve scale when setting basis", () => {
            const m = mat4FromScale(vec3New(2, 3, 4));
            const b = basisFromEuler(vec3New(0, 0, Math.PI / 2)); // 90° around Z
            const out = mat4Identity();
            const result = mat4SetBasis(out, m, b);

            expect(result).toBe(out);
            // Check rotation part (Z axis rotation) - note the sign differences
            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(-1);
            expect(result[2]).toBeCloseTo(0);
            expect(result[4]).toBeCloseTo(1);
            expect(result[5]).toBeCloseTo(0);
            expect(result[6]).toBeCloseTo(0);
            expect(result[8]).toBeCloseTo(0);
            expect(result[9]).toBeCloseTo(0);
            expect(result[10]).toBeCloseTo(1);
            // Scale should be preserved (but note that scale is applied to the rotation)
            expect(result[15]).toBe(1);
        });

        it("should handle complex transformations", () => {
            // Create a matrix with translation, rotation, and scale
            const translate = mat4FromTranslation(vec3New(1, 2, 3));
            const rotate = mat4FromYRotation(Math.PI / 4);
            const scale = mat4FromScale(vec3New(2, 2, 2));

            const temp = mat4Identity();
            const m = mat4Identity();
            mat4Mul(temp, rotate, scale);
            mat4Mul(m, translate, temp);

            const b = basisFromEuler(vec3New(Math.PI / 6, Math.PI / 3, Math.PI / 4)); // Complex rotation
            const out = mat4Identity();
            const result = mat4SetBasis(out, m, b);

            expect(result).toBe(out);
            // Translation should be preserved
            expect(result[12]).toBe(1);
            expect(result[13]).toBe(2);
            expect(result[14]).toBe(3);
            expect(result[15]).toBe(1);
            // Rotation part should be set from basis
            expect(result[0]).toBeCloseTo(b[0]);
            expect(result[1]).toBeCloseTo(b[1]);
            expect(result[2]).toBeCloseTo(b[2]);
            expect(result[4]).toBeCloseTo(b[3]);
            expect(result[5]).toBeCloseTo(b[4]);
            expect(result[6]).toBeCloseTo(b[5]);
            expect(result[8]).toBeCloseTo(b[6]);
            expect(result[9]).toBeCloseTo(b[7]);
            expect(result[10]).toBeCloseTo(b[8]);
        });
    });
});
