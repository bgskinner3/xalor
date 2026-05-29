import type { TSolidShape } from './blueprints';
import type { TSolidError } from './vault';
import type { TXalorComplianceRuleKeys } from './const-types';

/**
 * 🛰️ TSOLID METADATA
 * The master transport object for type DNA.
 */
export type TSolidMetadata<K extends string = string, T = unknown> = {
  key: K;
  area: string;
  anchor: string; // #call:1
  version: string;
  shape: TSolidShape;
  readonly _ghost?: T;
  symbolName?: string;
  filePath?: string;
  typeName?: string;
};
/**
 * 💎 TSTRICT SOLID METADATA
 *
 * ROLE:
 * The "Final Form" of a type's DNA within the Vault Service.
 *
 * STRATEGY:
 * This type acts as the post-extraction, pre-registration contract.
 * It takes the loose `TSolidMetadata` and enforces absolute presence of
 * all traceability fields (filePath, typeName, etc.).
 *
 * WHY:
 * Ensures the Runtime Engine and Auditor never encounter "undefined"
 * when attempting to resolve GPS coordinates or structural blueprints.
 * It is the internal standard for all Triple-KV drawer operations.
 */
export type TStrictSolidMetaData = {
  // --- additional type move here ----
} & Required<Omit<TSolidMetadata, '_ghost'>>;

/**
 * 🌊 VAULT SYNC PAYLOAD
 * Replica of TSolidMetadata used by the transformer pipeline for
 * syncing and transporting metadata between systems.
 *
 * This format mirrors the core metadata structure but includes
 * additional resolver fields (filePath, typeName) required for
 * serialization, mapping, and vault synchronization.
 */
export type TVaultSyncPayload = {
  readonly filePath: string;
  readonly typeName: string;
  readonly key: string;
  readonly area: string; // 15:1
  readonly anchor: string; // #call:1
  readonly symbolName: string;
  readonly shape: TSolidShape;
  readonly version: string;
};
//   readonly anchor: string;

/**
 * 🛰️ TVALIDATION_CONTEXT
 *
 * ROLE:
 * The live state tracker for Category 2 (Validation API) execution passes.
 * Collects structural errors linearly, manages real-time nested path tracking,
 * and implements graph safety limits to enforce memory boundary thresholds.
 *
 * STRATEGY:
 * - Cyclic Memory Guard: Uses the 'seen' Map to track evaluated object references
 *   against structural schemas, short-circuiting infinite loops on graph loops.
 * - Flat Diagnostics Array: Gathers violation issues synchronously, avoiding complex
 *   exception state jumps to preserve sub-microsecond validation speeds.
 */
export type TValidationContext = {
  seen: Map<unknown, Set<TSolidShape>>;
  path: string;
  errors: TSolidError[];
  currentKey?: string;
  depth: number;
};
/**
 * TXALOR TYPE GUARD FAILURE DIAGNOSTIC
 *
 * ROLE:
 * A strict immutable data contract capturing precise build-time validation faults.
 * It maps structural type anomalies directly to isolated error categories.
 *
 * WHY:
 * Satisfies Commandment VI (Determinism & Traceability). By explicitly categorizing
 * the failure rule with a clear message, it enables the compiler engine to halt
 * and output a zero-allocation, highly precise diagnostic trace back to the developer.
 */
export type TXalorTypeGuardFailure = {
  readonly rule: TXalorComplianceRuleKeys;
  readonly message: string;
};
