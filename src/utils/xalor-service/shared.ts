import { isRecord } from '../../../shared';

export function isTargetRegistryStructure<K extends TActiveRegistryKeys>(
  payload: unknown,
): payload is TResolveRegistryStructure<K> {
  return isRecord(payload);
}
