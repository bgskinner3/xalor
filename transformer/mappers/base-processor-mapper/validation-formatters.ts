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

  if (incomingArgs.length === 2) {
    const lastArg = incomingArgs[1];
    if (ts.isStringLiteral(lastArg) && lastArg.text === keyName) {
      return [...incomingArgs];
    }
  }

  const keyLiteral = factory.createStringLiteral(keyName);

  if (incomingArgs.length === 0) {
    return [keyLiteral];
  }

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

  const originalPayloadArg =
    incomingArgs[0] || factory.createObjectLiteralExpression([]);

  return [originalPayloadArg, keyLiteral];
}
