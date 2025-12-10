import { vec3, vec3Normalize, vec3Dot, vec3Cross } from './vec3';
import { EPSILON, degToRad, radToDeg } from './utils';

/**
 * 3x3 Basis type (Godot-like rotation matrix)
 * Represents a 3D rotation as three orthogonal vectors (x, y, z axes)
 */
export type basis = [
    number, number, number,  // x axis
    number, number, number,  // y axis
    number, number, number,  // z axis
];

/**
 * Creates a new Basis with the given axis vectors
 */
export function basisNew(
    x0: number, x1: number, x2: number,
    y0: number, y1: number, y2: number,
    z0: number, z1: number, z2: number
): basis {
    return [x0, x1, x2, y0, y1, y2, z0, z1, z2];
}

/**
 * Creates an identity basis (no rotation)
 */
export function basisIdentity(out: basis = [1, 0, 0, 0, 1, 0, 0, 0, 1]): basis {
    out[0] = 1; out[1] = 0; out[2] = 0;  // x axis
    out[3] = 0; out[4] = 1; out[5] = 0;  // y axis
    out[6] = 0; out[7] = 0; out[8] = 1;  // z axis
    return out;
}

/**
 * Creates a basis from three axis vectors
 */
export function basisFromAxes(xAxis: vec3, yAxis: vec3, zAxis: vec3): basis {
    return [
        xAxis[0], xAxis[1], xAxis[2],
        yAxis[0], yAxis[1], yAxis[2],
        zAxis[0], zAxis[1], zAxis[2]
    ];
}

/**
 * Creates a basis from Euler angles (in radians)
 * Order: ZYX (yaw, pitch, roll)
 */
export function basisFromEuler(euler: vec3): basis {
    const cx = Math.cos(euler[0]); // pitch
    const sx = Math.sin(euler[0]);
    const cy = Math.cos(euler[1]); // yaw
    const sy = Math.sin(euler[1]);
    const cz = Math.cos(euler[2]); // roll
    const sz = Math.sin(euler[2]);

    return [
        cy * cz, -cy * sz, sy,
        sx * sy * cz + cx * sz, -sx * sy * sz + cx * cz, -sx * cy,
        -cx * sy * cz + sx * sz, cx * sy * sz + sx * cz, cx * cy
    ];
}

/**
 * Creates a basis from Euler angles in degrees
 */
export function basisFromEulerDeg(eulerDeg: vec3): basis {
    return basisFromEuler([degToRad(eulerDeg[0]), degToRad(eulerDeg[1]), degToRad(eulerDeg[2])]);
}

/**
 * Creates a basis from a quaternion
 */
export function basisFromQuat(q: quat): basis {
    const x = q[0], y = q[1], z = q[2], w = q[3];

    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2;
    const xy = x * y2;
    const xz = x * z2;
    const yy = y * y2;
    const yz = y * z2;
    const zz = z * z2;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;

    return [
        1 - (yy + zz), xy + wz, xz - wy,
        xy - wz, 1 - (xx + zz), yz + wx,
        xz + wy, yz - wx, 1 - (xx + yy)
    ];
}

/**
 * Creates a basis from axis-angle rotation
 */
export function basisFromAxisAngle(axis: vec3, angle: number): basis {
    const normalizedAxis = vec3Normalize([0, 0, 0], axis);
    const x = normalizedAxis[0];
    const y = normalizedAxis[1];
    const z = normalizedAxis[2];

    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;

    return [
        x * x * t + c, y * x * t + z * s, z * x * t - y * s,
        x * y * t - z * s, y * y * t + c, z * y * t + x * s,
        x * z * t + y * s, y * z * t - x * s, z * z * t + c
    ];
}

/**
 * Multiplies two basis matrices
 */
export function basisMul(out: basis, a: basis, b: basis): basis {
    const a00 = a[0], a01 = a[1], a02 = a[2];
    const a10 = a[3], a11 = a[4], a12 = a[5];
    const a20 = a[6], a21 = a[7], a22 = a[8];

    const b00 = b[0], b01 = b[1], b02 = b[2];
    const b10 = b[3], b11 = b[4], b12 = b[5];
    const b20 = b[6], b21 = b[7], b22 = b[8];

    out[0] = a00 * b00 + a01 * b10 + a02 * b20;
    out[1] = a00 * b01 + a01 * b11 + a02 * b21;
    out[2] = a00 * b02 + a01 * b12 + a02 * b22;

    out[3] = a10 * b00 + a11 * b10 + a12 * b20;
    out[4] = a10 * b01 + a11 * b11 + a12 * b21;
    out[5] = a10 * b02 + a11 * b12 + a12 * b22;

    out[6] = a20 * b00 + a21 * b10 + a22 * b20;
    out[7] = a20 * b01 + a21 * b11 + a22 * b21;
    out[8] = a20 * b02 + a21 * b12 + a22 * b22;

    return out;
}

