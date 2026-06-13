import { isObject, isSet } from '../../../shared';
import type {
  TExecuteMergeFork,
  TExecutePickOmitFork,
  TPickOmitDependency,
  TMergeDependency,
} from '../../models/types';
/**
 * 🔍 PREDICATE EXECUTIONER: FIELD SELECTIVE RETENTION (PICK MODE)
 *
 * ROLE:
 * Evaluates target schema field tokens against the user-supplied filtering context tracking set.
 * Explicitly determines whether a field layout graph edge should be retained or sliced away.
 *
 * BEHAVIORAL MATRIX:
 * - If the active properties collection filter Set is empty, evaluates flatly to `true` (pass-through).
 * - Matches root property string keys directly via high-performance O(1) hashing operations (`has`).
 * - Parses compound template literal dot-notation strings recursively to support nested lookups (e.g., 'items.SKU').
 * - If the current field acts as a namespace prefix directory path or contains child elements targeted for sub-slicing,
 *   retains the parent structure natively (`true`) to allow deeper matrix walks.
 *
 * @param fieldKey - The raw string name accessor of the property currently being evaluated by the loop stack frame.
 * @param propertiesSet - The source filtering context tracking Set containing explicit developer selection coordinates.
 * @param _depth - The tracking index counter tracking the absolute current nesting tier position within the graph tree.
 * @returns Boolean value where `true` authorizes a clone allocation pass, and `false` forces property deletion.
 */
export const pickPredicateExecutioner = (
  fieldKey: string,
  propertiesSet: Set<string> | Record<string, string>,
  _depth: number,
) => {
  if (!isSet(propertiesSet)) return true;

  const hasDirectMatch = propertiesSet.has(fieldKey);

  const hasNestedMatch = Array.from(propertiesSet).some((path) => {
    const pathSegments = path.split('.');
    return pathSegments.includes(fieldKey) || path.startsWith(`${fieldKey}.`);
  });

  return hasDirectMatch || hasNestedMatch;
};
/**
 * ✂️ PREDICATE EXECUTIONER: FIELD STRUCTURAL EXCLUSION (OMIT MODE)
 *
 * ROLE:
 * Evaluates target schema field tokens against the user-supplied filtering context tracking set.
 * Explicitly determines whether a field layout graph edge should be discarded or kept intact.
 *
 * BEHAVIORAL MATRIX (OMIT INVERSION LAW):
 * - Operates as the strict logical inverse of the `pick` predicate engine block.
 * - If the active properties collection filter Set is empty, evaluates flatly to `true` (maintains payload state).
 * - Implements a double-negative assertion lookup track: blocks matching keys immediately at the root entrance layer.
 * - If any compound nested path target matches the current namespace sequence (e.g., 'profile.secretToken' under 'profile'),
 *   safely allows the parent graph bridge entry (`true`) so sub-slicing rules can evaluate individual deep nodes.
 *
 * @param fieldKey - The raw string name accessor of the property currently being evaluated by the loop stack frame.
 * @param propertiesSet - The source filtering context tracking Set containing explicit developer exclusion coordinates.
 * @param _depth - The tracking index counter tracking the absolute current nesting tier position within the graph tree.
 * @returns Boolean value where `true` preserves the property edge, and `false` drops the value payload entirely.
 */
export const omitPredicateExecutioner = (
  fieldKey: string,
  propertiesSet: Set<string> | Record<string, string>,
  _depth: number,
) => {
  if (!isSet(propertiesSet)) return true;

  const hasDirectMatch = propertiesSet.has(fieldKey);

  const hasNestedMatch = Array.from(propertiesSet).some((path) => {
    const pathSegments = path.split('.');
    return pathSegments.includes(fieldKey) || path.startsWith(`${fieldKey}.`);
  });

  if (hasDirectMatch) return false;
  if (hasNestedMatch) return true;

  return true;
};
//sliceObjectProperties
// ========================================================================================================
// ========================================================================================================
// ========================================================================================================
// TRANSFORMER SLICED PROPERTIES
// ========================================================================================================
// ========================================================================================================
// ========================================================================================================

/**
 * 🔪 UTILITY WORKER: SELECTION PIPELINES (PICK & OMIT MODES)
 *
 * ROLE:
 * Iterates strictly over authoritative blueprint keys, evaluating field keys via path-aware predicates.
 */
export function executePickOmitFork({
  val,
  dependency,
  depth,
  predicate,
  cleanObj,
  dataRef,
  props,
  seenObjectsMap,
  sanitizeHandler,
}: TExecutePickOmitFork): Record<string, unknown> {
  const activeSet = dependency.set;

  if (predicate && isSet(activeSet)) {
    for (const key of Object.keys(props)) {
      const metadata = props[key];

      if (
        metadata &&
        metadata.shape &&
        Object.prototype.hasOwnProperty.call(val || {}, key)
      ) {
        if (predicate(key, activeSet, depth) && isObject(dataRef)) {
          const rawSourceValue = (dataRef as Record<string, unknown>)[key];

          const childSet = new Set<string>();
          for (const path of activeSet) {
            if (path.startsWith(`${key}.`)) {
              childSet.add(path.slice(key.length + 1));
            } else if (path === key && dependency.mode === 'pick') {
              if (metadata.shape.kind === 'object') {
                for (const childKey of Object.keys(metadata.shape.properties)) {
                  childSet.add(childKey);
                }
              }

              if (
                metadata.shape.kind === 'array' &&
                metadata.shape.items.kind === 'object'
              ) {
                for (const childKey of Object.keys(
                  metadata.shape.items.properties,
                )) {
                  childSet.add(childKey);
                }
              }
            }
          }

          const childDependency: TPickOmitDependency = {
            mode: dependency.mode,
            set: childSet.size > 0 ? childSet : activeSet,
          };

          /* prettier-ignore */ cleanObj[key] = sanitizeHandler({ val: rawSourceValue, currentShape: metadata.shape, dependency: childDependency, depth: depth + 1, seenObjectsMap, predicate,});
        }
      }
    }
  }
  return cleanObj;
}

/**
 * 🔪 UTILITY WORKER: ENTITY AGGREGATIONS (MERGE MODE)
 *
 * BEHAVIOR:
 * Deep-merges twin data layers, generating isolated child contexts dynamically down stack frames.
 */
export function executeMergeFork({
  val,
  dependency,
  depth,
  predicate,
  cleanObj,
  props,
  seenObjectsMap,
  sanitizeHandler,
}: TExecuteMergeFork): Record<string, unknown> {
  const baseDataRef = (val as Record<string, unknown>) || {};
  const patchRef = (dependency.patchData as Record<string, unknown>) || {};

  for (const key of Object.keys(props)) {
    const metadata = props[key];

    if (metadata && metadata.shape) {
      const val1 = baseDataRef[key];
      const val2 = patchRef[key];

      const childDependency: TMergeDependency = {
        mode: 'merge',
        patchData: val2,
      };

      const targetActiveBaseValue = val1 !== undefined ? val1 : val2;

      /* prettier-ignore */ cleanObj[key] = sanitizeHandler({ val: targetActiveBaseValue, currentShape: metadata.shape, dependency: childDependency, depth: depth + 1, seenObjectsMap, predicate });
    }
  }
  return cleanObj;
}
