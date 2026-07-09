/**
 * 🪐 THE UNIVERSAL GLOBAL AMBIENT SHELLS
 *
 * ROLE:
 * Registers the placeholder interfaces directly into the global execution scope.
 * This establishes a single, universal, zero-import registry shared identically
 * by your core engine files, your user's application, and your auto-generated emitters!
 */
declare global {
  /**
   * XalorCyclicToken
   * 🪐 GLOBAL RECURSIVE METADATA SHIELD
   *
   * ROLE:
   * Acts as an opaque structural wrapper tracking cyclic loop boundaries
   * point-free inside generated Intellisense bridges without crashing compilation.
   */
  export type TXalorCyclicToken<T extends string> = {
    readonly __xalor_cyclic_marker__: true;
    readonly __target_type_name__: T;
  };
  // ==================================================================
  // ==================================================================
  // ==================================================================
  /**
   * TExpandStructure — High-Fidelity Type Expansion Processor
   *
   * Forces the TypeScript Language Server (tsserver) to recursively unroll and evaluate
   * nested object intersections, interfaces, and mapping objects into a single flat definition literal.
   *
   */
  /* prettier-ignore */
  export type TExpandStructure<T, Visited = never> = 
  T extends Visited ? T :
  T extends { subCategories?: readonly unknown[] } ? T :
  T extends (...args: infer Args) => infer Ret ? (...args: { [I in keyof Args]: TExpandStructure<Args[I], Visited | T> }) => TExpandStructure<Ret, Visited | T> :
  T extends Date ? Date :
  T extends RegExp ? RegExp :
  T extends URL ? URL :
  T extends URLSearchParams ? URLSearchParams :
  T extends Headers ? Headers :
  T extends Request ? Request :
  T extends Response ? Response :
  T extends Blob ? Blob :
  T extends File ? File :
  T extends Error ? Error :
  T extends Map<unknown, unknown> ? Map<unknown, unknown> :
  T extends Set<unknown> ? Set<unknown> :
  T extends WeakMap<object, unknown> ? WeakMap<object, unknown> :
  T extends WeakSet<object> ? WeakSet<object> :
  T extends ArrayBuffer ? ArrayBuffer :
  T extends DataView ? DataView :
  T extends Int8Array ? Int8Array :
  T extends Uint8Array ? Uint8Array :
  T extends Uint8ClampedArray ? Uint8ClampedArray :
  T extends Int16Array ? Int16Array :
  T extends Uint16Array ? Uint16Array :
  T extends Int32Array ? Int32Array :
  T extends Uint32Array ? Uint32Array :
  T extends Float32Array ? Float32Array :
  T extends Float64Array ? Float64Array :
  T extends BigInt64Array ? BigInt64Array :
  T extends BigUint64Array ? BigUint64Array :
  T extends Promise<infer P> ? Promise<TExpandStructure<P, Visited | T>> :
  T extends ReadableStream ? ReadableStream :
  T extends WritableStream ? WritableStream :
  T extends TransformStream ? TransformStream :
  T extends object ? { [K in keyof T]: TExpandStructure<T[K], Visited | T> } :
  T;

  /**
   * 🪐 PRODUCTION-RESILIENT KEY CHECKER
   * Filters out prototype strings to prevent key lookup assignment pollution.
   */
  export type TActiveRegistryKeys = object extends ISolidRegistry
    ? string
    : Extract<keyof ISolidRegistry, string>;

  /**
   * 🪐 THE RESILIENT LAYER COMPOSER
   *
   * LAWS OF GEOMETRY:
   * 1. DEVELOPMENT: Routes shapes straight through the TExpandStructure funnel, forcing
   *    the editor to print out the explicit, unrolled structural properties.
   * 2. PRODUCTION: Switches smoothly to a safe fallback layout when ghost bridges are wiped.
   */
  export type TResolveRegistryStructure<K extends string> =
    object extends ISolidRegistry
      ? Record<string, unknown>
      : K extends keyof ISolidRegistry
        ? TExpandStructure<ISolidRegistry[K]>
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { [P in keyof any]: any };

  // ==================================================================
  // ==================================================================
  // ==================================================================
  /**
   * 🔗 ISOLID IDENTITY
   *
   * Stores the "Nominal" link (the import path) to the original interface.
   * This allows the IDE to show 'User' instead of raw structures.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface ISolidIdentity {
    /* The auto-generated solid-env.d.ts will merge nominal paths here natively */
  }
  /**
   * 🗄️ ISOLID REGISTRY
   *
   * The master manifest for all solidified types in the project.
   *
   * This interface acts as an ambient "Shell." The Miner (Transformer)
   * leverages TypeScript's Declaration Merging to dynamically inject
   * string keys and their corresponding TypeScript interfaces here
   * during the build process. This architecture enables zero-import
   * autocomplete and type-safety across the entire workspace.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface ISolidRegistry {
    /* The auto-generated solid-env.d.ts will merge properties here natively */
  }

  /**
   * 🚀 THE AUTHORITATIVE DRIFT LIFECYCLE REGISTRY
   * Centralizes multi-generational contract links into a single source of truth.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface ISolidDriftRegistry {
    /* The auto-generated solid-env.d.ts will merge properties here natively */
  }
}

// 🧠 THE COMPILER SHIELD:
// This empty export keyword explicitly satisfies tsup's module indexing linter,
// but the 'declare global' block above ensures the interfaces escape the file sandbox!
export {};
