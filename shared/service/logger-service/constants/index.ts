// shared/service/logger-service/constants

export const LOGGER_DESIGN_SPECTRUM = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  underline: '\x1b[4m',

  // Core Background/Foreground Blocks
  // 🗄️ THE MATERIAL BACKDROP CONTAINERS (Canvas Backgrounds)
  bgCanvasBlock: '\x1b[48;5;250m', // Premium Light Gray backdrop matrix
  textCanvasBlock: '\x1b[38;5;234m', // Deep charcoal black text for standard rows

  bgErrorBlock: '\x1b[48;5;88m', // Premium Dark Crimson Red backdrop
  textErrorBlock: '\x1b[38;5;255m', // Crisp Pure White text for raw error text rows
  bgFooterContrastBlock: '\x1b[48;5;235m', // Dark Slate Backdrop (ANSI 235)
  textFooterContrastBlock: '\x1b[38;5;255m', // Crisp White Text for high-contrast visibility

  // 🎯 HIGH-CONTRAST LIGHT FOREGROUND ACCENTS (Text Colors)
  // These are custom-tuned to pop vividly on both Gray AND Crimson backgrounds
  textLightRed: '\x1b[38;5;196m\x1b[1m', // 🔥 ULTRA-BRIGHT: Vivid Neon Red (Color 196)
  textLightGreen: '\x1b[38;5;82m\x1b[1m', // 🔥 ULTRA-BRIGHT: Vivid Neon Emerald Green (Color 82)
  textLightYellow: '\x1b[38;5;226m\x1b[1m', // 🔥 ULTRA-BRIGHT: High-Luminance Laser Yellow (Color 226)
  textLightCyan: '\x1b[38;5;51m\x1b[1m', // 🔥 ULTRA-BRIGHT: High-Luminance Electric Cyan (Color 51)

  // Low-intensity terminal defaults (Used outside the canvas for background tracking logs)
  gray: '\x1b[90m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
} as const;

export const LOGGER_LAYOUT_CONFIG = {
  canvasWidth: 76,
  maxSafeFileLimit: 50000,
} as const;

export const LOGGER_SIGNAL_EMOJIS = {
  fault: '✖',
  warn: '⚠️',
  info: 'ℹ️',
  success: '✅',
  anchor: '🪐',
  package: '📦',
  link: '➔',
  bullet: '•',
  lightning: '⚡',
  diamond: '💎',
  fire: '💥',
  stop: '🛑',
  lock: '🔐',
} as const;
// ████████████████████████████████████████████████████████████████████████████████
// █ ============================================================================ █
// █  ❌ [Xalor Build Blocked] CRITICAL INVARIANT RULE BREACH                     █
// █ ============================================================================ █
// █                                                                              █
// █   ➔ Target Key    : TUserPayload                                             █
// █   ➔ Rule Category : GRAPH_SAFETY                                             █
// █                                                                              █
// █ ---------------------------------------------------------------------------- █
// █   💎 Type Definition (Source Link):                                          █
// █   ↳ /src/models/User.ts:14:8                                                 █
// █   ⚡ Runtime Call Site (Invocation Link):                                    █
// █   ↳ /src/index.ts:42:11                                                      █
// █ ---------------------------------------------------------------------------- █
// █   💥 Error Details:                                                          █
// █      Nesting depth exceeds the maximum level-25 limit constraint.            █
// █      Bypassed compiler guarantees during active interning checks.            █
// █                                                                              █
// █ ============================================================================ █
// █   🛑 Action: Terminating compilation process immediately to protect integrity.█
// █ ============================================================================ █

// ████████████████████████████████████████████████████████████████████████████████
// █                                                                              █
// █   🪐 XALOR OPERATIONAL PROFILER REPORT LEDGER                                █
// █                                                                              █
// ████████████████████████████████████████████████████████████████████████████████
// █                                                                              █
// █    📦 STORAGE COMPACTION & SPEED SUMMARY                                     █
// █    • User Registration Keys  : 1,420                                         █
// █    • Deduplicated CAS Nodes  : 368                                           █
// █    • Vault Compact Ratio     : 74.1% Storage Deduplication                   █
// █    • Database Disk Volume    : 214.50 KB                                     █
// █    • Compiler Trace Latency  : 14 ms                                         █
// █                                                                              █
// █    🚨 GRAPH SAFETY & HYGIENE STATUS                                          █
// █    • Critical Depth Alarms   : 0 Warnings (>10 Layers)                       █
// █    • System Deepest Apex     : 4 / 10 Layers                                 █
// █    • Stale Orphaned Keys     : 0 Inactive Hooks                              █
// █                                                                              █
// █    📦 PHYSICAL DISTRIBUTION PACKAGE SIZE                                     █
// █    • Unpacked Bundle Sizing  : 214.50 KB (dist/ output structures)           █
// █    • Production Dependencies : 1 active module hooks (tslib)                 █
// █    • Projected Install Size  : 654.50 KB (node_modules scale)                █
// █                                                                              █
// █    🛰️  API CONTRACT DRIFT STATUS                                             █
// █    • Breaking Drifts Tripped : CLEAN BASES                                   █
// █    • Mutation Delta Records  : 0 Tracked Changes                             █
// █                                                                              █
// ████████████████████████████████████████████████████████████████████████████████
// █   ✔  [Xalor CLI] Audit stream execution cycle successfully finished.          █
// ████████████████████████████████████████████████████████████████████████████████

// ⚠️  [XALOR ENGINE WARNING]
//    -> Contract key 'TUserPayload' looming close to nesting depth thresholds.
