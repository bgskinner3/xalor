declare global {
  interface ISolidRegistry {
    // VALIDATE TEST DEFINITIONS
    USER_TEST: {
      id: number;
      username: string;
      active: boolean;
    };
    API_RESPONSE: {
      status: 'success' | 'failed' | number;
    };
    STORE_ORDER: {
      orderId: string;
      items: {
        SKU: string;
        quantity: number;
      }[];
    };
  }
}

export {};

// import { IS_SOLID_CONFIG_ITEMS } from '../../shared';
// import { TReifyCTX } from '../../transformer/types';

// /**
//  * 🛠️ CREATE TEST REIFY CTX
//  * Generates a clean slate for the Miner's recursive loop during unit tests.
//  */
// export function createTestReifyCtx(
//   overrides: Partial<TReifyCTX> = {},
// ): TReifyCTX {
//   return {
//     depth: 0,
//     maxDepth: IS_SOLID_CONFIG_ITEMS.reifyLimit.maxDepth,
//     fragments: new Map(),
//     parentKey: 'test-root',
//     seen: new Set(),
//     ...overrides,
//   };
// }
// import ts from 'typescript';
// import { UTIL_CONFIG_OPTIONS } from './constants';
// /**
//  * TEST UTILITY: Virtual Compiler Host
//  *
//  * This function creates a transient, in-memory TypeScript environment to
//  * extract real `ts.Type` objects from raw strings. It is essential for
//  * unit testing Reifiers without the overhead of a full filesystem build.
//  *
//  * **!!!!How it works:!!!!!!
//  * 1. VIRTUAL FILE: It creates a 'Virtual SourceFile' from your test string.
//  * 2. CUSTOM HOST: It overrides the standard Compiler Host to intercept file
//  *    requests. When the compiler asks for 'test.ts', we hand it our in-memory
//  *    file instead of checking the disk.
//  * 3. PROGRAM BOOTSTRAP: It initializes a `ts.Program` using this custom host.
//  * 4. TYPE EXTRACTION: It locates the first `interface` or `type` alias in the
//  *    code and uses the `TypeChecker` to resolve it into a live Type object.
//  *
//  * @param sourceCode - A string of TS code (e.g., 'interface User { id: string }')
//  * @returns { type: ts.Type, checker: ts.TypeChecker }
//  */
// export function reifyTypeContext(sourceCode: string) {
//   const filename = UTIL_CONFIG_OPTIONS.fileName;
//   const fullSource = `${UTIL_CONFIG_OPTIONS.solidType}\n${sourceCode}`;
//   const target = ts.ScriptTarget.Latest;

//   const sourceFile = ts.createSourceFile(filename, fullSource, target, true);
//   const defaultHost = ts.createCompilerHost({ target });

//   const customHost: ts.CompilerHost = {
//     ...defaultHost,
//     getSourceFile: (name, version, ...args) => {
//       if (name === filename) return sourceFile;
//       return defaultHost.getSourceFile(name, version, ...args);
//     },
//     writeFile: () => {},
//     fileExists: (name) => name === filename || defaultHost.fileExists(name),
//     readFile: (name) =>
//       name === filename ? fullSource : defaultHost.readFile(name),
//   };

//   const program = ts.createProgram(
//     [filename],
//     {
//       target: ts.ScriptTarget.Latest,
//       module: ts.ModuleKind.CommonJS,
//       noLib: true,
//     },
//     customHost,
//   );

//   const checker = program.getTypeChecker();

//   const statements = sourceFile.statements.filter(
//     (s): s is ts.TypeAliasDeclaration | ts.InterfaceDeclaration =>
//       ts.isTypeAliasDeclaration(s) || ts.isInterfaceDeclaration(s),
//   );

//   const statement = statements[statements.length - 1];

//   const type = ts.isInterfaceDeclaration(statement)
//     ? checker.getTypeAtLocation(statement.name)
//     : checker.getTypeFromTypeNode(statement.type);

//   // 💎 RETURN THE SOURCEFILE
//   // This allows tests to access specific nodes for Interning/Reference tests.
//   return { type, checker, sourceFile };
// }
