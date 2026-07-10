import type {
  CallExpression,
  TypeChecker,
  NodeFactory,
  Expression,
} from 'typescript';
import type { InferPayloadByApiName } from '../types';
import type {
  TMatchXalorModes,
  TGeneratorXalorModes,
  TTransformXalorModes,
  TValidationXalorModes,
} from '../../shared';
import { MATCH_PROCESSOR_MAPPER } from '../mappers/match-processor-mapper';

/**
 * Reusable utility to scrape out a single string-literal generic argument from index [0]
 * and dynamically compute the execution mode flavor directly from the fully qualified API name string.
 *
 * SYSTEM RULE:
 * Generic parameter slot [0] is ALWAYS only the database <KEY> string literal token.
 */
export function extractSingleKeyPayload<T extends string>(
  node: CallExpression,
  checker: TypeChecker,
  apiName: T,
): InferPayloadByApiName<T> {
  const typeArgs = node.typeArguments ?? [];
  let keyName: string | undefined;
  let mode: string | undefined;

  if (typeArgs.length >= 1) {
    const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
    if (keyType.isStringLiteral()) {
      keyName = keyType.value;
    }
  }

  const periodIndex = apiName.indexOf('.');
  if (periodIndex !== -1) {
    mode = apiName.slice(periodIndex + 1);
  }

  // TODO: FIX AS CSTING
  return {
    keyName,
    apiName,
    mode,
  } as unknown as InferPayloadByApiName<T>;
}

// ========================================================================
// STRICTOR INTERFACES FOR REWRITE PAYLOADS
// ========================================================================
interface IBasePayload {
  readonly keyName: string | undefined;
}

// ========================================================================
// TYPE-SAFE REWRITE REFACTOR HELPERS (TAIL-END METADATA ARRANGER)
// ========================================================================

/**
 * ## formatGenerationArgs — Generation Node Argument Arranger
 */
export function formatGenerationArgs<T extends IBasePayload>(
  mode: TGeneratorXalorModes,
  raw: T,
  node: CallExpression,
  factory: NodeFactory,
): Expression[] {
  // const { isVacuumStripMode } = XalorRoutesService.resolveXalorLifecycle();
  // const keyName = raw.keyName ?? 'unknown';

  // /* prettier-ignore */ const trackedContextRecord = xalorCentralContext.context.globalKeyRegistry.get(keyName);
  // /* prettier-ignore */ const shape = trackedContextRecord?.shape;

  // if (isVacuumStripMode && isValidSolidShape(shape)) {
  //   const runtimeConfigExpression = factory.createObjectLiteralExpression([
  //     /* prettier-ignore */ factory.createPropertyAssignment('shape', generateShapeAST(factory, shape)),
  //   ]);

  //   return node.arguments.length > 0
  //     ? [...node.arguments, runtimeConfigExpression]
  //     : [runtimeConfigExpression];
  // }
  const keyLiteral = factory.createStringLiteral(raw.keyName ?? 'unknown');
  const modeLiteral = factory.createStringLiteral(mode);

  // 🎯 REALIGNMENT PASS: Pushes metadata to the end so user arguments stay at index 0
  return node.arguments.length > 0
    ? [...node.arguments, keyLiteral, modeLiteral]
    : [keyLiteral, modeLiteral];
}

/**
 * ## formatValidationArgs — Validation Node Argument Arranger
 */
export function formatValidationArgs<T extends IBasePayload>(
  mode: TValidationXalorModes,
  raw: T,
  node: CallExpression,
  factory: NodeFactory,
): Expression[] {
  // const { isVacuumStripMode } = XalorRoutesService.resolveXalorLifecycle();
  // const keyName = raw.keyName ?? 'unknown';

  // /* prettier-ignore */ const trackedContextRecord = xalorCentralContext.context.globalKeyRegistry.get(keyName);
  // /* prettier-ignore */ const shape = trackedContextRecord?.shape;

  // if (isVacuumStripMode && isValidSolidShape(shape)) {
  //   const runtimeConfigExpression = factory.createObjectLiteralExpression([
  //     /* prettier-ignore */ factory.createPropertyAssignment('shape', generateShapeAST(factory, shape)),
  //   ]);

  //   return node.arguments.length > 0
  //     ? [...node.arguments, runtimeConfigExpression]
  //     : [runtimeConfigExpression];
  // }

  const keyLiteral = factory.createStringLiteral(raw.keyName ?? 'unknown');
  const modeLiteral = factory.createStringLiteral(mode);

  return node.arguments.length > 0
    ? [...node.arguments, keyLiteral, modeLiteral]
    : [keyLiteral, modeLiteral];
}

/**
 * ## formatTransformationArgs — Transformation Node Argument Arranger
 */
export function formatTransformationArgs<T extends IBasePayload>(
  mode: TTransformXalorModes,
  raw: T,
  node: CallExpression,
  factory: NodeFactory,
): Expression[] {
  // const { isVacuumStripMode } = XalorRoutesService.resolveXalorLifecycle();
  // const keyName = raw.keyName ?? 'unknown';

  // /* prettier-ignore */ const trackedContextRecord = xalorCentralContext.context.globalKeyRegistry.get(keyName);
  // /* prettier-ignore */ const shape = trackedContextRecord?.shape;

  // if (isVacuumStripMode && isValidSolidShape(shape)) {
  //   const runtimeConfigExpression = factory.createObjectLiteralExpression([
  //     /* prettier-ignore */ factory.createPropertyAssignment('shape', generateShapeAST(factory, shape)),
  //   ]);

  //   return node.arguments.length > 0
  //     ? [...node.arguments, runtimeConfigExpression]
  //     : [runtimeConfigExpression];
  // }

  const keyLiteral = factory.createStringLiteral(raw.keyName ?? 'unknown');
  const modeLiteral = factory.createStringLiteral(mode);

  return node.arguments.length > 0
    ? [...node.arguments, keyLiteral, modeLiteral]
    : [keyLiteral, modeLiteral];
}
/**
 * ## formatTransformationArgs — Transformation Node Argument Arranger
 */
export function formatMatchArgs<T extends IBasePayload>(
  mode: TMatchXalorModes,
  raw: T,
  node: CallExpression,
  factory: NodeFactory,
): Expression[] {
  const targetedHandler = MATCH_PROCESSOR_MAPPER[mode];
  if (targetedHandler && raw.keyName) {
    return targetedHandler({ keyName: raw.keyName }, node, factory);
  }

  const tokenLiteral = factory.createStringLiteral(raw.keyName ?? 'unknown');

  return node.arguments.length > 0
    ? [...node.arguments, tokenLiteral]
    : [tokenLiteral];
}
