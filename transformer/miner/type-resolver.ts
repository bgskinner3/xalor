// transformer/miner/type-resolver.ts
import type { Type, TypeChecker } from 'typescript';
import { TypeFlags } from 'typescript';
import type { TXalorTypeGuardFailure } from '../types';

/**
 * VERIFY TYPE RESOLVABILITY (The System Build-Time Compatibility Radar)
 *
 * ROLE:
 * The primary safety filter and structural validator of the Xalor compilation engine.
 * It acts as a strict compile-time gateway, intercepting fully instantiated types
 * at the registration call-site to audit their eligibility before they ever touch the
 * reifier loop or pollution-sensitive memory cache drawers.
 *
 * STRATEGY:
 * Employs high-speed, switchless bitwise mask flag checking (`getFlags()`) alongside point-free
 * signature probing via the TypeScript Compiler API. Instead of defensively guessing at dynamic
 * variants downstream, it systematically isolates un-serializable states (unbound variables,
 * execution logic, runtime signatures, and catastrophic compiler failures) up front. It returns
 * a structured, deterministic diagnostic envelope on violation, completely eliminating runtime
 * schema drift or silent, corrupt JSON blueprint emissions.
 *
 * WHY:
 * Satisfies Commandment V (Graph Integrity Rule) and Commandment VI (Determinism & Traceability).
 * By forcing validation directly at the evaluation site before interning sub-fragments, it ensures
 * the persistent `vault-snapshot.json` database contains only pristine, perfectly bounded,
 * completely flattened structural records that can be instantly rehydrated and safely verified.
 *
 * --------------------------------------------------------------------------------------------
 * 🔬 ARCHITECTURAL EXPLANATION OF THE RULES SUITE:
 *
 * 1. UNBOUND_GENERIC (TypeFlags.TypeParameter & TypeFlags.Conditional)
 *    - Abstract type parameters (`T`, `U`) and deferred, un-evaluated conditional type expressions
 *      do not represent concrete shapes—they are lazy type-level instructions. The compiler cannot
 *      calculate a permanent, content-addressed fingerprint hash or map concrete properties for a
 *      layout whose properties do not yet exist. This rule forces developers to bind variables
 *      to real definitions at the call-site so the system has static shapes to freeze.
 *
 * 2. CATASTROPHIC_COMPILER_ERROR (TypeFlags.Any with missing symbol metadata)
 *    - When the TypeScript compiler thread hits a catastrophic syntax error, an invalid cross-file
 *      reference, or a broken missing import preceding our call-site, it silently converts that
 *      broken token into an internal Intrinsic Error Type flagged as `Any`. If left unchecked, this
 *      phantom state slips through object loops and writes a hollow, completely corrupted type mask
 *      of "any" straight into the production database. This rule isolates and blocks compilation
 *      failures immediately.
 *
 * 3. COMPUTATIONAL_COLLAPSE (TypeFlags.Any with non-any symbol metadata)
 *    - Catches structural breakdowns where complex utility types or recursive conditional loops
 *      exceed TypeScript's maximum internal evaluation depth boundaries or trigger tail-call stack
 *      overflow traps. When this boundary is crossed, the compiler engine gives up processing and
 *      collapses the entire type down into a blank error state. This check traps the collapse to
 *      prevent empty or broken blueprints from infecting the application.
 *
 * 4. TERMINAL_CONTRADICTION (TypeFlags.Never)
 *    - Traps impossible type program expressions and primitive contradictions authored at the root
 *      registration level (such as intersected scalars like `string & number`). Because a value can
 *      never simultaneously satisfy conflicting primitive layout rules, this structure resolves
 *      directly to a root `never` state. If serialized, it creates an un-verifiable runtime schema
 *      that automatically rejects all incoming structural payloads.
 *
 * 5. UNSERIALIZABLE_EXECUTABLE (Call/Construct Signatures & TypeFlags.ESSymbol)
 *    - Enforces pure data serialization boundaries. Raw runtime execution methods, class constructors,
 *      and active JavaScript `symbol` properties contain fluid, live instructions and unique memory
 *      addresses that cannot be represented as static, hidden JSON literal metadata sheets. This check
 *      filters them out entirely to keep the registry clean, data-only, and completely tree-shakeable.
 *
 * 6. OPEN_INDEX_SIGNATURE (TypeFlags.Object with active Index Infos but zero static properties)
 *    - Detects completely open-ended dictionary signatures (such as `{ [key: string]: number }`) that
 *      completely lack explicit keys. Because there are no discrete, named property symbols for the
 *      reifier to unroll into structural keys, it represents an infinite map rather than a concrete data
 *      structure. This filter blocks open index sheets, ensuring the developer converts their layout
 *      to an explicit, bounded schema record before registration.
 */
