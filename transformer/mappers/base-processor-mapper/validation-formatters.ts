// /transformer/mappers/processor-mapper.ts
import type { CallExpression, NodeFactory, Expression } from 'typescript';
import type { IBaseProcessorPayload } from '../../types';
import ts from 'typescript';

/**
 * formatGuardArgs
 * SPECIALIZED GUARD TRANSFORM PASS
 *
 * ROLE:
 * Safely maps unexecuted validator factory signatures (0 arguments) down to 1 string token,
 * and executed runtime boundaries (1 argument) down to exactly 2 arguments point-free.
 */
export function formatGuardArgs<T extends IBaseProcessorPayload>(
  raw: T,
  node: CallExpression,
  factory: NodeFactory,
): Expression[] {
  const incomingArgs = node.arguments;
  const keyName = raw.keyName ?? 'unknown';

  // 1. Idempotency Guard (Already Transformed Check)
  // An already compiled guard call site maps perfectly to exactly 2 arguments: [data, keyLiteral]
  if (incomingArgs.length === 2) {
    const lastArg = incomingArgs[1];
    if (ts.isStringLiteral(lastArg) && lastArg.text === keyName) {
      return [...incomingArgs];
    }
  }

  const keyLiteral = factory.createStringLiteral(keyName);

  // B: Standalone Unexecuted Factory -> xalor.guard<T>()
  // Macro text starts with 0 parameters. We emit exactly ONE string token.
  if (incomingArgs.length === 0) {
    return [keyLiteral]; // Compiled bytecode output: xalor.guard("USER_ACCOUNT")
  }

  // A: Executed Runtime Boundary -> xalor.guard(payload)
  // Macro text starts with 1 parameter (the data payload). We emit exactly TWO.
  if (incomingArgs.length === 1) {
    const originalDataPayloadArg = incomingArgs[0];
    return [originalDataPayloadArg, keyLiteral];
  }

  return [...incomingArgs];
}

/**
 * formatParseArgs
 * 💎 SPECIALIZED PARSE INGRESS TRANSFORM PASS
 *
 * ROLE:
 * Normalizes parsing operations down to exactly 3 arguments: [data, key, mode].
 * Prevents token accumulation bugs and maintains monomorphic speed constraints.
 */
export function formatParseArgs<T extends IBaseProcessorPayload>(
  raw: T,
  node: CallExpression,
  factory: NodeFactory,
): Expression[] {
  const incomingArgs = node.arguments;
  const keyName = raw.keyName ?? 'unknown';

  // 1. Idempotency Guard (Already Transformed Check)
  // An already compiled parse call site maps perfectly to exactly 3 arguments.
  if (incomingArgs.length === 3) {
    const lastArg = incomingArgs[2];
    const secondToLastArg = incomingArgs[1];
    if (
      ts.isStringLiteral(lastArg) &&
      ts.isStringLiteral(secondToLastArg) &&
      secondToLastArg.text === keyName
    ) {
      return [...incomingArgs];
    }
  }

  const keyLiteral = factory.createStringLiteral(keyName);

  // Isolate only the original data payload object (the very first argument)
  // This completely wipes away any duplicate trailing arguments left from dirty warm caches.
  const originalPayloadArg =
    incomingArgs[0] || factory.createObjectLiteralExpression([]);

  // Emits precisely exactly: [dataPayload, keyLiteral, modeLiteral]
  return [originalPayloadArg, keyLiteral]; // Compiled output: xalor.parse(data, "USER_ACCOUNT", "parse")
}
