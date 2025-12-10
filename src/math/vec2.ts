/**
 * 2D Vector type
 */
export type vec2 = [number, number];

/**
 * Creates a new Vec2 with the given components
 */
export function vec2New(x: number, y: number): vec2 {
    return [x, y];
}

/**
 * Creates a zero vector
 */
export function vec2Zero(): vec2 {
    return [0, 0];
}

/**
 * Creates a unit vector along the x-axis
 */
export function vec2UnitX(): vec2 {
    return [1, 0];
}

/**
 * Creates a unit vector along the y-axis
 */
export function vec2UnitY(): vec2 {
    return [0, 1];
}

/**
 * Normalizes a vector to unit length
 */
export function vec2Normalize(out: vec2, v: vec2): vec2 {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    if (len === 0) {
        out[0] = 0;
        out[1] = 0;
    } else {
        out[0] = v[0] / len;
        out[1] = v[1] / len;
    }
    return out;
}

/**
 * Calculates the dot product of two vectors
 */
export function vec2Dot(a: vec2, b: vec2): number {
    return a[0] * b[0] + a[1] * b[1];
}

/**
 * Calculates the length (magnitude) of a vector
 */
export function vec2Length(v: vec2): number {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

/**
 * Calculates the squared length of a vector (useful for comparisons without sqrt)
 */
export function vec2LengthSq(v: vec2): number {
    return v[0] * v[0] + v[1] * v[1];
}

/**
 * Adds two vectors
 */
export function vec2Add(out: vec2, a: vec2, b: vec2): vec2 {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
}

/**
 * Subtracts vector b from vector a
 */
export function vec2Sub(out: vec2, a: vec2, b: vec2): vec2 {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
}

/**
 * Multiplies a vector by a scalar
 */
export function vec2Mul(out: vec2, v: vec2, scalar: number): vec2 {
    out[0] = v[0] * scalar;
    out[1] = v[1] * scalar;
    return out;
}

/**
 * Divides a vector by a scalar
 */
export function vec2DivScalar(out: vec2, v: vec2, scalar: number): vec2 {
    out[0] = v[0] / scalar;
    out[1] = v[1] / scalar;
    return out;
}

/**
 * Negates a vector (multiplies by -1)
 */
export function vec2Negate(out: vec2, v: vec2): vec2 {
    out[0] = -v[0];
    out[1] = -v[1];
    return out;
}

/**
 * Calculates the distance between two points
 */
export function vec2Distance(a: vec2, b: vec2): number {
    return vec2Length(vec2Sub([0, 0], a, b));
}

/**
 * Calculates the squared distance between two points
 */
export function vec2DistanceSq(a: vec2, b: vec2): number {
    return vec2LengthSq(vec2Sub([0, 0], a, b));
}

/**
 * Linear interpolation between two vectors
 */
export function vec2Lerp(out: vec2, a: vec2, b: vec2, t: number): vec2 {
    const temp = [0, 0] as vec2;
    vec2Sub(temp, b, a);
    vec2Mul(temp, temp, t);
    vec2Add(out, a, temp);
    return out;
}

/**
 * Reflects a vector off a surface with the given normal
 */
export function vec2Reflect(out: vec2, incident: vec2, normal: vec2): vec2 {
    const dotProduct = vec2Dot(incident, normal);
    const temp = [0, 0] as vec2;
    vec2Mul(temp, normal, 2 * dotProduct);
    vec2Sub(out, incident, temp);
    return out;
}

/**
 * Calculates the cross product of two 2D vectors (returns scalar)
 */
export function vec2Cross(a: vec2, b: vec2): number {
    return a[0] * b[1] - a[1] * b[0];
}

/**
 * Rotates a 2D vector by the given angle (in radians)
 */
export function vec2Rotate(out: vec2, v: vec2, angle: number): vec2 {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const x = v[0];
    const y = v[1];

    out[0] = x * c - y * s;
    out[1] = x * s + y * c;
    return out;
}

/**
 * Calculates the angle between two vectors (in radians)
 */
export function vec2Angle(a: vec2, b: vec2): number {
    const dot = vec2Dot(a, b);
    const lenA = vec2Length(a);
    const lenB = vec2Length(b);

    if (lenA === 0 || lenB === 0) {
        return 0;
    }

    const cosAngle = dot / (lenA * lenB);
    return Math.acos(Math.max(-1, Math.min(1, cosAngle)));
}
