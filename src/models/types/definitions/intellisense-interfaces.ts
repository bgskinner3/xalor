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
  /**
   * TExpandStructure — High-Fidelity Type Expansion Processor
   *
   * Forces the TypeScript Language Server (tsserver) to recursively unroll and evaluate
   * nested object intersections, interfaces, and mapping objects into a single flat definition literal.
   *
   */
  export type TExpandStructure<T> = T extends (...args: unknown[]) => unknown
    ? T
    : T extends object
      ? { [K in keyof T]: TExpandStructure<T[K]> }
      : T;

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
}

// 🧠 THE COMPILER SHIELD:
// This empty export keyword explicitly satisfies tsup's module indexing linter,
// but the 'declare global' block above ensures the interfaces escape the file sandbox!
export {};
