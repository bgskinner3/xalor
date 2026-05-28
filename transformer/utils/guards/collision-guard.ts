// transformer/utils/collision-guard.ts
//
// import { resolveXalorLifecycle } from '../../context';
// import type { TCollisionGuardParams } from '../../types';
// import type { TSolidShape } from '../../../shared';
// import * as fs from 'fs';
// import * as path from 'path';

/**
 * Centralized Multi-Dimensional Collision Guard Engine.
 *
 * Extracted out of the miner loop to isolate validation edge cases from raw AST parsing streams.
 *
 * @see {@link TransformerDocs.validateCollisionBorders}
 */
// export function validateCollisionBorders({
//   keyName,
//   activeAreaString,
//   currentActiveAbsoluteFile,
//   sessionRegistry,
//   rootDir,
// }: TCollisionGuardParams): TSolidShape | undefined {
//   const existingAreaRegistration = sessionRegistry.get(keyName);

//   if (!existingAreaRegistration) {
//     return undefined; // Clean Pass - Key is pristine and unregistered
//   }

//   if (existingAreaRegistration === activeAreaString) {
//     return undefined;
//   }

//   const locationSegments = existingAreaRegistration.split(':');
//   const existingRegisteredFile =
//     locationSegments.length > 0 ? locationSegments[0] : undefined;
//   const lifecycle = resolveXalorLifecycle();

//   const isSameFileDuplication =
//     existingRegisteredFile &&
//     currentActiveAbsoluteFile.endsWith(existingRegisteredFile);

//   if (isSameFileDuplication) {
//     const errorMsg =
//       `[xalor] 🚨 SAME-FILE DUPLICATION: Key "${keyName}" is duplicated inside the same file! ` +
//       `First declared at [${existingAreaRegistration}], duplicated at [${activeAreaString}]. ` +
//       `Every validation node must utilize a completely unique UUID string primitive.`;

//     if (lifecycle.isWatchMode) {
//       console.error(`\n⚠️  ${errorMsg}\n`);
//       const watchFallbackShape: TSolidShape = {
//         kind: 'primitive',
//         type: 'unknown',
//       };
//       return watchFallbackShape;
//     }

//     console.error(`\n❌ Fatal Build Error: ${errorMsg}\n`);
//     process.exit(1);
//   }

//   if (existingRegisteredFile && existingRegisteredFile !== '') {
//     const absoluteOldFileLocation = path.resolve(
//       rootDir,
//       existingRegisteredFile,
//     );

//     if (fs.existsSync(absoluteOldFileLocation)) {
//       const oldFileTextBuffer = fs.readFileSync(
//         absoluteOldFileLocation,
//         'utf8',
//       );
//       const isKeyStillPresentInOldFile = oldFileTextBuffer.includes(keyName);

//       if (!isKeyStillPresentInOldFile) {
//         return undefined;
//       }
//     } else {
//       return undefined;
//     }
//   }
//   const errorMsg =
//     `[xalor] 🚨 CROSS-FILE COLLISION: Key "${keyName}" already claimed by module [${existingAreaRegistration}]. ` +
//     `Attempted duplicate hijack assignment at location [${activeAreaString}].`;

//   if (lifecycle.isWatchMode) {
//     console.error(`\n⚠️  ${errorMsg}\n`);
//     const watchFallbackShape: TSolidShape = {
//       kind: 'primitive',
//       type: 'unknown',
//     };
//     return watchFallbackShape;
//   }

//   console.error(`\n❌ Fatal Build Error: ${errorMsg}\n`);
//   process.exit(1);
// }
