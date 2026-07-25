// /src/api/index.ts
import type { TTypeGuard, TSolidBranded } from '../../shared';
import { isRegistryKey } from '../../shared';
import type {
  IXalorDriftContext,
  TApplyNominalBrand,
  TResolveDriftReturnConstraint,
} from '../models/types';
import { registerXalor } from './register';
import { transformXalorMerge, generateXalorClone } from './transform';
import {
  validateXalorGuard,
  validateXalorParse,
  validateXalorSafeParse,
} from './validate';
import {
  generateXalorDefault,
  generateXalorMock,
  generateXalorCast,
} from './generate';
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
  public register = registerXalor;
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
  /* prettier-ignore */ public guard<K extends TActiveRegistryKeys>(): TSolidBranded<K, TTypeGuard<TResolveRegistryStructure<K>>>;
  /* prettier-ignore */ public guard<K extends TActiveRegistryKeys>( data: unknown): data is TResolveRegistryStructure<K>
  public guard<K extends TActiveRegistryKeys>(
    keyOrPayload?: K | unknown,
    dataKey?: K,
  ): boolean | TSolidBranded<K, TTypeGuard<TResolveRegistryStructure<K>>> {
    const isProperKey = isRegistryKey<K>(keyOrPayload);
    const finalKey = isProperKey ? keyOrPayload : dataKey;

    const activeGuard = validateXalorGuard<K>(finalKey);

    if (!isProperKey) return activeGuard(keyOrPayload);

    return activeGuard;
  }

  /** @Api validation  @mode parse */
  public parse = validateXalorParse;

  /** @Api validation  @mode safeParse */
  public safeParse = validateXalorSafeParse;
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
  public default = generateXalorDefault;

  /** @Api generator  @mode mock */
  public mock = generateXalorMock;

  /** @Api generator  @mode cast */
  public cast = generateXalorCast;

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
  public merge = transformXalorMerge;
  /** @Api transform  @mode clone */
  public clone = generateXalorClone;

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
  public drift<
    /* prettier-ignore */ K extends keyof ISolidDriftRegistry,
    /* prettier-ignore */ R extends TResolveDriftReturnConstraint<K> = TResolveDriftReturnConstraint<K>,
  >(
    payload: unknown,
    ctx: IXalorDriftContext<K, R>,
    injectedKey?: K,
  ): TApplyNominalBrand<R> {
    return matchXalorDrift<K, R>(payload, ctx, injectedKey);
  }
}

/**
 * XALOR FRAMEWORK RUNTIME ANCHOR
 *
 * Central engine instance exposing the un-curried public API gateway matrix.
 *
 * CURRENT PERIMETER PORTS:
 * 1. register   - Blueprint Manifestation Ingress [Generation]
 * 2. guard      - Nominal Cryptographic Trait Examiner [Match]
 * 3. parse      - Structural Shape Validation Enforcement [Match]
 * 4. default    - Primitive Safe Layout Initializer [Generation]
 * 5. merge      - High-Velocity Deep Object Mutation [Transform]
 * 6. clone      - Circular-Safe Structural Sanitation [Transform]
 * 7. drift      - Multi-Generation Upcast Migration Channel [Match]
 * 8. mock.      -
 * 9. cast       -
 * 10.safeParse. -
 */
export const xalor: XalorCore = new XalorCore();
