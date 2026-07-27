import { xalethorVaultKeeper } from '../vault-keeper';
import { xalethorVaultDiagnostics } from '../vault-diagnostics';
import { isValidSolidShape, hasOwnProperty } from '../../../shared';
import type { TSolidShape } from '../../../shared/shape-domain';
import { IS_SOLID_CONFIG_ITEMS } from '../../../shared/constants';
import {
  DEFAULT_SHAPE_MATERIALIZER,
  MOCK_SHAPE_MATERIALIZER,
  CAST_SHAPE_MAPPER,
} from '../../mappers';
import {
  isTargetRegistryStructure,
  isUserMutationCallback,
  isValidMockOverrideBlock,
  ARCHETYPE_STRATEGY_ROUTER,
  xalorSimGenerator,
} from '../../utils';
import type {
  TMockOverrides,
  TXalorSimGeneratorKeys,
  TArchTypePureKeys,
  TArchTypeContextualKeys,
  TArchTypeTransformerKeys,
  TXalorTupleMapping,
} from '../../models/types';
import { XALOR_SIM_GENERATOR_UTIL_KEYS } from '../../models';

/**
 * XALETHOR VAULT GENERATOR
 *
 * ROLE:
 * The "Factory." It uses Blueprints to materialize brand-new
 * JavaScript objects from thin air.
 *
 * WHAT GOES HERE:
 * - 'getDefault' materialization.
 * - Mocking, Templating, and Data Casting.
 * - Sanitization logic (cloning objects to strip extra keys).
 *
 * WHAT DOES NOT GO HERE:
 * - NO Validation (Factories don't inspect; they build).
 * - NO GPS or Traceability logic.
 * - NO Disk persistence.
 */
class XalethorVaultGenerator {
  private requireShape<K extends TActiveRegistryKeys>(key: K, msg: string) {
    const shape = xalethorVaultKeeper.peek('blueprint', key);

    if (!isValidSolidShape(shape)) {
      return xalethorVaultDiagnostics.panic(key, msg);
    }
    return shape;
  }

  private evaluateTupleDescriptor<U extends TXalorSimGeneratorKeys>(
    utilKey: U,
    tupleRule: TXalorTupleMapping<U>,
    propertyName: string,
    baselineValue: unknown,
  ): unknown {
    const behavioralArchetype = XALOR_SIM_GENERATOR_UTIL_KEYS[utilKey];
    const strategyRunner = ARCHETYPE_STRATEGY_ROUTER[behavioralArchetype];

    if (behavioralArchetype === 'pure') {
      const fn = xalorSimGenerator[utilKey as TArchTypePureKeys];

      // Index 1 safely extracts the user configuration object from the tuple array if present
      const userConfig = (tupleRule as readonly unknown[])[1];

      const packedArgs = (userConfig !== undefined
        ? Object.freeze([userConfig])
        : Object.freeze([])) as unknown as readonly unknown[];

      return strategyRunner.executePure(fn, packedArgs);
    }

    if (behavioralArchetype === 'contextual') {
      const fn = xalorSimGenerator[utilKey as TArchTypeContextualKeys];
      return strategyRunner.executeContextual(fn, propertyName);
    }

    if (behavioralArchetype === 'transformer') {
      const fn = xalorSimGenerator[utilKey as TArchTypeTransformerKeys];
      const stringBaseline =
        typeof baselineValue === 'string' ? baselineValue : '';

      // Index 1 contains your transformer configuration options payload natively
      const userConfig = (tupleRule as readonly unknown[])[1];

      return strategyRunner.executeTransformer(fn, stringBaseline, userConfig);
    }

    return '';
  }
  private applySimGeneratorUtils<K extends TActiveRegistryKeys>(
    overrides: TMockOverrides<K>,
    rawStructure: TResolveRegistryStructure<K>,
  ): void {
    const targetStructure = rawStructure as Record<string, unknown>;

    for (const propertyName in targetStructure) {
      if (
        !hasOwnProperty(targetStructure, propertyName) ||
        !hasOwnProperty(overrides, propertyName)
      ) {
        continue;
      }

      const rule = overrides[propertyName];
      if (!rule) {
        continue;
      }

      const baselineValue = targetStructure[propertyName];

      // 🎯 Case A: Tuple Descriptor Array Match
      if (Array.isArray(rule)) {
        // Index 0 is always your deterministic utility identifier string token key
        const utilKey = rule[0] as TXalorSimGeneratorKeys;

        const updatedValue = this.evaluateTupleDescriptor(
          utilKey,
          rule as unknown as TXalorTupleMapping<typeof utilKey>,
          propertyName,
          baselineValue,
        );

        targetStructure[propertyName] = updatedValue;
        continue;
      }

      // 🎯 Case B: Standard Custom Developer Callbacks
      if (isUserMutationCallback<Record<string, unknown>, string>(rule)) {
        this.commitUserMutation(
          targetStructure,
          propertyName,
          rule,
          baselineValue,
        );
      }
    }
  }

