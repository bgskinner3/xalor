import { xalethorVaultKeeper } from './vault-keeper';
import {
  markAsSolid,
  // executeMockBuild,
  produceCast,
  // executeDefaultBuild,
} from '../utils';
import { isValidSolidShape } from '../../shared';
import type { TSolidBranded } from '../../shared/types/utility';
import type { TSolidShape } from '../../shared/shape-domain';
import { xalethorVaultDiagnostics } from './vault-diagnostics';
import { IS_SOLID_CONFIG_ITEMS } from '../../shared/constants';
import {
  DEFAULT_SHAPE_MATERIALIZER,
  MOCK_SHAPE_MATERIALIZER,
  // CAST_SHAPE_MAPPER,
} from '../mappers';
import { isRecord } from '../../shared';
/**
;
 */
function isTargetRegistryStructure<K extends TActiveRegistryKeys>(
  payload: unknown,
): payload is TResolveRegistryStructure<K> {
  return isRecord(payload);
}
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
  private executeDefaultBuild = (shape: TSolidShape, depth = 0): unknown => {
    if (depth >= IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth) {
      return null;
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
  private executeMockBuild = (shape: TSolidShape, depth = 0): unknown => {
    if (depth >= IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth) {
      return null;
    }
    if (!shape) return undefined;

    const executeMaterializer = <K extends TSolidShape['kind']>(
      kind: K,
      targetShape: Extract<TSolidShape, { kind: K }>,
    ): unknown => {
      const materializer = MOCK_SHAPE_MATERIALIZER[kind];
      return materializer(targetShape, depth, this.executeMockBuild);
    };

    return executeMaterializer(shape.kind, shape);
  };
  // export function produceCast(
  //   shape: TSolidShape,
  //   data: unknown,
  //   depth = 0,
  // ): unknown {
  //   if (depth >= IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth) {
  //     return data;
  //   }
  //   if (!shape) return data;

  //   const executeCastMaterializer = <K extends TSolidShape['kind']>(
  //     kind: K,
  //     targetShape: Extract<TSolidShape, { kind: K }>,
  //   ): unknown => {
  //     const caster = CAST_SHAPE_MAPPER[kind];
  //     return caster(targetShape, data, depth, produceCast);
  //   };

  //   return executeCastMaterializer(shape.kind, shape);
  // }
  /* prettier-ignore */
  // private executeCastBuild = (shape: TSolidShape,  data: unknown, depth = 0): unknown => {
  //   if (depth >= IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth) {
  //     return null;
  //   }
  //   if (!shape) return undefined;

  //   const executeMaterializer = <K extends TSolidShape['kind']>(
  //     kind: K,
  //     targetShape: Extract<TSolidShape, { kind: K }>,
  //   ): unknown => {
  //     const caster = CAST_SHAPE_MAPPER[kind];
  //     return caster(targetShape, data, depth, produceCast);
  //   };

  //   return executeMaterializer(shape.kind, shape);
  // };

  // ============================================================
  // ============================================================
  // ============================================================

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
   * GET MOCK
   *
   * ROLE: The "Simulacrum."
   * Generates realistic, randomized data structures including optional
   * fields and variable array lengths for testing and prototyping.
   *
   * @param key - The unique identifier of the type in the Registry.
   * @returns {TResolveRegistryStructure<K>} - A randomized, branded instance of the type.
   */
  public getMockRaw<K extends TActiveRegistryKeys>(
    key: K,
  ): TResolveRegistryStructure<K> {
    /* prettier-ignore */
    const shape = this.requireShape<K>( key, 'Generation failed: Blueprint missing from Vault.');

    const rawStructure = this.executeMockBuild(shape, 0);

    // Structural boundary check narrowing target generic output naturally via native type guards
    if (isTargetRegistryStructure<K>(rawStructure)) {
      return rawStructure;
    }
    /* prettier-ignore */
    return xalethorVaultDiagnostics.panic( key, `[xalor] Materialized mock payload did not conform to an object structure for key: ${key}`);
  }

  // ============================================================
  // ============================================================
  // ============================================================
  // DEPREACTEDD

  /**
   * GET_CAST
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
  public getCast<K extends TActiveRegistryKeys>(
    data: unknown,
    key: K,
  ): TSolidBranded<K, TResolveRegistryStructure<K>> {
    /* prettier-ignore */
    const shape = this.requireShape(key, 'Coercion failed: Blueprint missing from Vault.');

    const castedData = produceCast(shape, data);

    if (markAsSolid<K, TResolveRegistryStructure<K>>(castedData)) {
      return castedData;
    }

    throw new Error(
      `[xalor] Failed to brand coerced data layout container for key: ${key}`,
    );
  }
}

export const xalethorVaultGenerator = new XalethorVaultGenerator();
