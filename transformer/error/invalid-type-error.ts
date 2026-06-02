import type { TTransformerExecuteMode } from '../../shared';
import type {
  TXalorTypeGuardFailure,
  TXalorErrorFormatVariant,
} from '../types';
import { TransformerReportService } from './report-service';
/**
 * XalorInvalidTypeError
 * SYSTEM EXTRACTION EXCEPTION CONTAINER
 *
 * ROLE:
 * A specialized build-time data exception container. It dynamically leverages the
 * TransformerReportService inside its own instantiation sequence to bake colored
 * reports directly into its error and stack signatures natively.
 */
export class XalorInvalidTypeError extends Error {
  constructor(
    keyName: string,
    fileLocation: string,
    failure: TXalorTypeGuardFailure,
    mode: TTransformerExecuteMode,
    format: TXalorErrorFormatVariant = 'formatted',
  ) {
    let finalDisplayString = failure.message;

    if (format === 'formatted') {
      finalDisplayString = TransformerReportService.generateTerminalPanel({
        keyName,
        fileLocation,
        message: failure.message,
        rule: failure.rule,
        mode,
      });
    }

    super(finalDisplayString);

    Object.setPrototypeOf(this, XalorInvalidTypeError.prototype);
    this.name = 'XalorInvalidTypeError';

    if (format === 'original') {
      Object.defineProperty(this, '_failure', {
        value: failure,
        enumerable: false,
        writable: false,
        configurable: true,
      });

      Object.defineProperty(this, '_keyName', {
        value: keyName,
        enumerable: false,
        writable: false,
        configurable: true,
      });
    }

    this.stack = `${this.name}: Validating Registration Boundary Invariants\n${finalDisplayString}`;
  }

  /**
   * failure:
   *  lives on the prototype, Node.js completely ignores it during console logs!
   */
  public get failure(): TXalorTypeGuardFailure | undefined {
    return Reflect.get(this, '_failure') as TXalorTypeGuardFailure | undefined;
  }

  /**
   * keyName :
   * lives on the prototype, Node.js completely ignores it during console logs!
   */
  public get keyName(): string | undefined {
    return Reflect.get(this, '_keyName') as string | undefined;
  }
}
// // transformer/visitor.ts
// import { XalorInvalidTypeError } from '../shared/errors/XalorInvalidTypeError';

// export function checkTypeNodeCompliance(node: ts.Node, program: ts.Program) {
//   // ... your graph safety depth validations execute here ...
//   const conditionIsCorrupt = true; // Simulating a loop breach event

//   if (conditionIsCorrupt) {
//     const sourceFile = node.getSourceFile();
//     const absolutePath = sourceFile.fileName; // e.g. "/src/labeled-registry-tests.ts"

//     // 🟢 PATH 1: Pull the exact coordinates of the type declaration definition itself!
//     // (This finds where the type TInfiniteLoop is physically declared in the file)
//     const typeDeclLine = 14; // Derived from your symbol/type declaration node metrics
//     const typeDeclChar = 5;
//     const typeDefinitionLocation = `${absolutePath}:${typeDeclLine}:${typeDeclChar}`;

//     // 🟢 PATH 2: Pull the exact line/column where the validation function was actively CALLED!
//     // (This targets the exact character where they typed assert<T>(...) inside the source file)
//     const { line: callLine, character: callChar } = ts.getLineAndCharacterOfPosition(
//       sourceFile,
//       node.getStart()
//     );
//     const compilerCallSiteLocation = `${absolutePath}:${callLine + 1}:${callChar + 1}`;

//     // Throw the error by handing it BOTH high-precision coordinate strings!
//     throw new XalorInvalidTypeError(
//       'TEST_RULE_CHECK_4',
//       typeDefinitionLocation,  // Handed to the Type Definition row
//       {
//         rule: 'COMPUTATIONAL_COLLAPSE',
//         message: "Target type alias 'TInfiniteLoop' contains an un-terminated recursive loop calculation."
//       },
//       'compile',
//       'formatted',
//       compilerCallSiteLocation // Handed down as a custom override call-site parameter link!
//     );
//   }
// }
