import { describe, it, expect } from "bun:test";
import { mat3, mat3Determinant, mat3FromMat4, mat3FromRotation, mat3FromScaling, mat3FromTranslation, mat3Identity, mat3Invert, mat3Mul, mat3NormalFromMat4, mat3Rotate, mat3Scale, mat3TransformVec2, mat3Transpose, mat3Translate } from "./mat3";
import { vec2 } from "./vec2";
import { mat4, mat4FromZRotation } from "./mat4";

function expectMat3CloseTo(a: mat3, b: mat3, tol = 1e-6) {
    for (let i = 0; i < 9; i++) {
        expect(a[i]).toBeCloseTo(b[i], -Math.log10(tol));
    }
}

describe("mat3", () => {
    it("identity should set to identity", () => {
        const out = [0, 0, 0, 0, 0, 0, 0, 0, 0] as mat3;
        mat3Identity(out);
        expect(out).toEqual([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ]);
    });

    it("multiply should compose transforms (R * T)", () => {
        const r = mat3FromRotation(Math.PI / 2);
        const t = mat3FromTranslation([2, 3]);
        const out = [0, 0, 0, 0, 0, 0, 0, 0, 0] as mat3;
        mat3Mul(out, r, t);
        // Expected: rotation 90°, then translation applied in rotated basis
        // r = [ c s 0; -s c 0; 0 0 1 ], c=0,s=1
        // t = [1 0 0; 0 1 0; 2 3 1]
        // out = r * t = [0 1 0; -1 0 0; 2 3 1] with rotated basis affecting translation: new last column = r * [2,3,1]
        // Compute explicitly
        const expected = [
            0, 1, 0,
            -1, 0, 0,
            2 * 0 + 3 * (-1) + 0 * 1,  // = -3
            2 * 1 + 3 * 0 + 0 * 1,      // = 2
            1,
        ];
        // expected flattened column-major (manually compute):
        const exp = [
            0, 1, 0,
            -1, 0, 0,
            -3, 2, 1,
        ] as mat3;
        expectMat3CloseTo(out, exp);
    });

    it("determinant should match product of scales", () => {
        const s = mat3FromScaling([2, 3]);
        expect(mat3Determinant(s)).toBeCloseTo(2 * 3 * 1);
        expect(mat3Determinant(mat3Identity())).toBeCloseTo(1);
    });

    it("invert should invert scaling", () => {
        const s = mat3FromScaling([2, 3]);
        const inv = [0, 0, 0, 0, 0, 0, 0, 0, 0] as mat3;
        const ret = mat3Invert(inv, s);
        expect(ret).not.toBeNull();
        expect(ret as mat3).toEqual([
            1 / 2, 0, 0,
            0, 1 / 3, 0,
            0, 0, 1,
        ]);
    });

    it("transpose equals inverse for pure rotation", () => {
        const r = mat3FromRotation(Math.PI / 4);
        const rt = [0, 0, 0, 0, 0, 0, 0, 0, 0] as mat3;
        const ri = [0, 0, 0, 0, 0, 0, 0, 0, 0] as mat3;
        mat3Transpose(rt, r);
        const inv = mat3Invert(ri, r);
        expect(inv).not.toBeNull();
        expectMat3CloseTo(rt, ri, 1e-6);
    });

    it("fromMat4 should extract upper-left 3x3", () => {
        const m4 = mat4FromZRotation(Math.PI / 3);
        const m3 = [0, 0, 0, 0, 0, 0, 0, 0, 0] as mat3;
        mat3FromMat4(m3, m4 as mat4);
        const c = Math.cos(Math.PI / 3);
        const s = Math.sin(Math.PI / 3);
        const expected = [
            c, s, 0,
            -s, c, 0,
            0, 0, 1,
        ] as mat3;
        expectMat3CloseTo(m3, expected);
    });

    it("normalFromMat4 should equal inverse-transpose of extracted 3x3", () => {
        // Build mat4 = Rz(θ) then non-uniform scale on axes by embedding into mat4
        const theta = Math.PI / 5;
        const rz = mat4FromZRotation(theta);
        // Apply non-uniform scale by scaling rows/cols of upper-left 3x3
        const m = rz.slice() as mat4;
        m[0] *= 2; m[1] *= 2; m[2] *= 2;   // scale x by 2
        m[4] *= 3; m[5] *= 3; m[6] *= 3;   // scale y by 3
        m[8] *= 1; m[9] *= 1; m[10] *= 1;  // scale z by 1

        const n = [0, 0, 0, 0, 0, 0, 0, 0, 0] as mat3;
        const res = mat3NormalFromMat4(n, m as mat4);
        expect(res).not.toBeNull();

        const a = [0, 0, 0, 0, 0, 0, 0, 0, 0] as mat3;
        mat3FromMat4(a, m as mat4);
        const inv = [0, 0, 0, 0, 0, 0, 0, 0, 0] as mat3;
        const tr = [0, 0, 0, 0, 0, 0, 0, 0, 0] as mat3;
        const invOk = mat3Invert(inv, a);
        expect(invOk).not.toBeNull();
        mat3Transpose(tr, inv);
        expectMat3CloseTo(n, tr);
    });

    it("2D translate/rotate/scale and transform vec2", () => {
        // Start with identity
        const i = mat3Identity();
        // Rotate 90°
        const r = [0, 0, 0, 0, 0, 0, 0, 0, 0] as mat3;
        mat3Rotate(r, i, Math.PI / 2);
        // Scale by (2,3)
        const rs = [0, 0, 0, 0, 0, 0, 0, 0, 0] as mat3;
        mat3Scale(rs, r, [2, 3]);
        // Translate by (5, -1)
        const rst = [0, 0, 0, 0, 0, 0, 0, 0, 0] as mat3;
        mat3Translate(rst, rs, [5, -1]);

        const v = [1, 0] as vec2;
        const out = [0, 0] as vec2;
        mat3TransformVec2(out, rst, v);
        // Post-multiply semantics: T -> S -> R applied to vector => (3, 12)
        expect(out[0]).toBeCloseTo(3);
        expect(out[1]).toBeCloseTo(12);
    });
});
