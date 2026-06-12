import type { TSolidShape } from '../../../shared';

/**
 * isTypeContractResolvabilityPure
 * 🛰️ THE EXHAUSTIVE REGISTRATION PURITY DETECTOR RADAR
 *
 * ROLE:
 * Sweeps a fully reified shape layout tree point-free to guarantee that it contains
 * zero un-resolvable primitive masks, dynamic library keys, or un-serializable properties.
 */
export function isTypeContractResolvabilityPure(shape: TSolidShape): boolean {
  // ========================================================================
  // 🪐 1. PRIMITIVE SHAPE VARIANT (kind: 'primitive')
  // ========================================================================
  if (shape.kind === 'primitive') {
    // Catch un-resolvable fallback tokens (e.g., dynamic un-evaluated conditional type rules)
    return shape.type !== 'unknown';
  }

  // ========================================================================
  // 🪐 2. LITERAL SHAPE VARIANT (kind: 'literal')
  // ========================================================================
  if (shape.kind === 'literal') {
    // Constant literals (e.g., kind: 'literal', value: "admin") represent hardcoded primitives.
    // They carry no private methods or operational keys—pass verification cleanly.
    return true;
  }

  // ========================================================================
  // 🪐 3. UNION SHAPE VARIANT (kind: 'union')
  // ========================================================================
  if (shape.kind === 'union') {
    const values = shape.values;
    const len = values.length;

    // Cached linear loop to bypass heavy sequential iterator object allocations on the stack
    for (let i = 0; i < len; i++) {
      const branch = values[i];
      if (branch !== undefined && !isTypeContractResolvabilityPure(branch)) {
        return false; // Immediately escalate rejection if ANY union branch is volatile
      }
    }
    return true;
  }

  // ========================================================================
  // 🪐 4. BRANDED SHAPE VARIANT (kind: 'branded')
  // ========================================================================
  if (shape.kind === 'branded') {
    // Drill straight down point-free to audit the underlying base type structure
    return isTypeContractResolvabilityPure(shape.base);
  }

  // ========================================================================
  // 🪐 5. REFERENCE SHAPE VARIANT (kind: 'reference')
  // ========================================================================
  if (shape.kind === 'reference') {
    // Content-addressable reference pointer link tokens (e.g. "sh_i93krv") carry simple strings.
    // They represent structural nodes that are verified during their independent cycles—pass cleanly.
    return true;
  }

  // ========================================================================
  // 🪐 6. ARRAY & TUPLE SHAPE VARIANT (kind: 'array')
  // ========================================================================
  if (shape.kind === 'array') {
    // First, verify the structural integrity of the base array item layout
    if (!isTypeContractResolvabilityPure(shape.items)) {
      return false;
    }

    // Next, if it represents a Tuple layout carrying discrete element shapes arrays
    if (shape.elementShapes !== undefined) {
      const tupleElements = shape.elementShapes;
      const elementLen = tupleElements.length;

      for (let i = 0; i < elementLen; i++) {
        const element = tupleElements[i];
        if (
          element !== undefined &&
          !isTypeContractResolvabilityPure(element)
        ) {
          return false;
        }
      }
    }
    return true;
  }

  // ========================================================================
  // 🪐 7. OBJECT SHAPE VARIANT (kind: 'object')
  // ========================================================================
  if (shape.kind === 'object') {
    const propertyKeys = Object.keys(shape.properties);
    const keyLen = propertyKeys.length;

    for (let i = 0; i < keyLen; i++) {
      const key = propertyKeys[i];
      if (key === undefined) continue;

      // 🚨 CORE BOUNDARY PROTECTION LAWS:
      // If a property key starts with an underscore '_' or a dollar sign '$',
      // it confirms a private internal framework instance variable node—reject instantly!
      if (key.startsWith('_') || key.startsWith('$')) {
        return false;
      }

      const meta = shape.properties[key];
      if (meta !== undefined && !isTypeContractResolvabilityPure(meta.shape)) {
        return false;
      }
    }
    return true;
  }

  // Invariant fallback safety return for future schema expansions
  return false;
}
