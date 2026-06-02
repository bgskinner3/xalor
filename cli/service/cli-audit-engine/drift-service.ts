import type {
  IXalorAuditPayload,
  TPropertyDeltaContext,
  TXalorAuditDrift,
} from '../../models/types';
import type {
  TDeepWriteable,
  TTripleKV,
  TSolidShape,
} from '../../../shared/types';
import { fsContext } from '../../../shared/service';
import { PROPERTY_DRIFT_EVALUATION_RULES } from '../../models/constants';
import { ObjectUtils, isObjectShape, yieldItems } from '../../../shared';
import { createDefaultAuditTemplate } from '../../utils';

/** @see {@link AuditServiceDocs.interceptContractDriftRadar} */
class AuditDriftService {
  private identifyEvictedContractDeletions(
    baselineKeys: readonly string[],
    activeKeysSet: Set<string>,
    driftObject: TDeepWriteable<TXalorAuditDrift>,
  ): void {
    for (const baselineKey of yieldItems(baselineKeys)) {
      if (!activeKeysSet.has(baselineKey)) {
        driftObject.mutations.push({
          typeKey: baselineKey,
          changeType: 'COMPATIBLE_DELETION',
          propertyPath: '$',
          description:
            'Stale or orphaned contract key permanently evicted from active database registry frames.',
        });
      }
    }
  }
  private evaluateObjectPropertiesDrift(
    typeKey: string,
    activeShape: TSolidShape & { kind: 'object' },
    baselineShape: TSolidShape & { kind: 'object' },
    driftContext: TDeepWriteable<TXalorAuditDrift>,
  ): void {
    for (const propKey in activeShape.properties) {
      if (
        Object.prototype.hasOwnProperty.call(activeShape.properties, propKey)
      ) {
        const contextPayload: TPropertyDeltaContext = {
          typeKey,
          propKey,
          activeProp: activeShape.properties[propKey],
          baselineProp: baselineShape.properties[propKey],
        };
        for (const rule of PROPERTY_DRIFT_EVALUATION_RULES) {
          if (rule.test(contextPayload)) {
            if (rule.isBreaking) {
              driftContext.hasBreakingChanges = true;
            }

            driftContext.mutations.push({
              typeKey,
              changeType: rule.category,
              propertyPath: `$.${propKey}`,
              description: rule.describe(),
            });

            break;
          }
        }
      }
    }
  }

  private profileStructuralShapeDrift(
    typeKey: string,
    activeVault: TTripleKV,
    baselineVault: TTripleKV,
    driftContext: TDeepWriteable<TXalorAuditDrift>,
  ): void {
    const activeHash = activeVault.references[typeKey];
    const baselineHash = baselineVault.references[typeKey];

    const activeShape = activeVault.blueprints[activeHash];
    const baselineShape = baselineVault.blueprints[baselineHash];

    if (!activeShape || !baselineShape) return;

    // Catch primitive kind constraint alterations switchlessly
    if (activeShape.kind !== baselineShape.kind) {
      driftContext.hasBreakingChanges = true;
      driftContext.mutations.push({
        typeKey,
        changeType: 'BREAKING_MUTATION',
        propertyPath: '$',
        description: `Type contract primitive kind altered from '${baselineShape.kind}' down to '${activeShape.kind}'.`,
      });
      return;
    }

    // Delegate nested property profiles down to the specialized properties handler block
    if (isObjectShape(activeShape) && isObjectShape(baselineShape)) {
      this.evaluateObjectPropertiesDrift(
        typeKey,
        activeShape,
        baselineShape,
        driftContext,
      );
    }
  }

  public async interceptContractDriftRadar(
    activeVault: TTripleKV,
  ): Promise<IXalorAuditPayload['drift']> {
    const driftContext = createDefaultAuditTemplate('drift');

    const baselineFilePath = fsContext.envPaths.baselineFile;
    if (!fsContext.fileExists(baselineFilePath)) return driftContext;

    const baselineVault = await fsContext.ingestBaselineVault(baselineFilePath);
    if (!baselineVault) return driftContext;

    const activeKeys = ObjectUtils.keys(activeVault.references);
    const baselineKeys = ObjectUtils.keys(baselineVault.references);

    const activeKeysSet = new Set(activeKeys);
    const baselineKeysSet = new Set(baselineKeys);

    for (const typeKey of yieldItems(activeKeys)) {
      // Case A: Fresh Addition Trace Check
      if (!baselineKeysSet.has(typeKey)) {
        driftContext.mutations.push({
          typeKey,
          changeType: 'COMPATIBLE_ADDITION',
          propertyPath: '$',
          description: `Contract key '${typeKey}' newly declared inside active workspace registry graph.`,
        });
        continue;
      }

      // Case B: Deep Structural Evaluation Dispatch
      this.profileStructuralShapeDrift(
        typeKey,
        activeVault,
        baselineVault,
        driftContext,
      );
    }
    this.identifyEvictedContractDeletions(
      baselineKeys,
      activeKeysSet,
      driftContext,
    );
    return driftContext;
  }
}