/**
 * Transposes a basis matrix
 */
export function basisTranspose(out: basis, b: basis): basis {
    if (out === b) {
        const b01 = b[1], b02 = b[2], b12 = b[5];
        out[1] = b[3];
        out[2] = b[6];
        out[3] = b01;
        out[5] = b[7];
        out[6] = b02;
        out[7] = b12;
    } else {
        out[0] = b[0];
        out[1] = b[3];
        out[2] = b[6];
        out[3] = b[1];
        out[4] = b[4];
        out[5] = b[7];
        out[6] = b[2];
        out[7] = b[5];
        out[8] = b[8];
    }
    return out;
}

/**
 * Calculates the determinant of a basis matrix
 */
export function basisDeterminant(b: basis): number {
    return b[0] * (b[4] * b[8] - b[5] * b[7]) -
        b[1] * (b[3] * b[8] - b[5] * b[6]) +
        b[2] * (b[3] * b[7] - b[4] * b[6]);
}

/**
 * Calculates the inverse of a basis matrix
 */
export function basisInverse(out: basis, b: basis): basis {
    const det = basisDeterminant(b);

    if (Math.abs(det) < EPSILON) {
        // Singular matrix, return identity
        return basisIdentity(out);
    }

    const invDet = 1.0 / det;

    out[0] = (b[4] * b[8] - b[5] * b[7]) * invDet;
    out[1] = (b[2] * b[7] - b[1] * b[8]) * invDet;
    out[2] = (b[1] * b[5] - b[2] * b[4]) * invDet;

    out[3] = (b[5] * b[6] - b[3] * b[8]) * invDet;
    out[4] = (b[0] * b[8] - b[2] * b[6]) * invDet;
    out[5] = (b[2] * b[3] - b[0] * b[5]) * invDet;

    out[6] = (b[3] * b[7] - b[4] * b[6]) * invDet;
    out[7] = (b[1] * b[6] - b[0] * b[7]) * invDet;
    out[8] = (b[0] * b[4] - b[1] * b[3]) * invDet;

    return out;
}

/**
 * Rotates a vector by the basis matrix
 */
export function basisRotateVec3(out: vec3, b: basis, v: vec3): vec3 {
    out[0] = b[0] * v[0] + b[1] * v[1] + b[2] * v[2];
    out[1] = b[3] * v[0] + b[4] * v[1] + b[5] * v[2];
    out[2] = b[6] * v[0] + b[7] * v[1] + b[8] * v[2];
    return out;
}

/**
 * Gets the X axis vector from a basis
 */
export function basisGetXAxis(b: basis): vec3 {
    return [b[0], b[1], b[2]];
}

/**
 * Gets the Y axis vector from a basis
 */
export function basisGetYAxis(b: basis): vec3 {
    return [b[3], b[4], b[5]];
}

/**
 * Gets the Z axis vector from a basis
 */
export function basisGetZAxis(b: basis): vec3 {
    return [b[6], b[7], b[8]];
}

/**
 * Sets the X axis vector of a basis
 */
export function basisSetXAxis(out: basis, b: basis, xAxis: vec3): basis {
    out[0] = xAxis[0];
    out[1] = xAxis[1];
    out[2] = xAxis[2];
    out[3] = b[3];
    out[4] = b[4];
    out[5] = b[5];
    out[6] = b[6];
    out[7] = b[7];
    out[8] = b[8];
    return out;
}

/**
 * Sets the Y axis vector of a basis
 */
export function basisSetYAxis(out: basis, b: basis, yAxis: vec3): basis {
    out[0] = b[0];
    out[1] = b[1];
    out[2] = b[2];
    out[3] = yAxis[0];
    out[4] = yAxis[1];
    out[5] = yAxis[2];
    out[6] = b[6];
    out[7] = b[7];
    out[8] = b[8];
    return out;
}

/**
 * Sets the Z axis vector of a basis
 */
export function basisSetZAxis(out: basis, b: basis, zAxis: vec3): basis {
    out[0] = b[0];
    out[1] = b[1];
    out[2] = b[2];
    out[3] = b[3];
    out[4] = b[4];
    out[5] = b[5];
    out[6] = zAxis[0];
    out[7] = zAxis[1];
    out[8] = zAxis[2];
    return out;
}

/**
 * Converts a basis to Euler angles (in radians)
 * Returns [pitch, yaw, roll] in ZYX order
 */
