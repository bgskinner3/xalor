import type {
  TTypeGuard,
  TXalorAuditReport,
  // TValidateXalorModes,
  TSolidBranded,
} from '../../shared';
import type {
  TFlattenDataContext,
  TMergeContext,
  TRenameContext,
  TPickOmitContext,
} from '../models/types';
import { validateXalor } from './validate-xalor';
import { registerXalor } from './register-xalor';
import { generateXalor } from './generate-xalor';
import { transformXalor } from './transform-xalor';

class XalorCore {
  /* prettier-ignore */ public register<_K extends keyof ISolidRegistry | (string & {}), _T>(): void;
  /* prettier-ignore */ public register<_K extends keyof ISolidRegistry | (string & {})>(data: unknown): void;
  /* prettier-ignore */ public register<K extends keyof ISolidRegistry | (string & {})>(data?: unknown): void {
    return registerXalor<K>(data);
  }

  // ========================================================================
  // ========================================================================
  // VALIDATE
  // ========================================================================
  // ========================================================================
  /* prettier-ignore */ public guard<K extends keyof ISolidRegistry>(): TSolidBranded<K, TTypeGuard<ISolidRegistry[K]>> {
    return validateXalor<K, 'guard'>();
  }
  /* prettier-ignore */ public assert<K extends keyof ISolidRegistry>(data: unknown ): asserts data is ISolidRegistry[K] {
    return validateXalor<K, 'assert'>(data);
  }
  /* prettier-ignore */ public parse<K extends keyof ISolidRegistry>(data: unknown): TSolidBranded<K, ISolidRegistry[K]> {
    return validateXalor<K, 'parse'>(data);
  }
  /* prettier-ignore */ public parseAsync<K extends keyof ISolidRegistry>(data: unknown): TSolidBranded<K, Promise<ISolidRegistry[K]>> {
    return validateXalor<K, 'parseAsync'>(data);
  }
  /* prettier-ignore */ public audit<K extends keyof ISolidRegistry>(data: unknown): TXalorAuditReport {
    return validateXalor<K, 'audit'>(data);
  }
  // ========================================================================
  // ========================================================================
  // GENERATE
  // ========================================================================
  // ========================================================================
  /* prettier-ignore */ public default<K extends keyof ISolidRegistry>(): TSolidBranded<K, ISolidRegistry[K]> {
    return generateXalor<K, 'default'>();
  }
  /* prettier-ignore */ public mock<K extends keyof ISolidRegistry>(): TSolidBranded<K, ISolidRegistry[K]> {
    return generateXalor<K, 'mock'>();
  }
  /* prettier-ignore */ public clone<K extends keyof ISolidRegistry>(data: unknown): TSolidBranded<K, ISolidRegistry[K]> {
    return generateXalor<K, 'clone'>(data);
  }
  /* prettier-ignore */ public cast<K extends keyof ISolidRegistry>(data: unknown): TSolidBranded<K, ISolidRegistry[K]> {
    return generateXalor<K, 'cast'>(data);
  }
  // ========================================================================
  // ========================================================================
  // TRANSFORM
  // ========================================================================
  // ========================================================================
  // ========================================================================
  // TRANSFORM
  // ========================================================================
  /* prettier-ignore */ public pick<K extends keyof ISolidRegistry>(ctx: TPickOmitContext<K>): ISolidRegistry[K] {
    return transformXalor<K, 'pick'>(ctx);
  }
  /* prettier-ignore */ public omit<K extends keyof ISolidRegistry>(ctx: TPickOmitContext<K>): ISolidRegistry[K] {
    return transformXalor<K, 'omit'>(ctx);
  }
  /* prettier-ignore */ public rename<K extends keyof ISolidRegistry>(ctx: TRenameContext): ISolidRegistry[K] {
    return transformXalor<K, 'rename'>(ctx);
  }
  /* prettier-ignore */ public merge<K extends keyof ISolidRegistry>(ctx: TMergeContext): ISolidRegistry[K] {
    return transformXalor<K, 'merge'>(ctx);
  }
  /* prettier-ignore */ public flatten<K extends keyof ISolidRegistry>(ctx: TFlattenDataContext): Record<string, string | number | boolean> {
    return transformXalor<K, 'flatten'>(ctx);
  }
}

export const xalor = new XalorCore();
