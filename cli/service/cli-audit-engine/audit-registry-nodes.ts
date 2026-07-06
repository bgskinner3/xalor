import type { TParsedLocation, TXalorAuditNode } from '../../models/types';
import type {
  TTripleKV,
  TVaultManifestEntry,
  TVaultRegistryEntry,
} from '../../../shared/types';
import { REGEX_PATTERNS } from '../../../shared/constants';
import { ObjectUtils, yieldItems } from '../../../shared';
import { createDefaultTemplate } from '../../utils';

class AuditRegistryService {
  public parseManifestCoordinates(
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

    // FIX: Converted the imperative tracking loop into a clean declarative forEach array pipeline
    userKeys.forEach((key) => {
      const fingerprint = vault.references[key];
      if (fingerprint) {
        casCollapseCounter[fingerprint] =
          (casCollapseCounter[fingerprint] || 0) + 1;
      }
    });

    const compiledNodes: TXalorAuditNode[] = [];

    // FIX: Swapped out the second imperative loop for a strict point-free array collection pass
    (yieldItems(userKeys) || []).forEach((typeKey) => {
      const nodeRecord = createDefaultTemplate('node');
      const casFingerprint = vault.references[typeKey];

      /* prettier-ignore */
      const manifestRow: TVaultManifestEntry | undefined = vault.manifest[typeKey];
      /* prettier-ignore */
      const registryRow: TVaultRegistryEntry | undefined = vault.registry[typeKey];
      /* prettier-ignore */
      const symbolName = registryRow ? registryRow.symbolName : 'anonymous_type';
      /* prettier-ignore */
      const location = this.parseManifestCoordinates(manifestRow);

      // Update structural and nominal identity tokens cleanly point-free
      nodeRecord.identity.typeKey = typeKey;
      nodeRecord.identity.symbolName = symbolName;
      nodeRecord.identity.casFingerprint = casFingerprint;
      nodeRecord.location = location;

      compiledNodes.push(nodeRecord);
    });

    return compiledNodes;
  }
}

export const auditRegistryService = new AuditRegistryService();
