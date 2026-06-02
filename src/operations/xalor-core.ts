// import type { TValidateXalorModes } from '../../shared/types';
// import type { TValidateXalorReturn } from '../models/types';
// import { validateXalor } from './validate-xalor';
// // class XalorCore {
// //   validate<K extends keyof ISolidRegistry, M extends TValidateXalorModes>(
// //     ...args: Parameters<typeof validateXalor<K, M>>
// //   ): ReturnType<typeof validateXalor<K, M>> {
// //     return validateXalor<K, M>(...(args as any));
// //   }
// // }

// class XalorCore {
//   validate = validateXalor;
// }

// const xalor = new XalorCore();

// // EXAMPLE
// xalor.validate<'API_RESPONSE', 'guard'>();

/**
 Do this:
xalor.guard<'USER'>(data)
xalor.assert<'USER'>(data)
xalor.parse<'USER'>(data)
Keep this (but secondary):
xalor.validate<'USER', 'guard'>(data)
 */