export function basisToEuler(b: basis): vec3 {
    const m00 = b[0], m01 = b[1], m02 = b[2];
    const m10 = b[3], m11 = b[4], m12 = b[5];
    const m20 = b[6], m21 = b[7], m22 = b[8];

    let pitch, yaw, roll;

    // Handle gimbal lock case
    if (Math.abs(m02) >= 1) {
        roll = 0;
        if (m02 > 0) {
            pitch = Math.PI / 2;
            yaw = roll + Math.atan2(m10, m20);
        } else {
            pitch = -Math.PI / 2;
            yaw = -roll + Math.atan2(-m10, -m20);
        }
    } else {
        pitch = -Math.asin(m02);
        yaw = Math.atan2(m01 / Math.cos(pitch), m00 / Math.cos(pitch));
        roll = Math.atan2(m12 / Math.cos(pitch), m22 / Math.cos(pitch));
    }

    return [pitch, yaw, roll];
}

/**
 * Converts a basis to Euler angles in degrees
 */
export function basisToEulerDeg(b: basis): vec3 {
    const euler = basisToEuler(b);
    return [radToDeg(euler[0]), radToDeg(euler[1]), radToDeg(euler[2])];
}

/**
 * Converts a basis to a quaternion
 */
export function basisToQuat(b: basis): quat {
    const trace = b[0] + b[4] + b[8];

    if (trace > 0) {
        const s = Math.sqrt(trace + 1.0) * 2;
        return [
            (b[7] - b[5]) / s,
            (b[2] - b[6]) / s,
            (b[3] - b[1]) / s,
            0.25 * s
        ];
    } else if (b[0] > b[4] && b[0] > b[8]) {
        const s = Math.sqrt(1.0 + b[0] - b[4] - b[8]) * 2;
        return [
            0.25 * s,
            (b[1] + b[3]) / s,
            (b[2] + b[6]) / s,
            (b[7] - b[5]) / s
        ];
    } else if (b[4] > b[8]) {
        const s = Math.sqrt(1.0 + b[4] - b[0] - b[8]) * 2;
        return [
            (b[1] + b[3]) / s,
            0.25 * s,
            (b[5] + b[7]) / s,
            (b[2] - b[6]) / s
        ];
    } else {
        const s = Math.sqrt(1.0 + b[8] - b[0] - b[4]) * 2;
        return [
            (b[2] + b[6]) / s,
            (b[5] + b[7]) / s,
            0.25 * s,
            (b[3] - b[1]) / s
        ];
    }
}

/**
 * Orthonormalizes a basis matrix using Gram-Schmidt process
 */
export function basisOrthonormalize(out: basis, b: basis): basis {
    // Start with X axis
    vec3Normalize([out[0], out[1], out[2]], [b[0], b[1], b[2]]);

    // Y axis: subtract projection onto X axis
    const yProj = vec3Dot([b[3], b[4], b[5]], [out[0], out[1], out[2]]);
    const yAxis: vec3 = [
        b[3] - yProj * out[0],
        b[4] - yProj * out[1],
        b[5] - yProj * out[2]
    ];
    vec3Normalize([out[3], out[4], out[5]], yAxis);

    // Z axis: cross product of X and Y
    vec3Cross([out[6], out[7], out[8]], [out[0], out[1], out[2]], [out[3], out[4], out[5]]);

    return out;
}

/**
 * Scales a basis by a vector
 */
export function basisScale(out: basis, b: basis, scale: vec3): basis {
    out[0] = b[0] * scale[0];
    out[1] = b[1] * scale[0];
    out[2] = b[2] * scale[0];

    out[3] = b[3] * scale[1];
    out[4] = b[4] * scale[1];
    out[5] = b[5] * scale[1];

    out[6] = b[6] * scale[2];
    out[7] = b[7] * scale[2];
    out[8] = b[8] * scale[2];

    return out;
}

/**
 * Linear interpolation between two basis matrices
 */
export function basisLerp(out: basis, a: basis, b: basis, t: number): basis {
    // Convert to quaternions for proper interpolation
    const qa = basisToQuat(a);
    const qb = basisToQuat(b);

    // Simple lerp of quaternion components (not slerp, but faster)
    const qOut: quat = [
        qa[0] + t * (qb[0] - qa[0]),
        qa[1] + t * (qb[1] - qa[1]),
        qa[2] + t * (qb[2] - qa[2]),
        qa[3] + t * (qb[3] - qa[3])
    ];

    // Normalize the quaternion
    const len = Math.sqrt(qOut[0] * qOut[0] + qOut[1] * qOut[1] + qOut[2] * qOut[2] + qOut[3] * qOut[3]);
    if (len > EPSILON) {
        qOut[0] /= len;
        qOut[1] /= len;
        qOut[2] /= len;
        qOut[3] /= len;
    }

    return basisFromQuat(qOut);
}

/**
 * Spherical linear interpolation between two basis matrices
 */
