// /src/api/index.ts
import type { TTypeGuard, TSolidBranded } from '../../shared';
import { isRegistryKey, assertRegistryKey } from '../../shared';
import type {
  TFlattenDataContext,
  TMergeContext,
  TPickOmitContext,
} from '../models/types';
import { registerXalor } from './register';
import { generateXalor } from './generate-xalor';
import { transformXalor } from './transform';
import { validateXalorGuard, validateXalorParse } from './validate';
import { generateXalorDefault } from './generate';
class XalorCore {
  // ========================================================================
  // ========================================================================
  // !! CORE OPERATIONS: SYSTEM INGRESS REGISTRATION
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
  // ========================================================================
  // ========================================================================
  // !! CATEGORY 2: THE VALIDATION PILLAR (INGRESS SECURITY)
  // ========================================================================
  // ========================================================================
  // ========================================================================
  // ========================================================================
  /** @Api validation  @mode guard */
  /* prettier-ignore */ public guard<K extends keyof ISolidRegistry>(): TSolidBranded<K, TTypeGuard<ISolidRegistry[K]>>;
  /* prettier-ignore */ public guard<K extends keyof ISolidRegistry>( data: unknown): data is ISolidRegistry[K]
  /* prettier-ignore */ public guard<K extends keyof ISolidRegistry>( keyOrPayload?: K | unknown, dataKey?: K): boolean | TSolidBranded<K, TTypeGuard<ISolidRegistry[K]>> {
    const isProperKey = isRegistryKey<K>(keyOrPayload);
    const finalKey = isProperKey ? keyOrPayload : dataKey;

    assertRegistryKey(finalKey);

    const activeGuard = validateXalorGuard<K>(finalKey);

    if (!isProperKey) return activeGuard(keyOrPayload);

    return activeGuard;
  }
  /** @Api validation  @mode parse */
  /* prettier-ignore */ public parse<K extends keyof ISolidRegistry>(data: unknown, _compiledKeyReference?: K): TSolidBranded<K, ISolidRegistry[K]> {
    const activeKey = _compiledKeyReference;

    assertRegistryKey(activeKey);

    return validateXalorParse<K>(activeKey, data);
  }
  // ========================================================================
  // ========================================================================
  // ========================================================================
  // ========================================================================
  // !! CATEGORY 3: THE GENERATION PILLAR (BLANK-SLATE HYDRATION)
  // ========================================================================
  // ========================================================================
  // ========================================================================
  // ========================================================================

  /** @Api generator  @mode default */
  /* prettier-ignore */
  public default<K extends keyof ISolidRegistry>(_compiledKeyReference?: K): TSolidBranded<K, ISolidRegistry[K]> {
    const activeKey = _compiledKeyReference;
    assertRegistryKey(activeKey);
    return generateXalorDefault<K>(activeKey);
  }
  // ========================================================================
  // ========================================================================
  // ========================================================================
  // ========================================================================
  // !! CATEGORY 4: THE TRANSFORMATION PILLAR (BLANK-SLATE HYDRATION)
  // ========================================================================
  // ========================================================================
  // ========================================================================
  // ========================================================================

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
