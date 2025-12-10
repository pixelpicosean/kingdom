import { vec3 } from './vec3';
import { EPSILON } from './utils';

// Forward declaration for basis type
type basis = [
    number, number, number,  // x axis
    number, number, number,  // y axis
    number, number, number,  // z axis
];

/**
 * 4x4 Matrix type (column-major order)
 */
export type mat4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
];

/**
 * Creates a new Mat4 with the given values
 */
export function mat4New(
    m00: number, m01: number, m02: number, m03: number,
    m10: number, m11: number, m12: number, m13: number,
    m20: number, m21: number, m22: number, m23: number,
    m30: number, m31: number, m32: number, m33: number
): mat4 {
    return [
        m00, m01, m02, m03,
        m10, m11, m12, m13,
        m20, m21, m22, m23,
        m30, m31, m32, m33
    ];
}

/**
 * Creates an identity matrix
 */
export function mat4Identity(out: mat4 = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
]): mat4 {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
}

/**
 * Multiplies two matrices
 */
export function mat4Mul(out: mat4, a: mat4, b: mat4): mat4 {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    let a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    let a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    let a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];
    // Cache only the current line of the second matrix
    let b0 = b[0],
        b1 = b[1],
        b2 = b[2],
        b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[4];
    b1 = b[5];
    b2 = b[6];
    b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[8];
    b1 = b[9];
    b2 = b[10];
    b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[12];
    b1 = b[13];
    b2 = b[14];
    b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
}

/**
 * Creates a look-at matrix
 */
export function mat4LookAt(out: mat4, eye: vec3, center: vec3, up: vec3): mat4 {
    let x0: number, x1: number, x2: number;
    let y0: number, y1: number, y2: number;
    let z0: number, z1: number, z2: number;
    let len: number;
    let eyex = eye[0];
    let eyey = eye[1];
    let eyez = eye[2];
    let upx = up[0];
    let upy = up[1];
    let upz = up[2];
    let centerx = center[0];
    let centery = center[1];
    let centerz = center[2];
    if (
        Math.abs(eyex - centerx) < EPSILON &&
        Math.abs(eyey - centery) < EPSILON &&
        Math.abs(eyez - centerz) < EPSILON
    ) {
        return mat4Identity(out);
    }
    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;
    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;
    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }
    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;
    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }
    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;
    return out;
}

/**
 * Creates a perspective projection matrix
 */
export function mat4Perspective(out: mat4, fovy: number, aspect: number, near: number, far: number): mat4 {
    const f = 1.0 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);

    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;

    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;

    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;

    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;

    return out;
}

/**
 * Creates an orthographic projection matrix
 */
export function mat4Ortho(out: mat4, left: number, right: number, bottom: number, top: number, near: number, far: number): mat4 {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);

    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;

    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;

    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;

    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;

    return out;
}

/**
 * Creates a translation matrix
 */
export function mat4FromTranslation(v: vec3): mat4 {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        v[0], v[1], v[2], 1,
    ];
}

/**
 * Translates a matrix by the given vector
 */
export function mat4Translate(out: mat4, m: mat4, v: vec3): mat4 {
    let x = v[0],
        y = v[1],
        z = v[2];
    let a00: number, a01: number, a02: number, a03: number;
    let a10: number, a11: number, a12: number, a13: number;
    let a20: number, a21: number, a22: number, a23: number;
    if (m === out) {
        out[12] = m[0] * x + m[4] * y + m[8] * z + m[12];
        out[13] = m[1] * x + m[5] * y + m[9] * z + m[13];
        out[14] = m[2] * x + m[6] * y + m[10] * z + m[14];
        out[15] = m[3] * x + m[7] * y + m[11] * z + m[15];
    } else {
        a00 = m[0];
        a01 = m[1];
        a02 = m[2];
        a03 = m[3];
        a10 = m[4];
        a11 = m[5];
        a12 = m[6];
        a13 = m[7];
        a20 = m[8];
        a21 = m[9];
        a22 = m[10];
        a23 = m[11];
        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a03;
        out[4] = a10;
        out[5] = a11;
        out[6] = a12;
        out[7] = a13;
        out[8] = a20;
        out[9] = a21;
        out[10] = a22;
        out[11] = a23;
        out[12] = a00 * x + a10 * y + a20 * z + m[12];
        out[13] = a01 * x + a11 * y + a21 * z + m[13];
        out[14] = a02 * x + a12 * y + a22 * z + m[14];
        out[15] = a03 * x + a13 * y + a23 * z + m[15];
    }
    return out;
}

/**
 * Creates a rotation matrix around X axis
 */
export function mat4FromXRotation(angle: number): mat4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
    ];
}

/**
 * Rotates a matrix around the X axis
 */
export function mat4RotateX(out: mat4, m: mat4, rad: number): mat4 {
    let s = Math.sin(rad);
    let c = Math.cos(rad);
    let a10 = m[4];
    let a11 = m[5];
    let a12 = m[6];
    let a13 = m[7];
    let a20 = m[8];
    let a21 = m[9];
    let a22 = m[10];
    let a23 = m[11];
    if (m !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[0] = m[0];
        out[1] = m[1];
        out[2] = m[2];
        out[3] = m[3];
        out[12] = m[12];
        out[13] = m[13];
        out[14] = m[14];
        out[15] = m[15];
    }
    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
}

/**
 * Creates a rotation matrix around Y axis
 */
