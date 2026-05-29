// transformer/reifiers/generator.ts
import type {
  NodeFactory,
  Expression,
  ObjectLiteralElementLike,
} from 'typescript';
import {
  isPrimitiveShape,
  isLiteralShape,
  isObjectShape,
  isArrayShape,
  isBrandedShape,
  isUnionShape,
  isReferenceShape,
  mapIterableLazy,
  isNumber,
  isBoolean,
  isUndefined,
  isString,
} from '../../shared';
import type { TSolidShape } from '../../shared';
import { XalorRoutesService } from '../service';
import { TransformerReportService } from '../error';
/**
 *  The AST Generator (Build-Time Emission)
 *
 * This module serves as the translation layer between the "Solid Shape"
 * data structures and the TypeScript Compiler's AST (Abstract Syntax Tree).
 *
 * ROLE:
 * It converts a recursive JSON-like blueprint (TSolidShape) into a
 * physical JavaScript Object Literal Expression. This expression is
 * what gets "baked" into the final compiled source code, allowing the
 * Runtime Vault (Pillar 2) to exist without a dependency on the
 * TypeScript Compiler.
 *
 * PROCESS:
 * 1. RECURSION: Deeply traverses nested shapes (Objects, Arrays, Unions).
 * 2. MAPPING: Uses the NodeFactory to create exact JS syntax for every type.
 * 3. SAFETY: Implements an exhaustive check to ensure every new 'kind' added
 *    to the system is handled, preventing silent failures during emission.
 *
 * @param f - The TypeScript NodeFactory used to create syntax nodes.
 * @param shape - The solidified blueprint to be converted into JS code.
 * @returns {Expression} A TypeScript AST Expression representing the shape.
 */
export function generateShapeAST(
  f: NodeFactory,
  shape: TSolidShape,
): Expression {
  const _exhaustive: TSolidShape = shape;
  if (isPrimitiveShape(shape)) {
    return f.createObjectLiteralExpression([
      f.createPropertyAssignment('kind', f.createStringLiteral('primitive')),
      f.createPropertyAssignment('type', f.createStringLiteral(shape.type)),
    ]);
  }
  if (isArrayShape(shape)) {
    const arrayElements: ObjectLiteralElementLike[] = [
      f.createPropertyAssignment('kind', f.createStringLiteral('array')),
      f.createPropertyAssignment('items', generateShapeAST(f, shape.items)),
    ];

    // Dynamically append tuple meta-properties without unsafe casting if they exist on this array node
    if (!isUndefined(shape.elementShapes)) {
      arrayElements.push(
        f.createPropertyAssignment(
          'elementShapes',
          f.createArrayLiteralExpression(
            shape.elementShapes.map((element) => generateShapeAST(f, element)),
          ),
        ),
      );
    }

    if (isNumber(shape.minLength)) {
      arrayElements.push(
        f.createPropertyAssignment(
          'minLength',
          f.createNumericLiteral(String(shape.minLength)),
        ),
      );
    }

    if (isBoolean(shape.hasRest)) {
      arrayElements.push(
        f.createPropertyAssignment(
          'hasRest',
          shape.hasRest ? f.createTrue() : f.createFalse(),
        ),
      );
    }

    return f.createObjectLiteralExpression(arrayElements);
  }

  if (isLiteralShape(shape)) {
    let valueNode: Expression;
    /* prettier-ignore */ if (isString(shape.value )) valueNode = f.createStringLiteral(shape.value);
    else if (isNumber(shape.value)) valueNode = f.createNumericLiteral(String(shape.value));
    else valueNode = shape.value ? f.createTrue() : f.createFalse();
    return f.createObjectLiteralExpression([
      f.createPropertyAssignment('kind', f.createStringLiteral('literal')),
      f.createPropertyAssignment('value', valueNode),
    ]);
  }

  if (isUnionShape(shape)) {
    const expressionIterator = mapIterableLazy<TSolidShape, Expression>(
      shape.values,
      (v) => {
        return generateShapeAST(f, v);
      },
    );

    return f.createObjectLiteralExpression([
      f.createPropertyAssignment('kind', f.createStringLiteral('union')),
      f.createPropertyAssignment(
        'values',
        f.createArrayLiteralExpression([...expressionIterator]),
      ),
    ]);
  }

  if (isBrandedShape(shape)) {
    return f.createObjectLiteralExpression([
      f.createPropertyAssignment('kind', f.createStringLiteral('branded')),
      f.createPropertyAssignment('name', f.createStringLiteral(shape.name)),
      f.createPropertyAssignment('base', generateShapeAST(f, shape.base)),
    ]);
  }

  if (isObjectShape(shape)) {
    const propNodes = Object.entries(shape.properties).map(([key, meta]) => {
      return f.createPropertyAssignment(
        f.createStringLiteral(key),
        f.createObjectLiteralExpression([
          f.createPropertyAssignment('shape', generateShapeAST(f, meta.shape)),
          f.createPropertyAssignment(
            'optional',
            meta.optional ? f.createTrue() : f.createFalse(),
          ),
          f.createPropertyAssignment('name', f.createStringLiteral(meta.name)),
        ]),
      );
    });
    return f.createObjectLiteralExpression([
      f.createPropertyAssignment('kind', f.createStringLiteral('object')),
      f.createPropertyAssignment(
        'properties',
        f.createObjectLiteralExpression(propNodes),
      ),
    ]);
  }

  if (isReferenceShape(shape)) {
    return f.createObjectLiteralExpression([
      f.createPropertyAssignment('kind', f.createStringLiteral('reference')),
      f.createPropertyAssignment('name', f.createStringLiteral(shape.name)),
    ]);
  }

  const executeMode = XalorRoutesService.xalorCLIMode();

  TransformerReportService.logAnomaly({
    keyName: 'AST_GENERATION_ANOMALY',
    fileLocation: 'transformer/miner/processor.ts ↳ generateShapeAST',
    error: _exhaustive.kind || 'undefined',
    mode: executeMode,
  });

  // This guarantees complete data integrity, prevents crashing the server,
  // and isolates the error gracefully.
  return f.createObjectLiteralExpression([
    f.createPropertyAssignment('kind', f.createStringLiteral('primitive')),
    f.createPropertyAssignment('type', f.createStringLiteral('unknown')),
  ]);
}
