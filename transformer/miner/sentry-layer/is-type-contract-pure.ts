import type { TSolidShape } from '../../../shared';
import {
  isArrayShape,
  isIntersectionShape,
  isPrimitiveShape,
  isLiteralShape,
  isInstanceOfShape,
  isReferenceShape,
  isBrandedShape,
  isUnionShape,
  isObjectShape,
  isFunctionShape,
} from '../../../shared';
import { isUndefined } from '../../../shared/utils/guards';
/**
 * isTypeContractResolvabilityPure
 * 🛰️ THE EXHAUSTIVE REGISTRATION PURITY DETECTOR RADAR
 *
 * ROLE:
 * Sweeps a fully reified shape layout tree point-free to guarantee that it contains
 * zero un-resolvable primitive masks, dynamic library keys, or un-serializable properties.
 */
export function isTypeContractResolvabilityPure(shape: TSolidShape): boolean {
  /* prettier-ignore */
  if (isPrimitiveShape(shape)) return shape.type !== 'never';

  /* prettier-ignore */
  if (isLiteralShape(shape)) return true;

  /* prettier-ignore */
  if (isInstanceOfShape(shape)) return true;

  /* prettier-ignore */
  if (isReferenceShape(shape)) return true;

  /* prettier-ignore */
  if (isBrandedShape(shape)) return isTypeContractResolvabilityPure(shape.base);

  if (isUnionShape(shape)) {
    const values = shape.values;
    const { length } = values;
    for (let i = 0; i < length; i++) {
      const branch = shape.values[i];
      /* prettier-ignore */
      if (!isUndefined(branch) && !isTypeContractResolvabilityPure(branch)) return false;
    }
    return true;
  }

  if (isIntersectionShape(shape)) {
    const values = shape.values;
    const { length } = values;
    for (let i = 0; i < length; i++) {
      const branch = values[i];
      /* prettier-ignore */
      if (!isUndefined(branch) && !isTypeContractResolvabilityPure(branch)) return false;
    }
    return true;
  }

  if (isArrayShape(shape)) {
    if (!isTypeContractResolvabilityPure(shape.items)) {
      return false;
    }
    if (shape.elementShapes !== undefined) {
      const tupleElements = shape.elementShapes;
      const { length } = tupleElements;
      for (let i = 0; i < length; i++) {
        const element = tupleElements[i];
        /* prettier-ignore */
        if (!isUndefined(element) && !isTypeContractResolvabilityPure(element)) return false;
      }
    }
    return true;
  }

  if (isObjectShape(shape)) {
    const propertyKeys = Object.keys(shape.properties);
    const { length } = propertyKeys;
    for (let i = 0; i < length; i++) {
      const key = propertyKeys[i];
      if (isUndefined(key)) continue;

      if (key.startsWith('_') || key.startsWith('$')) {
        return false;
      }
      const meta = shape.properties[key];
      if (!isUndefined(meta) && !isTypeContractResolvabilityPure(meta.shape)) {
        return false;
      }
    }
    return true;
  }

  if (isFunctionShape(shape)) {
    if (!isTypeContractResolvabilityPure(shape.returnType)) {
      return false;
    }
    const params = shape.parameters;
    const { length } = params;
    for (let i = 0; i < length; i++) {
      const param = params[i];
      /* prettier-ignore */
      if (!isUndefined(param) && !isTypeContractResolvabilityPure(param.shape)) return false;
    }
    return true;
  }

  // Pure compiler-enforced exhaustiveness protection line (Commandment IX)
  const _exhaustiveCheck: never = shape;
  return _exhaustiveCheck;
}
