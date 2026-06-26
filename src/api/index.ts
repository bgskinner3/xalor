// /src/api/index.ts
import type { TTypeGuard, TSolidBranded } from '../../shared';
import {
  isRegistryKey,
  assertRegistryKey,
  assertDriftRegistryKey,
} from '../../shared';
import type { IXalorMergeContext, IXalorDriftContext } from '../models/types';
import { registerXalor } from './register';
import { transformXalorMerge } from './transform';
import { validateXalorGuard, validateXalorParse } from './validate';
import { generateXalorDefault } from './generate';
import { matchXalorDrift } from './match';
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
    assertRegistryKey(_compiledKeyReference);

    return validateXalorParse<K>(_compiledKeyReference, data);
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
    assertRegistryKey(_compiledKeyReference);

    return generateXalorDefault<K>(_compiledKeyReference);
  }
  // ========================================================================
  // ========================================================================
  // ========================================================================
  // ========================================================================
  // !! CATEGORY 4: THE TRANSFORMATION PILLAR ()
  // ========================================================================
  // ========================================================================
  // ========================================================================
  // ========================================================================
  /** @Api transform  @mode merge */
  /* prettier-ignore */ public merge<K extends keyof ISolidRegistry>(ctx: IXalorMergeContext<ISolidRegistry[K]>, _compiledKeyReference?: K): TSolidBranded<K, ISolidRegistry[K]> {
    assertRegistryKey(_compiledKeyReference);

    return transformXalorMerge<K>(_compiledKeyReference, ctx);
  }

  // ========================================================================
  // ========================================================================
  // ========================================================================
  // ========================================================================
  // !! CATEGORY 5: THE MATCHER PILLAR (ADVANCED METADATA MANIPULATION)
  // ========================================================================
  // ========================================================================
  // ========================================================================
  // ========================================================================
  /** @Api match @mode drift */
  /* prettier-ignore */
  public drift<K extends keyof ISolidDriftRegistry, R = unknown>(
    payload: unknown, 
    ctx: IXalorDriftContext<K, R>, 
    injectedKey?: K
  ): TSolidBranded<ISolidDriftRegistry[K]['activeKey'], R> {
    // 1. Hard control-flow control assertion gate to intercept typo vectors immediately (Commandment V)
    assertDriftRegistryKey(injectedKey);
    
    return  matchXalorDrift<K, R>(payload, ctx);
  }
}

export const xalor: XalorCore = new XalorCore();
