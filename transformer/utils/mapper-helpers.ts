import type {
  CallExpression,
  TypeChecker,
  NodeFactory,
  Expression,
} from 'typescript';
// ========================================================================
// CORE EXTRACTION HELPER (Zero Duplicate Logic)
// ========================================================================

interface ISingleKeyPayload<T> {
  readonly keyName: string | undefined;
  readonly apiName: T;
}

/**
 * Reusable utility to scrape out a single string-literal generic argument from index [0]
 */
export function extractSingleKeyPayload<T extends string>(
  node: CallExpression,
  checker: TypeChecker,
  apiName: T,
): ISingleKeyPayload<T> {
  const typeArgs = node.typeArguments ?? [];
  let keyName: string | undefined;

  if (typeArgs.length >= 1) {
    const keyType = checker.getTypeFromTypeNode(typeArgs[0]);
    if (keyType.isStringLiteral()) {
      keyName = keyType.value;
    }
  }

  return { keyName, apiName };
}
// ========================================================================
// STRICTOR INTERFACES FOR REWRITE PAYLOADS
// ========================================================================
interface IBasePayload {
  readonly keyName: string | undefined;
}

// ========================================================================
// TYPE-SAFE REWRITE REFACTOR HELPERS
// ========================================================================
/**
 * ## formatGenerationArgs — Generation Node Argument Arranger
 * @utilType helper function
 * @name formatGenerationArgs
 * @category AST Transformation Rewriters
 * @description Injects compiled metadata into generation macros, converting parameter-free declarations into explicit runtime instructions.
 *
 * ### 🛠️ Architectural Isolation Strategy: Future-Proof Scaling
 * Although the structural code currently mirrors validation and transformation logic, this function remains strictly **isolated and non-unified**.
 * Separating this module prevents the formation of a rigid, fragile central choke point. As the compilation architecture matures, the generation lane
 * will scale independently to support custom data factory seeds, multi-variant mocks, and specialized structural parameters without spilling into other execution loops.
 */
export function formatGenerationArgs<T extends IBasePayload>(
  mode: string,
  raw: T,
  node: CallExpression,
  factory: NodeFactory,
): Expression[] {
  const keyLiteral = factory.createStringLiteral(raw.keyName ?? 'unknown');
  const modeLiteral = factory.createStringLiteral(mode);
  return node.arguments.length > 0
    ? [keyLiteral, modeLiteral, node.arguments[0]]
    : [keyLiteral, modeLiteral];
}
/**
 * ## formatValidationArgs — Validation Node Argument Arranger
 * @utilType helper function
 * @name formatValidationArgs
 * @category AST Transformation Rewriters
 * @description Rewrites AST call parameters for validation assertions and guard pipelines, embedding metadata required by the runtime schema validator.
 *
 * ### 🛠️ Architectural Isolation Strategy: Future-Proof Scaling
 * Kept intentionally decoupled from neighboring domains. Retaining a dedicated validation rewrite loop ensures that tomorrow's custom schema
 * injection flags, performance log profiles, and boundary telemetry intercepts can be wired cleanly into validation calls without risking side effects in generation or transformation code.
 */
export function formatValidationArgs<T extends IBasePayload>(
  mode: string,
  raw: T,
  node: CallExpression,
  factory: NodeFactory,
): Expression[] {
  const keyLiteral = factory.createStringLiteral(raw.keyName ?? 'unknown');
  const modeLiteral = factory.createStringLiteral(mode);
  return node.arguments.length > 0
    ? [keyLiteral, modeLiteral, node.arguments[0]]
    : [keyLiteral, modeLiteral];
}
/**
 * ## formatTransformationArgs — Transformation Node Argument Arranger
 * @utilType helper function
 * @name formatTransformationArgs
 * @category AST Transformation Rewriters
 * @description Transforms object mutation expressions, rearranging keys, mappings, and configuration contexts into structured parameters.
 *
 * ### 🛠️ Architectural Isolation Strategy: Future-Proof Scaling
 * This method is maintained as an independent operational channel. Transformation mutations require distinct object literal evaluations
 * (such as multi-property `rename` contexts or array-wrapped `pick` elements). Keeping this factory separate prevents complex condition checks from bloating a generic shared helper, ensuring transformation features can expand freely.
 */
export function formatTransformationArgs<T extends IBasePayload>(
  mode: string,
  raw: T,
  node: CallExpression,
  factory: NodeFactory,
): Expression[] {
  const keyLiteral = factory.createStringLiteral(raw.keyName ?? 'unknown');
  const modeLiteral = factory.createStringLiteral(mode);
  return node.arguments.length > 0
    ? [keyLiteral, modeLiteral, node.arguments[0]]
    : [keyLiteral, modeLiteral];
}