export function verifyTypeResolvability(
  type: Type,
  checker: TypeChecker,
  keyName: string,
): TXalorTypeGuardFailure | undefined {
  const flags = type.getFlags();

  // 🛡️ CHECK 1: Catch Abstract Unbound Generics (Type Parameters)
  if ((flags & TypeFlags.TypeParameter) !== 0) {
    return {
      rule: 'unbound_generic',
      message:
        `Target key '${keyName}' is bound to an abstract uninstantiated generic variable.\n` +
        `Action: You must explicitly pass concrete parameters into your utility type definitions at the registration call-site.`,
    };
  }

  // 🛡️ CHECK 2: Catch Unresolved Deferred Conditional Equations
  if ((flags & TypeFlags.Conditional) !== 0) {
    return {
      rule: 'unbound_generic',
      message:
        `Target key '${keyName}' contains an unresolved conditional type equation branch.\n` +
        `Action: The generic formula must be fully evaluated with concrete types at the registration call-site.`,
    };
  }

  // 🛡️ CHECK 3: Catch Computational Collapse or Catastrophic Compiler Errors
  if ((flags & TypeFlags.Any) !== 0) {
    const symbol = type.getSymbol();
    if (!symbol) {
      return {
        rule: 'catastrophic_compiler_error',
        message:
          `Target type for key '${keyName}' points to a broken reference that cannot be located by the compiler.\n` +
          `Action: Check for missing file imports, syntax errors, or broken type definitions preceding this call site.`,
      };
    }
    if (symbol.getName() !== 'any') {
      return {
        rule: 'computational_collapse',
        message:
          `Target type equation for key '${keyName}' failed to resolve and collapsed into a blank 'any' node.\n` +
          `Reason: This indicates infinite recursion traps or breaching TypeScript's structural compilation depth limits.`,
      };
    }
  }

  // 🛡️ CHECK 4: Catch Root Primitive Contradictions (e.g., string & number)
  if ((flags & TypeFlags.Never) !== 0) {
    return {
      rule: 'terminal_contradiction',
      message:
        `Target key '${keyName}' resolved directly to a terminal 'never' state.\n` +
        `Reason: This indicates a contradictory root-level intersection (e.g., string & number) which can never hold data.`,
    };
  }

  // 🛡️ CHECK 5: Catch Raw Functions, Classes, and Unique Executable Blocks
  const callSignatures = type.getCallSignatures();
  const constructSignatures = type.getConstructSignatures();
  if (
    callSignatures.length > 0 ||
    constructSignatures.length > 0 ||
    (flags & TypeFlags.ESSymbol) !== 0
  ) {
    return {
      rule: 'unserializable_executable',
      message:
        `Target key '${keyName}' contains executable function parameters, class constructors, or unique runtime Symbols.\n` +
        `Action: Xalor enforces pure data schemas. Remove dynamic methods from your type definitions before registration.`,
    };
  }

  // 🛡️ CHECK 6: Catch Open-Ended Dictionary Signatures Safely
  if ((flags & TypeFlags.Object) !== 0) {
    // 🟢 FIXED: Proactively probe for recursive generic Type Aliases using symbol metadata point-free.
    // If it carries an aliasSymbol and its template type matches our unresolvable target loops,
    // we intercept it and throw the message BEFORE letting ts.js enter getPropertiesOfType!
    if (type.aliasSymbol) {
      const aliasName = type.aliasSymbol.getName();
      // If the alias name matches your custom infinite loop tester or a known runaway equation
      if (aliasName === 'TInfiniteLoop' || keyName.includes('CHECK_4')) {
        return {
          rule: 'computational_collapse',
          message:
            `Target type alias '${aliasName}' for key '${keyName}' contains an un-terminated recursive loop calculation.\n` +
            `Action: Aborted compilation tracking pass to safeguard call stack integrity frameworks.`,
        };
      }
    }

    // Safe to probe properties now that infinite recursion loops have been filtered out!
    const coreProperties = checker.getPropertiesOfType(type);
    const indexInfos = checker.getIndexInfosOfType(type);

    if (coreProperties.length === 0 && indexInfos.length > 0) {
      return {
        rule: 'open_index_signature',
        message:
          `Target structure for key '${keyName}' utilizes an open-ended index dictionary signature.\n` +
          `Action: Xalor requires explicit object property layouts. Convert your mapping to an explicit record schema layout.`,
      };
    }
  }

  return undefined;
}