export function mat4FromYRotation(angle: number): mat4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
    ];
}

/**
 * Rotates a matrix around the Y axis
 */
export function mat4RotateY(out: mat4, m: mat4, rad: number): mat4 {
    let s = Math.sin(rad);
    let c = Math.cos(rad);
    let a00 = m[0];
    let a01 = m[1];
    let a02 = m[2];
    let a03 = m[3];
    let a20 = m[8];
    let a21 = m[9];
    let a22 = m[10];
    let a23 = m[11];
    if (m !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[4] = m[4];
        out[5] = m[5];
        out[6] = m[6];
        out[7] = m[7];
        out[12] = m[12];
        out[13] = m[13];
        out[14] = m[14];
        out[15] = m[15];
    }
    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
}

/**
 * Creates a rotation matrix around Z axis
 */
export function mat4FromZRotation(angle: number): mat4 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    return [
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}

/**
 * Rotates a matrix around the Z axis
 */
export function mat4RotateZ(out: mat4, m: mat4, rad: number): mat4 {
    let s = Math.sin(rad);
    let c = Math.cos(rad);
    let a00 = m[0];
    let a01 = m[1];
    let a02 = m[2];
    let a03 = m[3];
    let a10 = m[4];
    let a11 = m[5];
    let a12 = m[6];
    let a13 = m[7];
    if (m !== out) {
        // If the source and destination differ, copy the unchanged last row
        out[8] = m[8];
        out[9] = m[9];
        out[10] = m[10];
        out[11] = m[11];
        out[12] = m[12];
        out[13] = m[13];
        out[14] = m[14];
        out[15] = m[15];
    }
    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
}

/**
 * Creates a matrix from a given angle around a given axis.
 */
export function mat4FromRotation(rad: number, axis: vec3): mat4 {
    const out = mat4Identity();
    let x = axis[0],
        y = axis[1],
        z = axis[2];
    let len = Math.sqrt(x * x + y * y + z * z);
    let s: number, c: number, t: number;
    if (len < EPSILON) {
        return out;
    }
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;
    // Perform rotation-specific matrix multiplication
    out[0] = x * x * t + c;
    out[1] = y * x * t + z * s;
    out[2] = z * x * t - y * s;
    out[3] = 0;
    out[4] = x * y * t - z * s;
    out[5] = y * y * t + c;
    out[6] = z * y * t + x * s;
    out[7] = 0;
    out[8] = x * z * t + y * s;
    out[9] = y * z * t - x * s;
    out[10] = z * z * t + c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
}

/**
 * Creates a scale matrix
 */
export function mat4FromScale(v: vec3): mat4 {
    return [
        v[0], 0, 0, 0,
        0, v[1], 0, 0,
        0, 0, v[2], 0,
        0, 0, 0, 1,
    ];
}

/**
 * Scales a matrix by the given vector
 */
export function mat4Scale(out: mat4, m: mat4, v: vec3): mat4 {
    const x = v[0];
    const y = v[1];
    const z = v[2];

    out[0] = m[0] * x;
    out[1] = m[1] * x;
    out[2] = m[2] * x;
    out[3] = m[3] * x;

    out[4] = m[4] * y;
    out[5] = m[5] * y;
    out[6] = m[6] * y;
    out[7] = m[7] * y;

    out[8] = m[8] * z;
    out[9] = m[9] * z;
    out[10] = m[10] * z;
    out[11] = m[11] * z;

    out[12] = m[12];
    out[13] = m[13];
    out[14] = m[14];
    out[15] = m[15];

    return out;
}

/**
 * Transposes a matrix
 */
export function mat4Transpose(out: mat4, a: mat4): mat4 {
    if (out === a) {
        const a01 = a[1], a02 = a[2], a03 = a[3];
        const a12 = a[6], a13 = a[7];
        const a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }

    return out;
}

/**
 * Multiplies a vector by a matrix
 */
export function mat4TransformVec3(out: vec3, m: mat4, v: vec3): vec3 {
    const x = v[0], y = v[1], z = v[2];
    const w = m[3] * x + m[7] * y + m[11] * z + m[15];

    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14];

    if (w !== 0) {
        out[0] /= w;
        out[1] /= w;
        out[2] /= w;
    }

    return out;
}

/**
 * Sets the rotation part of a 4x4 matrix from a 3x3 basis matrix
 * Preserves the translation and scale components of the matrix
 */
export function mat4SetBasis(out: mat4, m: mat4, b: basis): mat4 {
    // Set the rotation part from the basis matrix
    // Basis matrix is stored as [x0, x1, x2, y0, y1, y2, z0, z1, z2]
    // Mat4 is stored in column-major order
    out[0] = b[0];  // x0 -> m[0]
    out[1] = b[1];  // x1 -> m[1]
    out[2] = b[2];  // x2 -> m[2]
    out[4] = b[3];  // y0 -> m[4]
    out[5] = b[4];  // y1 -> m[5]
    out[6] = b[5];  // y2 -> m[6]
    out[8] = b[6];  // z0 -> m[8]
    out[9] = b[7];  // z1 -> m[9]
    out[10] = b[8]; // z2 -> m[10]

    // Copy the rest from matrix
    out[3] = m[3];
    out[7] = m[7];
    out[11] = m[11];
    out[12] = m[12];
    out[13] = m[13];
    out[14] = m[14];
    out[15] = m[15];

    return out;
}