  private commitUserMutation<
    Structure extends Record<string, unknown>,
    P extends keyof Structure,
  >(
    rawStructure: Structure,
    propertyName: P,
    callbackFn: (baseValue: Structure[P]) => Structure[P],
    baselineValue: unknown,
  ): void {
    // TypeScript perfectly verifies that the input and output align with the structural key slot
    rawStructure[propertyName] = callbackFn(baselineValue as Structure[P]);
  }

  public executeDefaultBuild = (shape: TSolidShape, depth = 0): unknown => {
    if (depth >= IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth) {
      return {};
    }
    if (!shape) return undefined;

    const executeMaterializer = <K extends TSolidShape['kind']>(
      kind: K,
      targetShape: Extract<TSolidShape, { kind: K }>,
    ): unknown => {
      const materializer = DEFAULT_SHAPE_MATERIALIZER[kind];
      return materializer(targetShape, depth, this.executeDefaultBuild);
    };

    return executeMaterializer(shape.kind, shape);
  };

  /**
   * executeMockBuild
   *
   *
   *
   * @param shape
   * @param depth
   * @returns
   */
  public executeMockBuild = (shape: TSolidShape, depth = 0): unknown => {
    if (depth >= IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth) return {};
    if (!shape) return {};

    const executeMaterializer = <K extends TSolidShape['kind']>(
      kind: K,
      targetShape: Extract<TSolidShape, { kind: K }>,
    ): unknown => {
      const materializer = MOCK_SHAPE_MATERIALIZER[kind];
      return materializer(targetShape, depth, this.executeMockBuild);
    };

    return executeMaterializer(shape.kind, shape);
  };

  /* prettier-ignore */
  public executeCastBuild = (shape: TSolidShape,  data: unknown, depth = 0): unknown => {
    if (depth >= IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth) {
      return null;
    }
    if (!shape) return undefined;

    const executeMaterializer = <K extends TSolidShape['kind']>(
      kind: K,
      targetShape: Extract<TSolidShape, { kind: K }>,
    ): unknown => {
      const caster = CAST_SHAPE_MAPPER[kind];
      return caster(targetShape, data, depth, this.executeCastBuild);
    };

    return executeMaterializer(shape.kind, shape);
  };

