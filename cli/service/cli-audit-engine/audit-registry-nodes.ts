import type { TParsedLocation, TXalorAuditNode } from '../../models/types';
import type {
  TTripleKV,
  TVaultManifestEntry,
  TVaultRegistryEntry,
} from '../../../shared/types';
import { REGEX_PATTERNS } from '../../../shared/constants';
import { ObjectUtils, yieldItems } from '../../../shared';
import { createDefaultAuditTemplate } from '../../utils';

class AuditRegistryService {
  private parseManifestCoordinates(
    manifestRow?: TVaultManifestEntry,
  ): TParsedLocation {
    const filePath = manifestRow ? manifestRow.filePath : 'unknown_source';
    let line = 0;
    let column = 0;
    let anchor = 0;

    if (!manifestRow) {
      return { line, column, anchor, filePath };
    }

    const lineMatch = manifestRow.area?.match(REGEX_PATTERNS.line);
    const colMatch = manifestRow.area?.match(REGEX_PATTERNS.column);
    const anchorMatch = manifestRow.anchor?.match(REGEX_PATTERNS.anchor);

    if (lineMatch?.[1]) line = Number.parseInt(lineMatch[1], 10);
    if (colMatch?.[1]) column = Number.parseInt(colMatch[1], 10);
    if (anchorMatch?.[1]) anchor = Number.parseInt(anchorMatch[1], 10);

    return { line, column, anchor, filePath };
  }

  /**  @see {@link AuditServiceDocs.extractNodeCoreDataLayout}*/
  public extractNodeCoreDataLayout(vault: TTripleKV): TXalorAuditNode[] {
    const userKeys = ObjectUtils.keys(vault.references);

    const casCollapseCounter: Record<string, number> = {};

    for (const key of userKeys) {
      const fingerprint = vault.references[key];
      casCollapseCounter[fingerprint] =
        (casCollapseCounter[fingerprint] || 0) + 1;
    }

    const compiledNodes: TXalorAuditNode[] = [];

    for (const typeKey of yieldItems(userKeys)) {
      const nodeRecord = createDefaultAuditTemplate('node');

      // 💚 PERFORMANCE OPTIMIZATION: Deep clone your structures cleanly using your Axiom utility!
      // const nodeRecord = cloneDeep(rawNodePayload);
      const casFingerprint = vault.references[typeKey];

      /* prettier-ignore */ const manifestRow: TVaultManifestEntry | undefined = vault.manifest[typeKey];
      /* prettier-ignore */ const registryRow: TVaultRegistryEntry | undefined = vault.registry[typeKey];
      /* prettier-ignore */ const symbolName = registryRow ? registryRow.symbolName : 'anonymous_type';
      /* prettier-ignore */ const location = this.parseManifestCoordinates(manifestRow);

      // Update identity parameters cleanly
      nodeRecord.identity.typeKey = typeKey;
      nodeRecord.identity.symbolName = symbolName;
      nodeRecord.identity.casFingerprint = casFingerprint;

      nodeRecord.location = location;

      compiledNodes.push(nodeRecord);
    }

    return compiledNodes;
  }
}

export const auditRegistryService = new AuditRegistryService();
