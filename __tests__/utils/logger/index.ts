/** 📥 Structural configuration metadata contract for the diagnostic tracer function */
type TTraceMeta = {
  readonly enabled: boolean;
  readonly mode: string;
  readonly operation: string;
  readonly target: string;
  readonly behavior: string;
  readonly output: unknown;
};

/**
 * 🔮 AUTOMATED DIAGNOSTIC TRACE LOGGER
 *
 * ROLE:
 * Standardizes terminal output formatting for evolution engine trace checkpoints.
 */
export function logEngineTrace({
  enabled,
  mode,
  operation,
  target,
  behavior,
  output,
}: TTraceMeta): void {
  if (!enabled) return;

  /* prettier-ignore */
  console.log(`\n=== 🔮 ENGINE TRACE: TRANSFORM XALOR (${mode.toUpperCase()} MODE) ===`);
  console.log(`OPERATION : ${operation}`);
  console.log(`TARGET    : ${target} Schema Blueprint Node`);
  console.log(`BEHAVIOR  : ${behavior}`);
  console.log('OUTPUT OBJ:');
  console.log(JSON.stringify(output, null, 2));
  console.log('===================================================\n');
}
