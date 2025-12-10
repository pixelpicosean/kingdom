import { vec3, vec3Normalize } from './vec3';
import { EPSILON, degToRad, radToDeg } from './utils';

/**
 * 4D Quaternion type (Godot-like)
 * Format: [x, y, z, w]
 */
export type quat = [number, number, number, number];

/**
 * Creates a new quaternion with the given components
 */
export function quatNew(x: number, y: number, z: number, w: number): quat {
    return [x, y, z, w];
}

/**
 * Creates an identity quaternion (no rotation)
 */
export function quatIdentity(out: quat = [0, 0, 0, 1]): quat {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
}

/**
 * Creates a quaternion from axis-angle rotation
 */
export function quatFromAxisAngle(axis: vec3, angle: number): quat {
    const normalizedAxis = vec3Normalize([0, 0, 0], axis);
    const halfAngle = angle * 0.5;
    const sinHalfAngle = Math.sin(halfAngle);

    return [
        normalizedAxis[0] * sinHalfAngle,
        normalizedAxis[1] * sinHalfAngle,
        normalizedAxis[2] * sinHalfAngle,
        Math.cos(halfAngle)
    ];
}

/**
 * Creates a quaternion from Euler angles (in radians)
 * Order: ZYX (yaw, pitch, roll)
 */
export function quatFromEuler(euler: vec3): quat {
    const halfX = euler[0] * 0.5; // pitch
    const halfY = euler[1] * 0.5; // yaw
    const halfZ = euler[2] * 0.5; // roll

    const cx = Math.cos(halfX);
    const sx = Math.sin(halfX);
    const cy = Math.cos(halfY);
    const sy = Math.sin(halfY);
    const cz = Math.cos(halfZ);
    const sz = Math.sin(halfZ);

    return [
        sx * cy * cz - cx * sy * sz,
        cx * sy * cz + sx * cy * sz,
        cx * cy * sz - sx * sy * cz,
        cx * cy * cz + sx * sy * sz
    ];
}

/**
 * Creates a quaternion from Euler angles in degrees
 */
export function quatFromEulerDeg(eulerDeg: vec3): quat {
    return quatFromEuler([degToRad(eulerDeg[0]), degToRad(eulerDeg[1]), degToRad(eulerDeg[2])]);
}

/**
 * Creates a quaternion from a basis matrix
 */
export function quatFromBasis(b: basis): quat {
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
 * Multiplies two quaternions
 */
export function quatMul(out: quat, a: quat, b: quat): quat {
    const ax = a[0], ay = a[1], az = a[2], aw = a[3];
    const bx = b[0], by = b[1], bz = b[2], bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;

    return out;
}

/**
 * Calculates the dot product of two quaternions
 */
export function quatDot(a: quat, b: quat): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

/**
 * Calculates the length (magnitude) of a quaternion
 */
export function quatLength(q: quat): number {
    return Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
}

/**
 * Calculates the squared length of a quaternion
 */
export function quatLengthSq(q: quat): number {
    return q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3];
}

/**
 * Normalizes a quaternion to unit length
 */
export function quatNormalize(out: quat, q: quat): quat {
    const len = quatLength(q);
    if (len === 0) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
    } else {
        out[0] = q[0] / len;
        out[1] = q[1] / len;
        out[2] = q[2] / len;
        out[3] = q[3] / len;
    }
    return out;
}

/**
 * Calculates the conjugate of a quaternion
 */
export function quatConjugate(out: quat, q: quat): quat {
    out[0] = -q[0];
    out[1] = -q[1];
    out[2] = -q[2];
    out[3] = q[3];
    return out;
}

/**
 * Calculates the inverse of a quaternion
 */
export function quatInverse(out: quat, q: quat): quat {
    const lenSq = quatLengthSq(q);
    if (lenSq === 0) {
        return quatIdentity(out);
    }

    quatConjugate(out, q);
    out[0] /= lenSq;
    out[1] /= lenSq;
    out[2] /= lenSq;
    out[3] /= lenSq;

    return out;
}

/**
 * Rotates a 3D vector by a quaternion
 */
export function quatRotateVec3(out: vec3, v: vec3, q: quat): vec3 {
    const x = v[0], y = v[1], z = v[2];
    const qx = q[0], qy = q[1], qz = q[2], qw = q[3];

    // calculate quat * vec
    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

    return out;
}

/**
 * Converts a quaternion to Euler angles (in radians)
 * Returns [pitch, yaw, roll] in ZYX order
 */
