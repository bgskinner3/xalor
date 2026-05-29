import type { TTransformerExecuteMode } from '../../shared';
import type {
  TXalorTypeGuardFailure,
  TXalorErrorFormatVariant,
} from '../types';
import { TransformerReportService } from './report-service';
/**
 * XalorInvalidTypeError
 * 🛡️ SYSTEM EXTRACTION EXCEPTION CONTAINER
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

    // 🪐 THE NON-ENUMERABLE PRIVATE CONTAINER ASSIGNMENT
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
