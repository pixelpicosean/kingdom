import type { vec2 } from './vec2';
import type { mat4 } from './mat4';
import { EPSILON } from './utils';

/**
 * 3x3 Matrix type (column-major order)
 */
export type mat3 = [
    number, number, number,
    number, number, number,
    number, number, number,
];

/**
 * Creates a new Mat3 with the given values
 */
export function mat3New(
    m00: number, m01: number, m02: number,
    m10: number, m11: number, m12: number,
    m20: number, m21: number, m22: number,
): mat3 {
    return [
        m00, m01, m02,
        m10, m11, m12,
        m20, m21, m22,
    ];
}

/**
 * Creates an identity matrix
 */
export function mat3Identity(out: mat3 = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1,
]): mat3 {
    out[0] = 1; out[1] = 0; out[2] = 0;
    out[3] = 0; out[4] = 1; out[5] = 0;
    out[6] = 0; out[7] = 0; out[8] = 1;
    return out;
}

/**
 * Multiplies two 3x3 matrices: out = a * b
 */
export function mat3Mul(out: mat3, a: mat3, b: mat3): mat3 {
    const a00 = a[0], a01 = a[1], a02 = a[2];
    const a10 = a[3], a11 = a[4], a12 = a[5];
    const a20 = a[6], a21 = a[7], a22 = a[8];

    let b0 = b[0], b1 = b[1], b2 = b[2];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22;

    b0 = b[3]; b1 = b[4]; b2 = b[5];
    out[3] = b0 * a00 + b1 * a10 + b2 * a20;
    out[4] = b0 * a01 + b1 * a11 + b2 * a21;
    out[5] = b0 * a02 + b1 * a12 + b2 * a22;

    b0 = b[6]; b1 = b[7]; b2 = b[8];
    out[6] = b0 * a00 + b1 * a10 + b2 * a20;
    out[7] = b0 * a01 + b1 * a11 + b2 * a21;
    out[8] = b0 * a02 + b1 * a12 + b2 * a22;

    return out;
}

/**
 * Transposes a 3x3 matrix
 */
export function mat3Transpose(out: mat3, a: mat3): mat3 {
    if (out === a) {
        const a01 = a[1], a02 = a[2];
        const a12 = a[5];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a01;
        out[5] = a[7];
        out[6] = a02;
        out[7] = a12;
    } else {
        out[0] = a[0];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a[1];
        out[4] = a[4];
        out[5] = a[7];
        out[6] = a[2];
        out[7] = a[5];
        out[8] = a[8];
    }
    return out;
}

/**
 * Computes the determinant of a 3x3 matrix
 */
export function mat3Determinant(a: mat3): number {
    const a00 = a[0], a01 = a[1], a02 = a[2];
    const a10 = a[3], a11 = a[4], a12 = a[5];
    const a20 = a[6], a21 = a[7], a22 = a[8];
    return a00 * (a11 * a22 - a12 * a21)
        - a01 * (a10 * a22 - a12 * a20)
        + a02 * (a10 * a21 - a11 * a20);
}

/**
 * Inverts a 3x3 matrix. Returns null if non-invertible.
 */
