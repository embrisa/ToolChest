// Utility type to concatenate keys in a dotted path
type Join<K, P> = K extends string | number
    ? P extends string | number
    ? `${K}.${P}`
    : never
    : never;

// Recursive helper to collect paths up to depth D (to avoid infinite recursion)
// Increase the tuple length if you need deeper objects.
// Credits: community util patterns.

// prettier-ignore
export type Paths<T, D extends number = 8> = [D] extends [never]
    ? never
    : T extends object
    ? {
        [K in keyof T]-?: K extends string | number
        ? T[K] extends object
        ? | K & string | number
        | Join<K & string | number, Paths<T[K], Prev[D]>>
        : K & string | number
        : never;
    }[keyof T]
    : never;

// Helper to decrement depth
// prettier-ignore
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Produce a union of all possible dotted-path keys in an object type.
 * Example: `{ a: { b: string } }` → "a" | "a.b"
 */
// Simpler recursive key flattener (handles up to any depth without depth param)
export type MessageKeys<T> = T extends object
    ? {
        [K in keyof T]: K extends string
        ? T[K] extends object
        ? | K | `${K}.${MessageKeys<T[K]>}`
        : K
        : never;
    }[keyof T]
    : never; 