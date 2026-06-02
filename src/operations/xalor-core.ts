// import { XalethorService } from '../xalor-service';
// import type {
//   TValidateXalorReturn,
//   TTValidateStrategyEngine,
// } from '../models/types';
// import { buildValidationTools, markAsSolid } from '../utils';
import type {
  TTypeGuard,
  TXalorAuditReport,
  // TValidateXalorModes,
  TSolidBranded,
} from '../../shared';
import { validateXalor } from './validate-xalor';
// // class XalorCore {
// //   validate<K extends keyof ISolidRegistry, M extends TValidateXalorModes>(
// //     ...args: Parameters<typeof validateXalor<K, M>>
// //   ): ReturnType<typeof validateXalor<K, M>> {
// //     return validateXalor<K, M>(...(args as any));
// //   }
// // }
// throw new Error(
//   `[xalor] 🚨 GATEWAY BLOCK: 'assert' executed without compiled metadata properties.`,
// );
class XalorCore {
  /**
   * Helper mapping strategy functions under the hood.
   */

  // --- VALIDATION METHODS ---

  public guard<K extends keyof ISolidRegistry>(): TSolidBranded<
    K,
    TTypeGuard<ISolidRegistry[K]>
  > {
    return validateXalor<K, 'guard'>();
  }
  public assert<K extends keyof ISolidRegistry>(
    data: unknown,
  ): asserts data is ISolidRegistry[K] {
    return validateXalor<K, 'assert'>(data);
  }
  public parse<K extends keyof ISolidRegistry>(
    data: unknown,
  ): TSolidBranded<K, ISolidRegistry[K]> {
    return validateXalor<K, 'parse'>(data);
  }
  public parseAsync<K extends keyof ISolidRegistry>(
    data: unknown,
  ): TSolidBranded<K, Promise<ISolidRegistry[K]>> {
    return validateXalor<K, 'parseAsync'>(data);
  }
  public audit<K extends keyof ISolidRegistry>(
    data: unknown,
  ): TXalorAuditReport {
    return validateXalor<K, 'audit'>(data);
  }

  // --- TRANSFORMER METHODS ---
}

export const xalor = new XalorCore();
