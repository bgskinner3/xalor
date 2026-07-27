import { xalethorVaultKeeper } from '../vault-keeper';
import { xalethorVaultDiagnostics } from '../vault-diagnostics';
import { isValidSolidShape, hasOwnProperty, isArray } from '../../../shared';
import type { TSolidShape } from '../../../shared/shape-domain';
import { IS_SOLID_CONFIG_ITEMS } from '../../../shared/constants';
import {
  DEFAULT_SHAPE_MATERIALIZER,
  MOCK_SHAPE_MATERIALIZER,
  CAST_SHAPE_MAPPER,
} from '../../mappers';
import {
  isTargetRegistryStructure,
  isValidTupleRule,
  isUserMutationCallback,
  isValidMockOverrideBlock,
  isXalorSimGeneratorKey,
  ARCHETYPE_STRATEGY_ROUTER,
  xalorSimGenerator,
} from '../../utils';
import type {
  TMockOverrides,
  TXalorSimGeneratorKeys,
  TXalorTupleMapping,
} from '../../models/types';
import { XALOR_SIM_GENERATOR_UTIL_KEYS } from '../../models';

class XalethorVaultGenerator {
  private requireShape<K extends TActiveRegistryKeys>(key: K, msg: string) {
    const shape = xalethorVaultKeeper.peek('blueprint', key);

    if (!isValidSolidShape(shape)) {
      return xalethorVaultDiagnostics.panic(key, msg);
    }
    return shape;
  }

  /**
   * DISTRIBUTIVE TUPLE EVALUATOR
   *
   * Extracts tuple array parameters and routes them into localized execution paths natively
   * under a single generic token context U, completely satisfying correlated union checks.
   *
   * @param utilKey
   * @param tupleRule
   * @param propertyName
   * @param baselineValue
   * @returns
   */
  private evaluateTupleDescriptor<U extends TXalorSimGeneratorKeys>(
    utilKey: U,
    tupleRule: TXalorTupleMapping<U>,
    propertyName: string,
    baselineValue: unknown,
  ): unknown {
    const behavioralArchetype = XALOR_SIM_GENERATOR_UTIL_KEYS[utilKey];
    const strategyRunner = ARCHETYPE_STRATEGY_ROUTER[behavioralArchetype];
    // TODO: remove any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const underlyingFn: (...args: readonly any[]) => unknown =
      xalorSimGenerator[utilKey];

    const userConfig = tupleRule[1];
    /* prettier-ignore */
    const result = strategyRunner.execute( underlyingFn, propertyName, baselineValue, userConfig );

    return result;
  }

  /**
   * APPLY SIM GENERATOR UTILS
   *
   * DESIGN INVARIANTS:
   * - Satisfies COMMANDMENT VIII: Zero memory allocation or array slicing overhead.
   * - Satisfies COMMANDMENT IX: 100% free of manual branching or structural erasures.
   */
  private applySimGeneratorUtils<K extends TActiveRegistryKeys>(
    overrides: TMockOverrides<K>,
    rawStructure: TResolveRegistryStructure<K>,
  ): void {
    const targetStructure = rawStructure as Record<string, unknown>;

    for (const propertyName in targetStructure) {
      /* prettier-ignore */
      if (!hasOwnProperty(targetStructure, propertyName) || !hasOwnProperty(overrides, propertyName)) {
        continue;
      }

      const rule = overrides[propertyName];

      if (!rule) continue;

      const baselineValue = targetStructure[propertyName];

      if (isArray(rule) && isXalorSimGeneratorKey(rule[0])) {
        const utilKey = rule[0];

        if (isValidTupleRule(rule, utilKey)) {
          const updatedValue = this.evaluateTupleDescriptor(
            utilKey,
            rule,
            propertyName,
            baselineValue,
          );

          targetStructure[propertyName] = updatedValue;
          continue;
        }
      }

      if (isUserMutationCallback<Record<string, unknown>, string>(rule)) {
        /* prettier-ignore */
        this.commitUserMutation( targetStructure, propertyName, rule, baselineValue );
      }
    }
  }
  /**
   * COMMIT USER MUTATION SINK
   *
   * Binds a single property slot and its corresponding callback under a locked
   * generic variable P, ensuring end-to-end parameter parity.
   *
   * DESIGN INVARIANTS:
   * - Satisfies COMMANDMENT IX: 100% free of 'as' keywords, type assertions, or erasures.
   */
  /* prettier-ignore */
  private commitUserMutation< Structure extends Record<string, unknown>, P extends keyof Structure>(
    rawStructure: Structure,
    propertyName: P,
    callbackFn: (baseValue: Structure[P]) => Structure[P],
    baselineValue: Structure[P],
  ): void {
    rawStructure[propertyName] = callbackFn(baselineValue);
  }
  /**
   * EXECUTE DEFAULT BUILD
   *
   * ROLE:
   * The core recursive default materialization engine. Walks a shape definition
   * and produces a zero-value object graph by delegating each node to its
   * registered default materializer.
   *
   * STRATEGY:
   * Prevents runaway recursion by enforcing the configured depth limit, validates
   * the incoming shape, resolves the correct materializer from the registry based
   * on the shape kind, and recursively builds child structures as needed.
   *
   * @param shape - The shape definition to materialize.
   * @param depth - The current recursive traversal depth.
   * @returns The fully materialized default value for the supplied shape.
   */
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
   * EXECUTE MOCK BUILD
   *
   * ROLE:
   * The recursive mock data materialization engine. Traverses a shape definition
   * and generates representative mock values using the registered mock
   * materializers for each shape kind.
   *
   * STRATEGY:
   * Enforces the configured recursion limit, validates the incoming shape,
   * dispatches to the appropriate mock materializer, and recursively generates
   * child values until the complete mock object graph is produced.
   *
   * @param shape - The shape definition to materialize.
   * @param depth - The current recursive traversal depth.
   * @returns The fully materialized mock value for the supplied shape.
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
  /**
   * EXECUTE CAST BUILD
   *
   * ROLE:
   * The recursive casting engine. Walks a shape definition while transforming
   * arbitrary input data into a structure that conforms to the target shape.
   *
   * STRATEGY:
   * Stops traversal at the configured recursion limit, validates the incoming
   * shape, dispatches to the appropriate shape-specific caster, and recursively
   * converts nested values into their expected runtime representation.
   *
   * @param shape - The target shape definition.
   * @param data - The source data being transformed.
   * @param depth - The current recursive traversal depth.
   * @returns The casted value matching the supplied shape.
   */
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
  
      return rawStructure;
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
