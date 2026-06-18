import type {
  TInstanceConstructorRegistry,
  InstanceRegistryKey,
} from '../shape-domain';
import { INSTANCE_REGISTRY_MAPPER } from '../shape-domain';

export class ShapeKindUtils {
  public resolveInstanceCtor<K extends keyof TInstanceConstructorRegistry>(
    key: K,
  ): TInstanceConstructorRegistry[K] {
    return INSTANCE_REGISTRY_MAPPER[key].ctor;
  }
  public getInstanceOfKind(key: InstanceRegistryKey) {
    return INSTANCE_REGISTRY_MAPPER[key];
  }
  public isKnownInstanceKey(key: string): key is InstanceRegistryKey {
    return Reflect.has(INSTANCE_REGISTRY_MAPPER, key);
  }
}
export const shapeKindUtilsService = new ShapeKindUtils();