export function mat3Invert(out: mat3, a: mat3): mat3 | null {
    const a00 = a[0], a01 = a[1], a02 = a[2];
    const a10 = a[3], a11 = a[4], a12 = a[5];
    const a20 = a[6], a21 = a[7], a22 = a[8];

    const b01 = a22 * a11 - a12 * a21;
    const b11 = -a22 * a10 + a12 * a20;
    const b21 = a21 * a10 - a11 * a20;

    let det = a00 * b01 + a01 * b11 + a02 * b21;
    if (Math.abs(det) < EPSILON) {
        return null;
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
}

/**
 * Extracts the upper-left 3x3 from a 4x4 matrix
 */
export function mat3FromMat4(out: mat3, m: mat4): mat3 {
    out[0] = m[0]; out[1] = m[1]; out[2] = m[2];
    out[3] = m[4]; out[4] = m[5]; out[5] = m[6];
    out[6] = m[8]; out[7] = m[9]; out[8] = m[10];
    return out;
}

/**
 * Computes the normal matrix (inverse-transpose of upper-left 3x3 of mat4)
 */
export function mat3NormalFromMat4(out: mat3, m: mat4): mat3 | null {
    // Extract 3x3
    const a00 = m[0], a01 = m[1], a02 = m[2];
    const a10 = m[4], a11 = m[5], a12 = m[6];
    const a20 = m[8], a21 = m[9], a22 = m[10];

    const b01 = a22 * a11 - a12 * a21;
    const b11 = -a22 * a10 + a12 * a20;
    const b21 = a21 * a10 - a11 * a20;

    let det = a00 * b01 + a01 * b11 + a02 * b21;
    if (Math.abs(det) < EPSILON) {
        return null;
    }
    det = 1.0 / det;

    // Inverse
    const i00 = b01 * det;
    const i01 = (-a22 * a01 + a02 * a21) * det;
    const i02 = (a12 * a01 - a02 * a11) * det;
    const i10 = b11 * det;
    const i11 = (a22 * a00 - a02 * a20) * det;
    const i12 = (-a12 * a00 + a02 * a10) * det;
    const i20 = b21 * det;
    const i21 = (-a21 * a00 + a01 * a20) * det;
    const i22 = (a11 * a00 - a01 * a10) * det;

    // Transpose of inverse
    out[0] = i00; out[1] = i10; out[2] = i20;
    out[3] = i01; out[4] = i11; out[5] = i21;
    out[6] = i02; out[7] = i12; out[8] = i22;
    return out;
}

/**
 * Creates a 2D translation matrix
 */
export function mat3FromTranslation(v: vec2): mat3 {
    return [
        1, 0, 0,
        0, 1, 0,
        v[0], v[1], 1,
    ];
}

/**
 * Applies a 2D translation: out = a * T
 */
export function mat3Translate(out: mat3, a: mat3, v: vec2): mat3 {
    const x = v[0], y = v[1];
    const a00 = a[0], a01 = a[1], a02 = a[2];
    const a10 = a[3], a11 = a[4], a12 = a[5];
    const a20 = a[6], a21 = a[7], a22 = a[8];

    if (out !== a) {
        out[0] = a00; out[1] = a01; out[2] = a02;
        out[3] = a10; out[4] = a11; out[5] = a12;
        out[6] = a20; out[7] = a21; out[8] = a22;
    }
    out[6] = x * a00 + y * a10 + a20;
    out[7] = x * a01 + y * a11 + a21;
    out[8] = x * a02 + y * a12 + a22;
    return out;
}

/**
 * Creates a 2D rotation matrix (around Z axis)
 */
export function mat3FromRotation(rad: number): mat3 {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return [
        c, s, 0,
        -s, c, 0,
        0, 0, 1,
    ];
}

/**
 * Applies a 2D rotation: out = a * R
 */
export function mat3Rotate(out: mat3, a: mat3, rad: number): mat3 {
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    const a00 = a[0], a01 = a[1], a02 = a[2];
    const a10 = a[3], a11 = a[4], a12 = a[5];
    const a20 = a[6], a21 = a[7], a22 = a[8];

    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;
    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;
    out[6] = a20;
    out[7] = a21;
    out[8] = a22;
    return out;
}

/**
 * Creates a 2D scaling matrix
 */
export function mat3FromScaling(v: vec2): mat3 {
    return [
        v[0], 0, 0,
        0, v[1], 0,
        0, 0, 1,
    ];
}

/**
 * Applies a 2D scale: out = a * S
 */
export function mat3Scale(out: mat3, a: mat3, v: vec2): mat3 {
    const x = v[0], y = v[1];
    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * y;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
}

/**
 * Transforms a vec2 by a mat3 (affine 2D transform)
 */
export function mat3TransformVec2(out: vec2, m: mat3, v: vec2): vec2 {
    const x = v[0], y = v[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
}


