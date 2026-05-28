// transformer/transformer-compiler/mode-mapper.ts
import type { TPassStrategyMapper, TPassStrategyPayloadMap } from '../types';
import { executeFileMiningPass } from '../transformer-compiler/mine-file-pass';

export const PASS_STRATEGY_MAPPER: TPassStrategyMapper = {
  watch: (props: TPassStrategyPayloadMap['watch']) => {
    // 🪐 TypeScript automatically infers and enforces your properties here perfectly!
    return executeFileMiningPass(props);
  },
  compile: (props: TPassStrategyPayloadMap['compile']) => {
    return executeFileMiningPass(props);
  },
  vacuum: (props: TPassStrategyPayloadMap['vacuum']) => {
    return executeFileMiningPass({ bridgeDir: '', ...props });
  },
} satisfies TPassStrategyMapper;
// export const GATE_STRATEGY_MAPPER: TGateStrategyMapper = {
//   watch: (props: TGateStrategyPayloadMap['watch']) => {
//     /* prettier-ignore */ const { sourceFile, rootDir, globalKeyRegistry, sessionRegistry, freshKeysHarvestedInThisPass } = props;
//     sweepAndPurgeKeys({
//       currentActiveAbsoluteFile: sourceFile.fileName,
//       globalKeyRegistry,
//       sessionRegistry,
//       freshKeysHarvestedInThisPass,
//     });
//     serializeAndFlushVault(rootDir, globalKeyRegistry);

//     // 3. Update the developer's IDE autocomplete files exactly once
//     hydrateIntellisenseBridge(rootDir, globalKeyRegistry);
//   },
//   compile: () => {
//     // Silent RAM accumulation. Skips sweeping individual saves.
//   },
//   vacuum: () => {
//     // Production Vacuum path.
//   },
// } satisfies TGateStrategyMapper;
