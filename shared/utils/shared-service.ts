import type { TResolvedConfigPath, TSearchFileNames } from '../types';

const createPriorityMap = (
  searchFileNames: TSearchFileNames,
): ReadonlyMap<string, number> =>
  new Map<string, number>([
    [searchFileNames.tsconfigBuild, 0],
    [searchFileNames.tsconfig, 1],
    [searchFileNames.tsconfigBase, 999],
  ]);
// ========================================================================
// 🪐 THE PRIORITY WEIGHT STRATEGY MATRIX
// 🟢 FIXED: Sorts discovered configs dynamically to ensure the most important
// files (build/standard) float straight to index position 0 for the orchestrator!
// ========================================================================
export const prioritizeTsconfigs = (
  configs: readonly TResolvedConfigPath[],
  searchFileNames: TSearchFileNames,
): TResolvedConfigPath[] => {
  const priorities = createPriorityMap(searchFileNames);

  return [...configs].sort((a, b) => {
    const aPriority = priorities.get(a.fileName) ?? 100;
    const bPriority = priorities.get(b.fileName) ?? 100;

    return aPriority !== bPriority
      ? aPriority - bPriority
      : a.fileName.localeCompare(b.fileName);
  });
};