export const auditDriftService = new AuditDriftService();

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * TODO REMVOE
 */

// protected historicalChanges(): void {}
// private identifyEvictedContractDeletions(
//   baselineKeys: readonly string[],
//   activeKeysSet: Set<string>,
//   driftObject: TDeepWriteable<TXalorAuditDrift>,
// ): void {
//   for (const baselineKey of yieldItems(baselineKeys)) {
//     if (!activeKeysSet.has(baselineKey)) {
//       driftObject.mutations.push({
//         typeKey: baselineKey,
//         changeType: 'COMPATIBLE_DELETION',
//         propertyPath: '$',
//         description:
//           'Stale or orphaned contract key permanently evicted from active database registry frames.',
//       });
//     }
//   }
// }

// private evaluateObjectPropertiesDrift(
//   typeKey: string,
//   activeShape: TSolidShape & { kind: 'object' },
//   baselineShape: TSolidShape & { kind: 'object' },
//   driftContext: TDeepWriteable<TXalorAuditDrift>,
// ): void {
//   for (const propKey in activeShape.properties) {
//     if (
//       Object.prototype.hasOwnProperty.call(activeShape.properties, propKey)
//     ) {
//       const contextPayload: TPropertyDeltaContext = {
//         typeKey,
//         propKey,
//         activeProp: activeShape.properties[propKey],
//         baselineProp: baselineShape.properties[propKey],
//       };
//       for (const rule of PROPERTY_DRIFT_EVALUATION_RULES) {
//         if (rule.test(contextPayload)) {
//           if (rule.isBreaking) {
//             driftContext.hasBreakingChanges = true;
//           }

//           driftContext.mutations.push({
//             typeKey,
//             changeType: rule.category,
//             propertyPath: `$.${propKey}`,
//             description: rule.describe(),
//           });

//           break;
//         }
//       }
//     }
//   }
// }

// private profileStructuralShapeDrift(
//   typeKey: string,
//   activeVault: TTripleKV,
//   baselineVault: TTripleKV,
//   driftContext: TDeepWriteable<TXalorAuditDrift>,
// ): void {
//   const activeHash = activeVault.references[typeKey];
//   const baselineHash = baselineVault.references[typeKey];

//   const activeShape = activeVault.blueprints[activeHash];
//   const baselineShape = baselineVault.blueprints[baselineHash];

//   if (!activeShape || !baselineShape) return;

//   // Catch primitive kind constraint alterations switchlessly
//   if (activeShape.kind !== baselineShape.kind) {
//     driftContext.hasBreakingChanges = true;
//     driftContext.mutations.push({
//       typeKey,
//       changeType: 'BREAKING_MUTATION',
//       propertyPath: '$',
//       description: `Type contract primitive kind altered from '${baselineShape.kind}' down to '${activeShape.kind}'.`,
//     });
//     return;
//   }

//   // Delegate nested property profiles down to the specialized properties handler block
//   if (isObjectShape(activeShape) && isObjectShape(baselineShape)) {
//     this.evaluateObjectPropertiesDrift(
//       typeKey,
//       activeShape,
//       baselineShape,
//       driftContext,
//     );
//   }
// }
// /** @see {@link AuditServiceDocs.interceptContractDriftRadar} */
// private async interceptContractDriftRadar(
//   activeVault: TTripleKV,
// ): Promise<IXalorAuditPayload['drift']> {
//   const driftContext = createDefaultAuditTemplate('drift');

//   const baselineFilePath = this.paths.baselineFile;
//   if (!fs.existsSync(baselineFilePath)) return driftContext;

//   const baselineVault = await this.ingestBaselineVault(baselineFilePath);
//   if (!baselineVault) return driftContext;

//   const activeKeys = ObjectUtils.keys(activeVault.references);
//   const baselineKeys = ObjectUtils.keys(baselineVault.references);

//   const activeKeysSet = new Set(activeKeys);
//   const baselineKeysSet = new Set(baselineKeys);

//   for (const typeKey of yieldItems(activeKeys)) {
//     // Case A: Fresh Addition Trace Check
//     if (!baselineKeysSet.has(typeKey)) {
//       driftContext.mutations.push({
//         typeKey,
//         changeType: 'COMPATIBLE_ADDITION',
//         propertyPath: '$',
//         description: `Contract key '${typeKey}' newly declared inside active workspace registry graph.`,
//       });
//       continue;
//     }

//     // Case B: Deep Structural Evaluation Dispatch
//     this.profileStructuralShapeDrift(
//       typeKey,
//       activeVault,
//       baselineVault,
//       driftContext,
//     );
//   }
//   this.identifyEvictedContractDeletions(
//     baselineKeys,
//     activeKeysSet,
//     driftContext,
//   );
//   return driftContext;
// }
