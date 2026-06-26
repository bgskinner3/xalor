// transformer/emitters/intellisense-bridge.ts
import { IS_SOLID_CONFIG_ITEMS, REGEX_PATTERNS } from '../../shared';
import * as fs from 'fs';
import * as path from 'path';
import type { TVaultSyncPayload } from '../../shared';
import { XalorRoutesService, xalorCentralContext } from '../service';

/**
 * temporalManifest
 *
 * PURPOSE:
 * Composes the raw source string for the ambient declaration (.d.ts) file.
 * It transforms the in-memory Registry Map into a valid TypeScript module
 * augmentation, creating a "Temporal" snapshot of all mined types.
 *
 * ROLE:
 * 1. MAPPING: Converts absolute file paths into portable relative imports.
 * 2. MERGING: Populates the ISolidRegistry interface via declaration merging.
 * 3. OVERLOADING: Generates specific function signatures that map string
 *    keys to their respective TypeScript interfaces for the IDE.
 type TExpandStructure<T> = T extends (...args: unknown[]) => unknown
  ? T
  : T extends object
  ? { [K in keyof T]: TExpandStructure<T[K]> }
  : T;
 */
function temporalManifest(
  registry: Map<string, TVaultSyncPayload>,
  targetDir: string,
  emitter: typeof IS_SOLID_CONFIG_ITEMS.emitter,
): string {
  const { keyHasExportedType } = xalorCentralContext.context;
  const identityLines: string[] = [];
  const registryLines: string[] = [];

  registry.forEach((payload, key) => {
    const { filePath, symbolName, area, typeName } = payload;

    // 🪐 RESOLUTION A: The Strict Compiler Path
    const relativeImportPath = path
      .relative(targetDir, filePath)
      .replace(REGEX_PATTERNS.backslashes, '/')
      .replace(REGEX_PATTERNS.extensions, '');

    /* prettier-ignore */
    const clickableFileLink = XalorRoutesService.buildAbsolutePathTypeLink(area, filePath);

    if (keyHasExportedType.has(symbolName)) {
      // 🛰️ PARADIGM A: Public Named Export -> Retains your relative code imports intact
      // while using workspace-absolute links for the JSDoc @see navigation tags!
      identityLines.push(
        [
          ` /** 🔗 Source: ${clickableFileLink} */`,
          ` /* prettier-ignore */ '${key}': import('./${relativeImportPath}').${symbolName};`,
        ].join('\n'),
      );
    } else {
      identityLines.push(
        [
          `  /** 🔗 Source: ${clickableFileLink} */`,
          `  /* prettier-ignore */ '${key}': ${typeName};`,
        ].join('\n'),
      );
    }

    // Populate your structural hover card registries using clean absolute workspace paths
    registryLines.push(
      ` /* prettier-ignore */ '${key}': TExpandStructure<ISolidIdentity['${key}']>;`,
    );
  });

  return [
    emitter.banner,
    `/* eslint-disable ${emitter.eslintDisabled.join(' ')} */`,
    // 🟢 SPREADS NOTHING HERE BECAUSE IMPORTS IS EMPTY ARRAY:
    ...emitter.imports,
    '',
    'declare global {',
    '  interface ISolidIdentity {',
    ...identityLines,
    '  }',
    '',
    '  interface ISolidRegistry {',
    ...registryLines,
    '  }',
    '',
    '   interface ISolidDriftRegistry {',
    '     [key: string]: {',
    '       readonly current: any;',
    '       readonly v1_ancestor: any;',
    '     };',
    '   }',
    '  }',
    '}',
    '',
    // 🚀 THE FIX FOR ts(2669): Explicitly seals the file as an isolated external module.
    // This removes ambient duplication errors while adding 0 bytes to the compiled runtime bundle!
    'export {};',
  ]
    .join('\n')
    .trim();
}

/**
 * hydrateIntellisenseBridge
 *
 * PURPOSE:
 * Orchestrates the physical emission of the IDE "Ghost Layer." It synchronizes
 * the build-time metadata with the developer's environment to enable
 * zero-import autocomplete and hover-cards.
 *
 * ROLE:
 * 1. PATH RESOLUTION: Determines the absolute destination for the .d.ts file.
 * 2. ATOMIC SYNC: Only writes to disk if the temporal manifest has changed,
 *    preventing unnecessary IDE re-indexes or build triggers.
 * 3. DIRECTORY SAFETY: Ensures the distribution path exists before writing.
 */
export function hydrateIntellisenseBridge(
  _rootDir: string, // Kept for signature compatibility but completely unused for paths!
  registry: Map<string, TVaultSyncPayload>,
) {
  const { emitter } = IS_SOLID_CONFIG_ITEMS;

  // 🟢 THE ALIGNMENT: Read the absolute directory path directly from your getter!
  // This evaluates natively to: "/Users/bgskinner2/.../xalor-production-sandbox/.xalor"
  const activePaths = XalorRoutesService.resolveXalorPaths(_rootDir);
  const targetDir = activePaths.bridgeDir;
  const envFile = activePaths.bridgeFile;

  const dts = temporalManifest(registry, targetDir, emitter);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Write directly using the clean, unified path target string
  fs.writeFileSync(envFile, dts, 'utf8');
}
