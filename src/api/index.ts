// /src/api/index.ts
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
  // ========================================================================
  // ========================================================================
  // VALIDATE
  // ========================================================================
  // ========================================================================
  /**
   * @Api register
   * @mode register
   */
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
  /** @Api validation  @mode guard */
  /* prettier-ignore */ public guard<K extends keyof ISolidRegistry>(): TSolidBranded<K, TTypeGuard<ISolidRegistry[K]>>;
  /* prettier-ignore */ public guard<K extends keyof ISolidRegistry>(injectedKey?: K, mode?: 'guard' ): TSolidBranded<K, TTypeGuard<ISolidRegistry[K]>> {
    return validateXalor<K, 'guard'>(injectedKey!, mode!);
  }
  /** @Api validation  @mode assert */
  /* prettier-ignore */ public assert<K extends keyof ISolidRegistry>(data: unknown): asserts data is ISolidRegistry[K];
  /* prettier-ignore */ public assert<K extends keyof ISolidRegistry>(data: unknown, injectedKey?: K, mode?: 'assert'): asserts data is ISolidRegistry[K] {
    validateXalor<K, 'assert'>(injectedKey!, mode!, data);
  }
  /** @Api validation  @mode parse */
  /* prettier-ignore */ public parse<K extends keyof ISolidRegistry>(data: unknown): TSolidBranded<K, ISolidRegistry[K]>;
  /* prettier-ignore */ public parse<K extends keyof ISolidRegistry>(data: unknown, injectedKey?: K, mode?: 'parse'): TSolidBranded<K, ISolidRegistry[K]> {
    return validateXalor<K, 'parse'>(injectedKey!, mode!, data);
  }
  /** @Api validation  @mode parseAsync */
  /* prettier-ignore */ public parseAsync<K extends keyof ISolidRegistry>(data: unknown): TSolidBranded<K, Promise<ISolidRegistry[K]>>;
  /* prettier-ignore */ public parseAsync<K extends keyof ISolidRegistry>(data: unknown, injectedKey?: K, mode?: 'parseAsync'): TSolidBranded<K, Promise<ISolidRegistry[K]>> {
    return validateXalor<K, 'parseAsync'>(injectedKey!, mode!, data);
  }
  /** @Api validation  @mode audit */
  /* prettier-ignore */ public audit<_K extends keyof ISolidRegistry>(data: unknown): TXalorAuditReport;
  /* prettier-ignore */ public audit<K extends keyof ISolidRegistry>(data: unknown, injectedKey?: K, mode?: 'audit'): TXalorAuditReport {
    return validateXalor<K, 'audit'>(injectedKey!, mode!, data);
  }
  // ========================================================================
  // ========================================================================
  // GENERATE
  // ========================================================================
  // ========================================================================
  /** @Api generator  @mode default */
  /* prettier-ignore */ public default<K extends keyof ISolidRegistry>(): TSolidBranded<K, ISolidRegistry[K]>;
  /* prettier-ignore */ public default<K extends keyof ISolidRegistry>(injectedKey?: K, mode?: 'default'): TSolidBranded<K, ISolidRegistry[K]> {
    return generateXalor<K, 'default'>(injectedKey!, mode!);
  }
  /** @Api generator  @mode mock */
  /* prettier-ignore */ public mock<K extends keyof ISolidRegistry>(): TSolidBranded<K, ISolidRegistry[K]>;
  /* prettier-ignore */ public mock<K extends keyof ISolidRegistry>(injectedKey?: K, mode?: 'mock'): TSolidBranded<K, ISolidRegistry[K]> {
    return generateXalor<K, 'mock'>(injectedKey!, mode!);
  }
  /** @Api generator  @mode clone */
  /* prettier-ignore */ public clone<K extends keyof ISolidRegistry>(data: unknown): TSolidBranded<K, ISolidRegistry[K]>;
  /* prettier-ignore */ public clone<K extends keyof ISolidRegistry>(data: unknown,injectedKey?: K,mode?: 'clone'): TSolidBranded<K, ISolidRegistry[K]> {
    return generateXalor<K, 'clone'>(injectedKey!, mode!, data);
  }
  /** @Api generator  @mode cast */
  /* prettier-ignore */ public cast<K extends keyof ISolidRegistry>(data: unknown): TSolidBranded<K, ISolidRegistry[K]>;
  /* prettier-ignore */ public cast<K extends keyof ISolidRegistry>(data: unknown,injectedKey?: K,mode?: 'cast'): TSolidBranded<K, ISolidRegistry[K]> {
    return generateXalor<K, 'cast'>(injectedKey!, mode!, data);
  }
  // ========================================================================
  // ========================================================================
  // TRANSFORM
  // ========================================================================
  // ========================================================================

  /** @Api transform  @mode pick */
  /* prettier-ignore */ public pick<K extends keyof ISolidRegistry>(ctx: TPickOmitContext<K>): ISolidRegistry[K];
  /* prettier-ignore */ public pick<K extends keyof ISolidRegistry>(ctx: TPickOmitContext<K>,injectedKey?: K,mode?: 'pick'): ISolidRegistry[K] {
    return transformXalor<K, 'pick'>(injectedKey!, mode!, ctx);
  }

  /** @Api transform  @mode omit */
  /* prettier-ignore */ public omit<K extends keyof ISolidRegistry>(ctx: TPickOmitContext<K>): ISolidRegistry[K];
  /* prettier-ignore */ public omit<K extends keyof ISolidRegistry>(ctx: TPickOmitContext<K>,injectedKey?: K,mode?: 'omit'): ISolidRegistry[K] {
    return transformXalor<K, 'omit'>(injectedKey!, mode!, ctx);
  }

  /** @Api transform  @mode rename */
  /* prettier-ignore */ public rename<K extends keyof ISolidRegistry>(ctx: TRenameContext): ISolidRegistry[K];
  /* prettier-ignore */ public rename<K extends keyof ISolidRegistry>(ctx: TRenameContext,injectedKey?: K,mode?: 'rename'): ISolidRegistry[K] {
    return transformXalor<K, 'rename'>(injectedKey!, mode!, ctx);
  }

  /** @Api transform  @mode merge */
  /* prettier-ignore */ public merge<K extends keyof ISolidRegistry>(ctx: TMergeContext): ISolidRegistry[K];
  /* prettier-ignore */ public merge<K extends keyof ISolidRegistry>(ctx: TMergeContext,injectedKey?: K,mode?: 'merge'): ISolidRegistry[K] {
    return transformXalor<K, 'merge'>(injectedKey!, mode!, ctx);
  }

  /** @Api transform  @mode flatten */
  /* prettier-ignore */ public flatten<_K extends keyof ISolidRegistry>(ctx: TFlattenDataContext): Record<string, string | number | boolean>;
  /* prettier-ignore */ public flatten<K extends keyof ISolidRegistry>(ctx: TFlattenDataContext,injectedKey?: K,mode?: 'flatten'): Record<string, string | number | boolean> {
    return transformXalor<K, 'flatten'>(injectedKey!, mode!, ctx);
  }
}

export const xalor: XalorCore = new XalorCore();
