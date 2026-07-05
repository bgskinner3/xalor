export const PRIMITIVE_DEFAULTS = {
  string: '',
  number: 0,
  boolean: false,
  bigint: BigInt(0),
  array: [],
  unknown: undefined,
} as const;

/**
 * 🛡️ RESTRICTED INJECTION VECTORS (THE HOLY TRINITY OF PROTOTYPE SECURITIES)
 *
 * PURPOSE:
 * Explicitly blacklists the three structural meta-properties responsible for governing
 * JavaScript's prototype inheritance chain. Intercepting these keys at the ingress gate
 * completely eliminates Prototype Pollution vulnerabilities and runtime environment contamination.
 *
 * THE ATTACK VECTORS CAPTURED:
 * 1. '__proto__'    - Direct pointer to an object's internal [[Prototype]]. Polluting this
 *                      mutates the global Object blueprint, causing all system objects to instantly
 *                      inherit malicious payload fields.
 * 2. 'constructor'  - Reference pointer back to the factory function that created the instance.
 *                      Attackers use this (e.g., obj.constructor.prototype) to bypass naive string
 *                      filters targeting '__proto__' directly.
 * 3. 'prototype'    - The shared structural blueprint used by Classes and Constructor functions.
 *                      Required if the validator ever encounters raw class payloads or functions
 *                      to prevent downstream instance tampering.
 *
 * WHY OTHER KEYS (e.g., 'toString', 'valueOf') ARE EXCLUDED:
 * Standard inherited methods are deliberately omitted here to prevent false-positive validation blocks.
 * Developers routinely use fields named 'toString' or 'valueOf' for regular data payload values.
 * Downstream safety for those methods is natively guaranteed by Layer 2 of our defense, which
 * switches to blueprint-driven loops using explicit instance isolation via `Object.hasOwn()`.
 */
export const PROTO_EXPLOIT_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype',
]);
