// // src/validation/errors.ts
// import type { TValidationContext, TSolidShape } from '../../shared';
// import { serialize, getCallerLocation } from '../../shared';
// import { XalethorService } from '../xalor-service';
// /**
//  * Records a validation failure into the current context.
//  * Returns false to allow for: return reportError(...)
//  */
// export function reportError(
//   ctx: TValidationContext,
//   expected: string | TSolidShape,
//   received: unknown,
// ): false {
//   const runtimeCaller = getCallerLocation({ preferredIndex: 4 });
//   const manifest = ctx.currentKey
//     ? XalethorService.manifestVault(ctx.currentKey)
//     : undefined;

//   // Cleanly fall back if a headless validation bypass runs without a registration entry
//   const originArea = manifest ? manifest.area : 'unknown:0:0';

//   ctx.errors.push({
//     key: ctx.currentKey || 'unknown',
//     path: ctx.path,
//     message: `Validation failed at ${ctx.path}`,
//     expected: serialize(expected),
//     received: serialize(received),
//     area: runtimeCaller,
//     origin: originArea,
//   });

//   return false;
// }