  // ============================================================
  // ============================================================
  // ============================================================
  // PUBLCI METHODS
  // ============================================================
  // ============================================================
  // ============================================================
  /**
   * GET DEFAULT RAW
   *
   * ROLE:
   * The "3D Printer Core." Converts static structural blueprints into physical,
   * clean, zero-value data skeletons.
   *
   * STRATEGY:
   * Resolves the target configuration blueprint from the immutable vault keeper,
   * kicks off the deep recursive default compilation engine at frame zero, and
   * narrows the resulting layout structure natively using assertion-free type guards.
   *
   * @typeParam K - The unique active identity token string registered within the system vault.
   * @param key - The unique authoritative key string identifier of the target type contract.
   * @returns {TResolveRegistryStructure<K>} A pristine, unbranded data layout skeleton.
   */
  public getDefaultRaw<K extends TActiveRegistryKeys>(
    key: K,
  ): TResolveRegistryStructure<K> {
    /* prettier-ignore */
    const shape =  this.requireShape<K>( key, 'Generation failed: Blueprint missing from Vault.');

    const rawStructure = this.executeDefaultBuild(shape, 0);

    // Pure evaluation path checking; zero 'as' tokens used.
    if (isTargetRegistryStructure<K>(rawStructure)) return rawStructure;
    /* prettier-ignore */
    return xalethorVaultDiagnostics.panic( key, `[xalor] Materialized payload did not conform to an object structure.`);
  }

  /**
   * GET MOCK RAW
   *
   * ROLE:
   * The "Simulacrum." Generates highly realistic, randomized prototype data structures
   * that respect your static limits while introducing controlled entropy.
   *
   * STRATEGY:
   * Resolves the structural blueprint node, passes the graph directly into the
   * high-speed simulation runner map, and lazily populates collections and field primitives
   * without creating duplicate local intermediate array allocations.
   *(parameter) overrides: TMockOverrides<K extends keyof ISolidRegistry ? TExpandStructure<ISolidRegistry[K], never> : Record<string, any>>
   * @typeParam K - The unique active identity token string registered within the system vault.
   * @param key - The unique authoritative key string identifier of the target type contract.
   * @returns {TResolveRegistryStructure<K>} A randomized, unbranded data layout instance container.
   */
  public getMockRaw<K extends TActiveRegistryKeys>(
    key: K,
    overrides?: TMockOverrides<K>,
  ): TResolveRegistryStructure<K> {
    /* prettier-ignore */
    const shape = this.requireShape<K>( key, 'Generation failed: Blueprint missing from Vault.');

    const rawStructure = this.executeMockBuild(shape, 0);

    /* prettier-ignore */
    // Boundary confirmation checks match against your type guards cleanly
    if (overrides && isValidMockOverrideBlock<K>(overrides) && isTargetRegistryStructure<K>(rawStructure)) {
      this.applySimGeneratorUtils<K>(overrides, rawStructure);
      
      // return rawStructure;
    }
    // Structural boundary check narrowing target generic output naturally via native type guards
    if (isTargetRegistryStructure<K>(rawStructure)) {
      return rawStructure;
    }
    /* prettier-ignore */
    return xalethorVaultDiagnostics.panic( key, `[xalor] Materialized mock payload did not conform to an object structure for key: ${key}`);
  }
  /**
   * GET_CAST_RAW
   *
   * ROLE:
   * Coerces loose runtime input payloads into the exact structural and
   * primitive types demanded by your type blueprint contracts.
   * (e.g., safely turning the string "123" into the primitive number 123).
   *
   * STRATEGY:
   * Resolves the target configuration blueprint, pipes execution into the
   * exhaustive O(1) casting dictionary, and applies a protective nominal brand tag.
   */
  /* prettier-ignore */
  public getCastRaw<K extends TActiveRegistryKeys>(data: unknown, key: K): TResolveRegistryStructure<K> {
        /* prettier-ignore */
    const shape = this.requireShape(key, 'Generation failed: Blueprint missing from Vault.');
    const rawStructure = this.executeCastBuild(shape, data, 0);

    // Structural boundary check narrowing target generic output naturally via native type guards
    if (isTargetRegistryStructure<K>(rawStructure)) {
      return rawStructure;
    }
    /* prettier-ignore */
    return xalethorVaultDiagnostics.panic( key, `[xalor] Materialized cast payload did not conform to an object structure for key: ${key}`);
  }
}

export const xalethorVaultGenerator = new XalethorVaultGenerator();
