/**
 * 3D Vector type
 */
export type vec3 = [number, number, number];

/**
 * Creates a new Vec3 with the given components
 */
export function vec3New(x: number, y: number, z: number): vec3 {
    return [x, y, z];
}

/**
 * Creates a zero vector
 */
export function vec3Zero(): vec3 {
    return [0, 0, 0];
}

/**
 * Creates a unit vector along the x-axis
 */
export function vec3UnitX(): vec3 {
    return [1, 0, 0];
}

/**
 * Creates a unit vector along the y-axis
 */
export function vec3UnitY(): vec3 {
    return [0, 1, 0];
}

/**
 * Creates a unit vector along the z-axis
 */
export function vec3UnitZ(): vec3 {
    return [0, 0, 1];
}

/**
 * Normalizes a vector to unit length
 */
export function vec3Normalize(out: vec3, v: vec3): vec3 {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (len === 0) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
    } else {
        out[0] = v[0] / len;
        out[1] = v[1] / len;
        out[2] = v[2] / len;
    }
    return out;
}

/**
 * Calculates the cross product of two vectors
 */
export function vec3Cross(out: vec3, a: vec3, b: vec3): vec3 {
    out[0] = a[1] * b[2] - a[2] * b[1];
    out[1] = a[2] * b[0] - a[0] * b[2];
    out[2] = a[0] * b[1] - a[1] * b[0];
    return out;
}

/**
 * Calculates the dot product of two vectors
 */
export function vec3Dot(a: vec3, b: vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Calculates the length (magnitude) of a vector
 */
export function vec3Length(v: vec3): number {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

/**
 * Calculates the squared length of a vector (useful for comparisons without sqrt)
 */
export function vec3LengthSq(v: vec3): number {
    return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
}

/**
 * Adds two vectors
 */
export function vec3Add(out: vec3, a: vec3, b: vec3): vec3 {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
}

/**
 * Subtracts vector b from vector a
 */
export function vec3Sub(out: vec3, a: vec3, b: vec3): vec3 {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
}

/**
 * Multiplies a vector by a scalar
 */
export function vec3Mul(out: vec3, v: vec3, scalar: number): vec3 {
    out[0] = v[0] * scalar;
    out[1] = v[1] * scalar;
    out[2] = v[2] * scalar;
    return out;
}

/**
 * Multiplies a vector by a scalar
 */
export function vec3MulScalar(out: vec3, v: vec3, scalar: number): vec3 {
    out[0] = v[0] * scalar;
    out[1] = v[1] * scalar;
    out[2] = v[2] * scalar;
    return out;
}

/**
 * Divides a vector by a scalar
 */
export function vec3DivScalar(out: vec3, v: vec3, scalar: number): vec3 {
    out[0] = v[0] / scalar;
    out[1] = v[1] / scalar;
    out[2] = v[2] / scalar;
    return out;
}

/**
 * Negates a vector (multiplies by -1)
 */
export function vec3Negate(out: vec3, v: vec3): vec3 {
    out[0] = -v[0];
    out[1] = -v[1];
    out[2] = -v[2];
    return out;
}

/**
 * Calculates the distance between two points
 */
export function vec3Distance(a: vec3, b: vec3): number {
    return vec3Length(vec3Sub([0, 0, 0], a, b));
}

/**
 * Calculates the squared distance between two points
 */
export function vec3DistanceSq(a: vec3, b: vec3): number {
    return vec3LengthSq(vec3Sub([0, 0, 0], a, b));
}

/**
 * Linear interpolation between two vectors
 */
export function vec3Lerp(out: vec3, a: vec3, b: vec3, t: number): vec3 {
    const temp = [0, 0, 0] as vec3;
    vec3Sub(temp, b, a);
    vec3Mul(temp, temp, t);
    vec3Add(out, a, temp);
    return out;
}

/**
 * Reflects a vector off a surface with the given normal
 */
export function vec3Reflect(out: vec3, incident: vec3, normal: vec3): vec3 {
    const dotProduct = vec3Dot(incident, normal);
    const temp = [0, 0, 0] as vec3;
    vec3Mul(temp, normal, 2 * dotProduct);
    vec3Sub(out, incident, temp);
    return out;
}