export function basisSlerp(out: basis, a: basis, b: basis, t: number): basis {
    const qa = basisToQuat(a);
    const qb = basisToQuat(b);

    // Calculate dot product
    let dot = qa[0] * qb[0] + qa[1] * qb[1] + qa[2] * qb[2] + qa[3] * qb[3];

    // If dot product is negative, slerp won't take the shorter path
    if (dot < 0) {
        dot = -dot;
        qb[0] = -qb[0];
        qb[1] = -qb[1];
        qb[2] = -qb[2];
        qb[3] = -qb[3];
    }

    // If the inputs are too close for comfort, linearly interpolate
    if (dot > 0.9995) {
        const qOut: quat = [
            qa[0] + t * (qb[0] - qa[0]),
            qa[1] + t * (qb[1] - qa[1]),
            qa[2] + t * (qb[2] - qa[2]),
            qa[3] + t * (qb[3] - qa[3])
        ];

        const len = Math.sqrt(qOut[0] * qOut[0] + qOut[1] * qOut[1] + qOut[2] * qOut[2] + qOut[3] * qOut[3]);
        if (len > EPSILON) {
            qOut[0] /= len;
            qOut[1] /= len;
            qOut[2] /= len;
            qOut[3] /= len;
        }

        return basisFromQuat(qOut);
    }

    // Calculate angle between the quaternions
    const theta0 = Math.acos(Math.abs(dot));
    const sinTheta0 = Math.sin(theta0);
    const theta = theta0 * t;
    const sinTheta = Math.sin(theta);

    const s0 = Math.cos(theta) - dot * sinTheta / sinTheta0;
    const s1 = sinTheta / sinTheta0;

    const qOut: quat = [
        s0 * qa[0] + s1 * qb[0],
        s0 * qa[1] + s1 * qb[1],
        s0 * qa[2] + s1 * qb[2],
        s0 * qa[3] + s1 * qb[3]
    ];

    return basisFromQuat(qOut);
}

/**
 * Rotates a basis by an axis-angle rotation (global space)
 * Equivalent to Godot's Basis.rotated(axis, angle)
 */
export function basisRotate(out: basis, b: basis, axis: vec3, angle: number): basis {
    const rotationBasis = basisFromAxisAngle(axis, angle);
    return basisMul(out, rotationBasis, b);
}

/**
 * Rotates a basis by Euler angles (global space)
 * Equivalent to Godot's Basis.rotated(euler)
 */
export function basisRotateEuler(out: basis, b: basis, euler: vec3): basis {
    const rotationBasis = basisFromEuler(euler);
    return basisMul(out, rotationBasis, b);
}

/**
 * Rotates a basis by Euler angles in degrees (global space)
 * Equivalent to Godot's Basis.rotated(euler_degrees)
 */
export function basisRotateEulerDeg(out: basis, b: basis, eulerDeg: vec3): basis {
    const rotationBasis = basisFromEulerDeg(eulerDeg);
    return basisMul(out, rotationBasis, b);
}

/**
 * Rotates a basis by a quaternion (global space)
 * Equivalent to Godot's Basis.rotated(quat)
 */
export function basisRotateQuat(out: basis, b: basis, q: quat): basis {
    const rotationBasis = basisFromQuat(q);
    return basisMul(out, rotationBasis, b);
}

/**
 * Rotates a basis by an axis-angle rotation (local space)
 * Equivalent to Godot's Basis.rotated_local(axis, angle)
 */
export function basisRotateLocal(out: basis, b: basis, axis: vec3, angle: number): basis {
    const rotationBasis = basisFromAxisAngle(axis, angle);
    return basisMul(out, b, rotationBasis);
}

/**
 * Rotates a basis by Euler angles (local space)
 * Equivalent to Godot's Basis.rotated_local(euler)
 */
export function basisRotateLocalEuler(out: basis, b: basis, euler: vec3): basis {
    const rotationBasis = basisFromEuler(euler);
    return basisMul(out, b, rotationBasis);
}

/**
 * Rotates a basis by Euler angles in degrees (local space)
 * Equivalent to Godot's Basis.rotated_local(euler_degrees)
 */
export function basisRotateLocalEulerDeg(out: basis, b: basis, eulerDeg: vec3): basis {
    const rotationBasis = basisFromEulerDeg(eulerDeg);
    return basisMul(out, b, rotationBasis);
}

/**
 * Rotates a basis by a quaternion (local space)
 * Equivalent to Godot's Basis.rotated_local(quat)
 */
export function basisRotateLocalQuat(out: basis, b: basis, q: quat): basis {
    const rotationBasis = basisFromQuat(q);
    return basisMul(out, b, rotationBasis);
}

// Forward declarations for types used in this module
type quat = [number, number, number, number];
