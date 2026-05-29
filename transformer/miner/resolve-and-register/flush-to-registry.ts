// transformer/miner/resolve-and-register.ts
import type { TFlushToRegistryParams } from '../../types';
import * as path from 'path';
import { xalorCentralContext } from '../../service';

/**
 * flushToRegistry
 *
 * Unpacks and registers the parent type along with recursive child
 * sub-fragments inside the global process context maps.
 *
 * @see {@link TransformerDocs.flushToRegistry}
 */
export function flushToRegistry({
  key,
  fragments,
  payload,
}: TFlushToRegistryParams): void {
  // track the parent key as part of the active compilation pass
  xalorCentralContext.activePassKeys.add(key);

  // prevent from dropping out during 'noop' dev-watch saves!
  xalorCentralContext.addGlobalRegistry(payload);
  xalorCentralContext.addSessionRegistry({
    keyName: payload.key,
    area: payload.area,
    anchor: payload.anchor,
    filePath: payload.filePath,
  });

  const normalizedRelativePath = path
    .relative(process.cwd(), payload.filePath)
    .split(path.sep)
    .join('/');

  // Flush the remaining shredded sub-fragments cleanly into the database drawers
  fragments.forEach((fShape, fKey) => {
    xalorCentralContext.activePassKeys.add(fKey);
    xalorCentralContext.addGlobalRegistry({
      ...payload,
      key: fKey,
      area: `${payload.area} (Fragment)`,
      symbolName: `${payload.symbolName ?? 'unknown'} (Fragment)`,
      typeName: 'Fragment',
      shape: fShape,
      filePath: normalizedRelativePath,
    });

    xalorCentralContext.addSessionRegistry({
      keyName: fKey,
      area: payload.area,
      anchor: payload.anchor,
      filePath: payload.filePath,
    });
  });
}
