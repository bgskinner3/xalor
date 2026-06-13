import type {
  TMergeDependency,
  TMapperObject,
  TPickOmitDependency,
} from '../../models/types';
import { isObject, isNull, isArray } from '../../../shared';

/**
 * 🔪 STANDALONE OBJECT TRANSFORMATION WORKER
 *
 * ROLE:
 * Isolates and coordinates the complex conditional multi-fork property selection ('pick'/'omit'),
 * nominal alignment ('rename'), and entity aggregation ('merge') routines for object shape nodes.
 *
 */
export function transformerMapperObject({
  shape,
  data,
  dependency,
  depth,
  recurse,
}: TMapperObject) {
  /* prettier-ignore */
  if (dependency.mode !== 'merge' && (!isObject(data) || isNull(data) || isArray(data)))
     return null;
  // DEFINE PARAMETERS
  const proto = Object.getPrototypeOf(data || {});
  const cleanObj = Object.create(proto);
  const blueprintProps = shape.properties;
  const dataRef = data || {};
  /**
   * ROUTE 1 & 2: MODES PICK || OMIT
   */
  if (dependency.mode === 'pick' || dependency.mode === 'omit') {
    const activeSet = dependency.set;

    for (const key of Object.keys(blueprintProps)) {
      const propertyContainer = blueprintProps[key];

      if (
        propertyContainer?.shape &&
        Object.prototype.hasOwnProperty.call(dataRef, key)
      ) {
        const hasRootMatch = activeSet.has(key);
        const hasNestedMatch = Array.from(activeSet).some((path) =>
          path.startsWith(`${key}.`),
        );

        const isAllowed =
          dependency.mode === 'pick'
            ? hasRootMatch || hasNestedMatch
            : !hasRootMatch && !hasNestedMatch;

        if (isAllowed) {
          const childSet = new Set<string>();

          for (const path of activeSet) {
            if (path.startsWith(`${key}.`)) {
              childSet.add(path.slice(key.length + 1));
            } else if (path === key && dependency.mode === 'pick') {
              //  Expand properties natively if the node is explicitly an object schema
              if (propertyContainer.shape.kind === 'object') {
                for (const childKey of Object.keys(
                  propertyContainer.shape.properties,
                )) {
                  childSet.add(childKey);
                }
              }
              /* prettier-ignore */
              if (propertyContainer.shape.kind === 'array' && propertyContainer.shape.items.kind === 'object' ) {
                   /* prettier-ignore */ 
                for (const childKey of Object.keys( propertyContainer.shape.items.properties,)) {
                  childSet.add(childKey);
                }
              }
            }
          }

          // If childSet remains completely empty but passed checks, handle as terminal leaf node
          const nextDependency: TPickOmitDependency = {
            mode: dependency.mode,
            set: childSet.size > 0 ? childSet : new Set([key]),
          };

          /* prettier-ignore */
          cleanObj[key] = recurse(dataRef[key], propertyContainer.shape, nextDependency, depth + 1);
        }
      }
    }
    return cleanObj;
  }
  /**
   * ROUTE 3: MODE RENAME
   */
  if (dependency.mode === 'rename') {
    const mappings = dependency.mappings;
    for (const blueprintKey of Object.keys(blueprintProps)) {
      const propertyContainer = blueprintProps[blueprintKey];
      if (propertyContainer?.shape) {
        let rawIncomingSourceKey = blueprintKey;
        for (const [incomingKey, targetKey] of Object.entries(mappings)) {
          if (targetKey === blueprintKey) {
            rawIncomingSourceKey = incomingKey;
            break;
          }
        }
        /* prettier-ignore */ if (Object.prototype.hasOwnProperty.call(dataRef, rawIncomingSourceKey)) {
          /* prettier-ignore */ cleanObj[blueprintKey] = recurse(dataRef[rawIncomingSourceKey],propertyContainer.shape,dependency,depth + 1,);
        }
      }
    }
    return cleanObj;
  }
  /**
   * ROUTE 4: MODE merge
   */
  if (dependency.mode === 'merge') {
    const patchRef = isObject(dependency.patchData) ? dependency.patchData : {};

    const dataRef = isObject(data) ? data : {};
    for (const key of Object.keys(blueprintProps)) {
      const propertyContainer = blueprintProps[key];

      if (propertyContainer?.shape) {
        const val1 = dataRef[key];
        const val2 = patchRef[key];

        // Wrap the child patch layer into a localized dependency block to cascade down deep arrays/objects
        const nextChildDependency: TMergeDependency = {
          mode: 'merge',
          patchData: val2,
        };

        // = Double-entity tracking remains preserved natively down call stack frames!
        /* prettier-ignore */
        cleanObj[key] = recurse(val1, propertyContainer.shape, nextChildDependency, depth + 1);
      }
    }
    return cleanObj;
  }
  return cleanObj;
}
