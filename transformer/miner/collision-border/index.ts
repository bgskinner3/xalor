// transformer/utils/collision-guard.ts
import { XalorRoutesService, xalorCentralContext } from '../../service';
import type { TCollisionGuardParams, TFilePathParams } from '../../types';
import { sameFileDetection } from './same-file-detection';
import { crossFileProtection } from './cross-file-protection';
/**
 * RECONSTRUCT BOUNDARY RADAR GATE (The Twin-Map Collision Shield)
 *
 * ROLE:
 * Master cryptographic safety gate checking key uniqueness across compilation sessions.
 * It maps structural spatial file positions to catch duplicate hijacking instantly.
 *
 * STRATEGY:
 * Intercepts incoming registrations using a zero-allocation point-free state lookup map.
 * Sweeps long-lived relative path directories in memory at pure O(1) jump velocities.
 * If a key exists on an external file slice, it cross-references transient active pass vectors.
 * For stale ghost keys, it triggers immediate memory eviction; for live conflicts, it routes
 * down to visual alert panels. If running watch or studio passes, it appends keys to an internal
 * blocklist shield to drop multi-traversal re-additions switchlessly without throwing crashes.
 *
 * WHY:
 * Satisfies Commandment IV (Operation Isolation Rule) and Commandment VIII (Internal Efficiency).
 * It protects the database graph structure from duplicate mutations in volatile memory,
 * optimizing hot-module-replacement (HMR) save cycles with absolute zero disk I/O costs.
 */
export function validateCollisionBorders(
  params: TCollisionGuardParams,
): boolean {
  /* prettier-ignore */
  const { keyName, activeAreaString, activeAnchorString, currentActiveAbsoluteFile } = params;

  const executeMode = XalorRoutesService.xalorCLIMode();

  const { isIncrementalBuild } = XalorRoutesService.resolveXalorLifecycle();

  /* prettier-ignore */
  const { blacklistedKeys } = xalorCentralContext.context;

  // DELETION SHIELD INTERCEPTOR
  // short-circuit This completely blocks any multi-pass re-addition attempts.
  if (blacklistedKeys.has(keyName)) return true;

  // Standardize the active file path string token natively
  const relativeProjectKey = XalorRoutesService.getProjectRelativeKey(
    currentActiveAbsoluteFile,
  );
  const PATH_PARAMS: TFilePathParams = {
    relativeProjectKey,
    keyName,
    isWatch: isIncrementalBuild,
    currentActiveAbsoluteFile,
    executeMode,
    activeAreaString,
    activeAnchorString,
  } satisfies TFilePathParams;
  // ========================================================================
  // INTEGRATED INTERCEPT LANE A: CROSS-FILE REGISTER HIJACKS
  // ========================================================================
  const isCrossFileCollision = crossFileProtection(PATH_PARAMS);
  if (isCrossFileCollision) return isCrossFileCollision;
  // ========================================================================
  // INTEGRATED INTERCEPT LANE B: SAME-FILE COPY-PASTE DUPLICATIONS
  // ========================================================================
  const isSameFIleCollision = sameFileDetection(PATH_PARAMS);
  if (isSameFIleCollision) return isSameFIleCollision;
  return false;
}
