import type {
  TCLIBootStrapModes,
  TEnvStateMatrix,
  TRebuildShapeMapper,
  TRebuildParams,
} from '../types';
import type { TSolidObjectRawShape } from '../../../shared';
import { resolveBlueprint, generateSolidTypeScriptString } from '../../utils';

/**
 * ============================================================================
 * 🚦 CLI MODE INITIALIZATION AND MUTATION MAPPER COMPACT
 * ============================================================================
 *
 * ROLE:
 * Unified dictionary registers that decouple environmental state configuration
 * from visual telemetry delivery across the system lifecycle.
 *
 * MAPS INCLUDED:
 * 1. CLI_BOOTSTRAP_LOG_MAPPER     - Direct terminal stream telemetry blueprints.
 * 2. MODE_ENV_MUTATION_MAPPER     - Process-level environment flag toggle footprints.
 */
/* prettier-ignore */
export const CLI_LOGGER_MAPPER: Record<TCLIBootStrapModes | 'help', (projectRootPath: string) => string> = {
  clear: (projectRootPath) => `
====================================================
🪐 [Xalor CLI] INITIALIZING ABSOLUTE ZERO CACHE PURGE...
📂 Project Root Anchor: ${projectRootPath}
====================================================`,

  compile: (projectRootPath) => `
⚡ [Xalor CLI] STARTING SINGLE-PASS SYNC BUILDER...
📂 Project Root Anchor: ${projectRootPath}
====================================================`,

  watch: (projectRootPath) => `
🔭 [Xalor CLI] STARTING REAL-TIME REFLECTION RUNNER...
📂 Project Root Anchor: ${projectRootPath}
====================================================`,

  help: () => `
======================================================================
🪐 XALOR CLI ENVIRONMENT GATEWAY MANUAL
======================================================================
Usage: xalor <command> [options]

Commands:
  watch    🔭 Start real-time reflection watcher daemon (HMR)
  compile  ⚡ Execute single-pass sync graph AST builder
  audit    📊 Profile macro operational health and validation density
  studio   🛰️ Launch secure Cross-Origin localhost workspace UI
  vacuum   🧹 Purge stale un-referenced CAS cache cache leaf pointers
  clear    🔥 Hard flash-purge node_modules cache back to zero

Options (audit only):
  -f, --fix      🚿 Evict orphaned type keys and optimize snapshot databases
  -j, --json     📄 Emit raw JSON metrics structure to standard output stream
  -v, --verbose  🔍 Expose deep compiler token mapping details
======================================================================
    `
} satisfies Record<TCLIBootStrapModes | 'help', (projectRootPath: string) => string>;

/* prettier-ignore */
export const MODE_ENV_MUTATION_MAPPER: Record<TCLIBootStrapModes, TEnvStateMatrix> = {
  clear: {
    XALOR_CLI_CLEAR: 'true',
    XALOR_CLI_WATCH: 'false',
    XALOR_CLI_COMPILE: 'false',
  },
  watch: {
    XALOR_CLI_CLEAR: 'false',
    XALOR_CLI_WATCH: 'true',
    XALOR_CLI_COMPILE: 'false',
  },
  compile: {
    XALOR_CLI_CLEAR: 'false',
    XALOR_CLI_WATCH: 'false',
    XALOR_CLI_COMPILE: 'true',
  },
} satisfies Record<TCLIBootStrapModes, TEnvStateMatrix>;

// ========================================================================
// 🪐 POLYMORPHIC STRATEGY DISPATCH MAP (O(1) Switchless Elimination)
// ========================================================================
export const REBUILD_STRATEGY_MAPPER: TRebuildShapeMapper = {
  primitive: (params: TRebuildParams) => {
    const { shape } = params;
    // 🟢 SAFE INLINE NARROWING: Proving to the compiler this is a primitive
    if (shape.kind !== 'primitive') return 'unknown';
    return shape.type;
  },

  literal: (params: TRebuildParams) => {
    const { shape } = params;
    if (shape.kind !== 'literal') return 'unknown';

    const val = shape.value;
    if (val === undefined) return 'unknown';
    return typeof val === 'string' ? `'${val}'` : String(val);
  },

  union: (params: TRebuildParams) => {
    const { shape, pool, depth } = params;
    if (shape.kind !== 'union') return 'never';

    const variants = shape.values;
    if (variants === undefined || variants.length === 0) return 'never';

    const len = variants.length;
    const unionBuffer: string[] = [];

    for (let i = 0; i < len; i++) {
      const variant = variants[i];
      if (variant !== undefined) {
        unionBuffer.push(generateSolidTypeScriptString(variant, pool, depth));
      }
    }
    return unionBuffer.join(' | ');
  },

  branded: (params: TRebuildParams) => {
    const { shape, pool, depth } = params;
    if (shape.kind !== 'branded') return 'unknown';

    const baseType = generateSolidTypeScriptString(shape.base, pool, depth);
    return `${baseType} /* & Brand<'${String(shape.name)}'> */`;
  },

  reference: (params: TRebuildParams) => {
    const { shape, pool, depth } = params;
    if (shape.kind !== 'reference') return 'unknown';

    const referencedShape = resolveBlueprint(shape.name, pool);
    if (referencedShape !== undefined) {
      return generateSolidTypeScriptString(referencedShape, pool, depth);
    }
    return shape.name;
  },

  array: (params: TRebuildParams) => {
    const { shape, pool, depth } = params;
    if (shape.kind !== 'array') return 'unknown';

    const itemType = generateSolidTypeScriptString(shape.items, pool, depth);
    const elements = shape.elementShapes;

    if (elements !== undefined && elements.length > 0) {
      const len = elements.length;
      const tupleBuffer: string[] = [];

      for (let i = 0; i < len; i++) {
        const element = elements[i];
        if (element !== undefined) {
          tupleBuffer.push(generateSolidTypeScriptString(element, pool, depth));
        }
      }

      const tupleContents = tupleBuffer.join(', ');
      const restSpread = shape.hasRest ? `, ...${itemType}[]` : '';
      return `[${tupleContents}${restSpread}]`;
    }

    return `${itemType}[]`;
  },
  object: (params: TRebuildParams) => {
    const { shape, pool, depth, spacing } = params;
    if (shape.kind !== 'object') return '{}';

    const properties = shape.properties;
    if (properties === undefined) return '{}';

    const propertyKeys = Object.keys(properties);
    const len = propertyKeys.length;
    if (len === 0) return '{}';

    const nextDepth = depth + 1;
    const innerSpacing = ' '.repeat(nextDepth);
    const linesBuffer: string[] = [];

    for (let i = 0; i < len; i++) {
      const key = propertyKeys[i];
      if (key === undefined) continue;

      const property: TSolidObjectRawShape = properties[key];
      if (property === undefined) continue;

      const optionalMarker = property.optional ? '?' : '';
      const valueType = generateSolidTypeScriptString(
        property.shape,
        pool,
        nextDepth,
      );

      linesBuffer.push(`${innerSpacing}${key}${optionalMarker}: ${valueType};`);
    }

    return `{\n${linesBuffer.join('\n')}\n${spacing}}`;
  },
} satisfies TRebuildShapeMapper;
