// 🧠 THE COMPILER HANDSHAKE:
// Forces tsup's declaration worker to pull your global placeholder shells into
// its visibility path during compilation, immediately squash-killing all TS2304
// find errors and key alignment mismatches simultaneously!
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./models/types/definitions/intellisense-interfaces.ts" />

// src/index.ts
export * from './operations';
export * from './models/types/definitions';
