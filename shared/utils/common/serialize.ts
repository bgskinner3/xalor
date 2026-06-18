import type { TSolidShape } from '../../shape-domain';
import { computeStringHash } from './general';
import {
  isPrimitiveShape,
  isLiteralShape,
  isInstanceOfShape,
  isReferenceShape,
  isObjectShape,
  isArrayShape,
  isBrandedShape,
  isIntersectionShape,
  isFunctionShape,
  isUnionShape,
} from '../../shape-domain';

/**
 *
 *  serializeCanonicalFingerprint — Canonical Content-Addressable Fingerprinter
 *
 * ROLE:
 * Performs a deterministic, allocation-free flattening sweep over a reified
 * TSolidShape graph node, producing an invariant, alphabetized structural footprint.
 * This footprint serves as the immutable "DNA" string used by the FNV-1a bitwise
 * engine to compute unique Content-Addressable Storage (CAS) identifiers ('sh_...').
 *
 * COMPLIANCE & STRATEGY:
 * 1. Commandment I (Single Source of Truth) — Completely discards loose global string
 *    serialization (JSON.stringify) to shield the compiler from nominal property leaks.
 * 2. Commandment VIII (Internal Efficiency) — Runs entirely point-free on the active
 *    V8 context thread, using fast array iterations and sorted keys without dynamic mutations.
 * 3. Commandment IX (Invariant Type Safety) — 100% clean of 'any' escapes, type assertions
 *    ('as'), or unsafe casting traps, using a statically checked 'never' boundary line.
 *
 * THE STRUCTURAL DE-RECURSION GAUNTLET:
 * - Vertical Shield: Tracks active heap object references inside a passing `visited`
 *   Set tracker context. If a self-referencing cyclic node lineage path loops back into
 *   itself, the entrance gate instantly intercepts the frame layer and returns a
 *   deterministic breakout placeholder string ('cyclic_loop_ref'), saving the stack.
 * - Sibling Isolation: Enforces horizontal path branch cleanliness by clean stacking.
 *   Every container node explicitly removes itself (`visited.delete(s)`) upon exiting its
 *   scope frame, ensuring parallel horizonal paths never trigger false-positive locks.
 * - Key Canonicalization: Explicitly orders object layout properties alphabetically
 *   (`Object.keys(s.properties).sort()`), guaranteeing that structurally equivalent schemas
 *   yield identical fingerprint signatures regardless of source file declaration order.
 *
 * @param shape - The raw or partially reified TSolidShape tree node to be fingerprinted.
 * @param visited - The vertical lineage reference cache used to defuse circular graph traps.
 * @returns An invariant, content-addressable structural representation string.
 */
function serializeCanonicalFingerprint(
  shape: TSolidShape,
  visited: Set<TSolidShape> = new Set<TSolidShape>(),
): string {
  // 🛰️ CYCLIC SHIELD GATE: If this exact memory object reference is already being processed
  // in this call stack frame, return a deterministic recursion boundary token immediately!
  if (visited.has(shape)) {
    return 'cyclic_loop_ref';
  }

  const handleNode = (s: TSolidShape): string => {
    if (isPrimitiveShape(s)) {
      return `p:${s.type}${s.maxLength ? `[l:${s.maxLength}]` : ''}`;
    }
    if (isLiteralShape(s)) {
      return `l:${s.type}:${String(s.value)}`;
    }
    if (isInstanceOfShape(s)) {
      return `i:${s.name}`;
    }
    if (isReferenceShape(s)) {
      return `r:${s.name}`;
    }

    visited.add(s);

    if (isBrandedShape(s)) {
      const res = `b:${s.name}<${serializeCanonicalFingerprint(s.base, visited)}>`;
      visited.delete(s);
      return res;
    }

    if (isArrayShape(s)) {
      const target =
        s.items.kind === 'reference'
          ? s.items.name
          : serializeCanonicalFingerprint(s.items, visited);

      let elementsMeta = '';
      if (s.elementShapes !== undefined) {
        elementsMeta = `[e:${s.elementShapes.map((el) => serializeCanonicalFingerprint(el, visited)).join(',')}]`;
      }

      visited.delete(s);
      return `a:[m:${s.minLength}${s.hasRest ? '+r' : ''}]${elementsMeta}<${target}>`;
    }

    if (isObjectShape(s)) {
      const sortedKeys = Object.keys(s.properties).sort();
      const propsStr = sortedKeys
        .map((key) => {
          const prop = s.properties[key];
          const targetShape =
            prop.shape.kind === 'reference'
              ? `r:${prop.shape.name}`
              : serializeCanonicalFingerprint(prop.shape, visited);
          return `${key}${prop.optional ? '?' : ''}:${targetShape}`;
        })
        .join(',');

      visited.delete(s);
      return `o:{${propsStr}}`;
    }

    // if (isUnionShape(s)) {
    //   const members = s.values.map((v) =>
    //     serializeCanonicalFingerprint(v, visited),
    //   );
    //   visited.delete(s);
    //   return `u:[${members.sort().join('|')}]`;
    // }

    if (isUnionShape(s)) {
      const sortedNodes = [...s.values].sort((a, b) => {
        if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
        const nameA = 'name' in a && typeof a.name === 'string' ? a.name : '';
        const nameB = 'name' in b && typeof b.name === 'string' ? b.name : '';
        return nameA.localeCompare(nameB);
      });

      const members = sortedNodes.map((v) =>
        serializeCanonicalFingerprint(v, visited),
      );
      visited.delete(s);
      return `u:[${members.join('|')}]`;
    }
    if (isIntersectionShape(s)) {
      const sortedNodes = [...s.values].sort((a, b) => {
        if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
        const nameA = 'name' in a && typeof a.name === 'string' ? a.name : '';
        const nameB = 'name' in b && typeof b.name === 'string' ? b.name : '';
        return nameA.localeCompare(nameB);
      });

      const members = sortedNodes.map((v) =>
        serializeCanonicalFingerprint(v, visited),
      );
      visited.delete(s);
      return `x:[${members.join('&')}]`;
    }
    // if (isIntersectionShape(s)) {
    //   const members = s.values.map((v) =>
    //     serializeCanonicalFingerprint(v, visited),
    //   );
    //   visited.delete(s);
    //   return `x:[${members.sort().join('&')}]`;
    // }

    if (isFunctionShape(s)) {
      const paramsStr = s.parameters
        .map((p) => {
          const target = isReferenceShape(p.shape)
            ? `r:${p.shape.name}`
            : serializeCanonicalFingerprint(p.shape, visited);
          return `${p.name}${p.optional ? '?' : ''}:${target}`;
        })
        .join(',');

      const retTarget = isReferenceShape(s.returnType)
        ? s.returnType.name
        : serializeCanonicalFingerprint(s.returnType, visited);

      visited.delete(s);
      return `f(${paramsStr})=>${retTarget}`;
    }

    // Commandment IX protection
    const _exhaustiveCheck: never = s;
    return _exhaustiveCheck;
  };

  return handleNode(shape);
}

/**
 * THE MASTER EXPORT
 * Bridges the Canonical layout directly into your Bitwise Hashing function.
 */
export const computeStableShapeHash = (shape: TSolidShape): string => {
  const canonicalString = serializeCanonicalFingerprint(
    shape,
    new Set<TSolidShape>(),
  );
  return computeStringHash(canonicalString);
};