export function quatToEuler(q: quat): vec3 {
    const x = q[0], y = q[1], z = q[2], w = q[3];

    // Roll (z-axis rotation)
    const sinr_cosp = 2 * (w * z + x * y);
    const cosr_cosp = 1 - 2 * (y * y + z * z);
    const roll = Math.atan2(sinr_cosp, cosr_cosp);

    // Pitch (y-axis rotation)
    const sinp = 2 * (w * y - z * x);
    let pitch;
    if (Math.abs(sinp) >= 1) {
        pitch = Math.PI / 2 * Math.sign(sinp); // use 90 degrees if out of range
    } else {
        pitch = Math.asin(sinp);
    }

    // Yaw (x-axis rotation)
    const siny_cosp = 2 * (w * x + y * z);
    const cosy_cosp = 1 - 2 * (x * x + y * y);
    const yaw = Math.atan2(siny_cosp, cosy_cosp);

    return [pitch, yaw, roll];
}

/**
 * Converts a quaternion to Euler angles in degrees
 */
export function quatToEulerDeg(q: quat): vec3 {
    const euler = quatToEuler(q);
    return [radToDeg(euler[0]), radToDeg(euler[1]), radToDeg(euler[2])];
}

/**
 * Converts a quaternion to angle-axis representation
 * Returns [angle, axis] where axis is a normalized vec3
 */
export function quatToAngleAxis(q: quat): [number, vec3] {
    const x = q[0], y = q[1], z = q[2], w = q[3];

    if (Math.abs(w) > 0.9999) {
        // Quaternion is close to identity
        return [0, [1, 0, 0]];
    }

    const angle = 2 * Math.acos(Math.abs(w));
    const sinHalfAngle = Math.sin(angle / 2);

    const axis: vec3 = [
        x / sinHalfAngle,
        y / sinHalfAngle,
        z / sinHalfAngle
    ];

    return [angle, axis];
}

/**
 * Converts a quaternion to a basis matrix
 */
export function quatToBasis(q: quat): basis {
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
 * Converts a quaternion to a 4x4 rotation matrix
 */
export function quatToMat4(out: mat4, q: quat): mat4 {
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

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;

    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;

    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
}

/**
 * Linear interpolation between two quaternions
 */
export function quatLerp(out: quat, a: quat, b: quat, t: number): quat {
    out[0] = a[0] + t * (b[0] - a[0]);
    out[1] = a[1] + t * (b[1] - a[1]);
    out[2] = a[2] + t * (b[2] - a[2]);
    out[3] = a[3] + t * (b[3] - a[3]);

    // Normalize the result
    const len = Math.sqrt(out[0] * out[0] + out[1] * out[1] + out[2] * out[2] + out[3] * out[3]);
    if (len > EPSILON) {
        out[0] /= len;
        out[1] /= len;
        out[2] /= len;
        out[3] /= len;
    }

    return out;
}

/**
 * Spherical linear interpolation between two quaternions
 */
export function quatSlerp(out: quat, a: quat, b: quat, t: number): quat {
    // Calculate dot product
    let dot = quatDot(a, b);

    // If dot product is negative, slerp won't take the shorter path
    if (dot < 0) {
        dot = -dot;
        out[0] = -b[0];
        out[1] = -b[1];
        out[2] = -b[2];
        out[3] = -b[3];
    } else {
        out[0] = b[0];
        out[1] = b[1];
        out[2] = b[2];
        out[3] = b[3];
    }

    // If the inputs are too close for comfort, linearly interpolate
    if (dot > 0.9995) {
        out[0] = a[0] + t * (out[0] - a[0]);
        out[1] = a[1] + t * (out[1] - a[1]);
        out[2] = a[2] + t * (out[2] - a[2]);
        out[3] = a[3] + t * (out[3] - a[3]);

        const len = Math.sqrt(out[0] * out[0] + out[1] * out[1] + out[2] * out[2] + out[3] * out[3]);
        if (len > EPSILON) {
            out[0] /= len;
            out[1] /= len;
            out[2] /= len;
            out[3] /= len;
        }

        return out;
    }

    // Calculate angle between the quaternions
    const theta0 = Math.acos(Math.abs(dot));
    const sinTheta0 = Math.sin(theta0);
    const theta = theta0 * t;
    const sinTheta = Math.sin(theta);

    const s0 = Math.cos(theta) - dot * sinTheta / sinTheta0;
    const s1 = sinTheta / sinTheta0;

    out[0] = s0 * a[0] + s1 * out[0];
    out[1] = s0 * a[1] + s1 * out[1];
    out[2] = s0 * a[2] + s1 * out[2];
    out[3] = s0 * a[3] + s1 * out[3];

    return out;
}

// Forward declarations for types used in this module
type basis = [
    number, number, number,  // x axis
    number, number, number,  // y axis
    number, number, number,  // z axis
];

type mat4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
];

