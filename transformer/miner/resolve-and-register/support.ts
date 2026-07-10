// transformer/miner/resolve-and-register.ts
import { IS_SOLID_CONFIG_ITEMS } from '../../../shared';
import type { TVaultSyncPayload } from '../../../shared';
import type {
  TCreateVaultSyncPayLoad,
  TVerifyAndValidateType,
} from '../../types';
import { XalorRoutesService } from '../../service';
import { verifyTypeResolvability } from '../type-resolver';
import { XalorError } from '../../../shared/error';
/**
 * createPayLoad
 *
 * ROLE:
 * Pure, stateless factory allocating the standard TVaultSyncPayload metadata envelope container.
 */
export const createPayLoad = ({
  keyName,
  shape,
  sourceFile,
  identity,
}: TCreateVaultSyncPayLoad): TVaultSyncPayload => ({
  key: keyName,
  filePath: sourceFile.fileName,
  area: identity.area,
  symbolName: identity.symbolName ?? 'unknown',
  typeName: identity.typeName,
  anchor: identity.anchor,
  shape,
  reference: '',
  version: IS_SOLID_CONFIG_ITEMS.solidVersion,
});

/**
 * verifyAndValidateType
 * THE EXTRACTION GUARDHOUSE FILTER
 *
 * ROLE:
 * Executes the structural eligibility check for a call-site registration type.
 * It immediately halts the build process if a type breaks our data invariants.
 */
export const verifyAndValidateType = (params: TVerifyAndValidateType): void => {
  const { shapeType, checker, keyName, sourceFile } = params;
  const mode = XalorRoutesService.xalorCLIMode();
  const validationFailure = verifyTypeResolvability(
    shapeType,
    checker,
    keyName,
  );

  if (validationFailure && validationFailure.rule) {
    throw XalorError.InvalidType(
      keyName,
      sourceFile.fileName,
      validationFailure,
      mode,
    );
  }
};
