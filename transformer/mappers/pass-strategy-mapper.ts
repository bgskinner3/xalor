// /transformer/mappers/pass-strategy-mapper.ts
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
    return executeFileMiningPass(props);
  },
  studio: (props: TPassStrategyPayloadMap['studio']) => {
    return executeFileMiningPass(props);
  },
} satisfies TPassStrategyMapper;
