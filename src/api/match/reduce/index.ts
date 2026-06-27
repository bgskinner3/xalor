// # matchReduce

// ## ROlE:

// - The "Declarative Structural Aggregator Engine." It executes a stateless, single-pass fold operation over a collection of un-typed data fragments, progressively matching their properties against a single target blueprint contract, and condensing them into one consolidated, pristine master object using custom property rules.

// ## IDEA:

// - Instead of requiring developers to write complex, fragile, manual array.reduce loops filled with messy null-pointer fallbacks, they target a single authoritative type signature.

// - They provide a static configuration pattern map that dictates exactly how properties collapse (e.g., "retain" to overwrite values left-to-right, { operator: "add" } to mathematically accumulate counters, or null to explicitly drop properties). The engine automatically pre-hydrates a transient master object using blueprint primitive defaults, runs the math/selection filters over the array inline in RAM, and casts the completed contract out of the loop.

// ## FEATURES:

// - Type-Locked Operation Mapping: Because the engine maps directly to the precompiled registry, your configuration pattern parameter is strictly typed by the compiler. If a developer attempts to attach an accumulation operator ("add") to a field that your blueprint marks as a string or an object, the editor throws a red IntelliSense error box before the app ever runs.

// - Automatic Blueprint Hydration: The internal accumulator is pre-filled on step zero with the safe primitive fallback defaults ("", 0, false) extracted straight from your blueprint cache. This completely shields your downstream code from undefined property crashes.

// - Clickable Spatial Audit Trailing: If a bad data node introduces a structural contradiction that corrupts the batch (such as trying to pass a string text block into an accumulated numerical property), The Auditor catches the failure pass and injects full GPS coordinates. It outputs a clickable ANSI terminal link pointing straight back to the native TypeScript interface file where the breaking constraint was declared.

// ## LIMIT CONSIDERATIONS

// - The Ingestion Volume Cap: The incoming array stream size is hard-bounded at a maximum threshold of max 150 data fragments per execution pass to protect the single-threaded event loop from long garbage-collection pauses.

// - Transient Memory Insulation (Zero-Cache Core): The intermediate accumulator values and math matrices remain strictly transient data entities. They exist inside the executing block, hand you the final computed asset, and are completely garbage collected. No persistent storage or database states are allowed, avoiding V8 RAM bleed.

// ## EXAMPLE

// ```ts
// // type ITransaction = {
// //   id: string;
// //   amount: number;
// //   currency: string;

// //   breakdown: {
// //     subtotal: number;
// //     fee: number;
// //     tax: number;
// //   };
// // };
// // this si the shape of the key
// // TRANSACTION_EVENT = ITransaction
// const transactionChunks: unknown[] = [
//   {
//     id: 'tx_99812',
//     amount: 100,
//     currency: 'usd',
//     breakdown: { subtotal: 90, fee: 5, tax: 5 },
//   },
//   { amount: 50, breakdown: { subtotal: 45, fee: 3, tax: 2 } }, // Additional line-item cost charge
//   { currency: 'usd', someRogueKey: 'malicious_noise' }, // Meta tracking delta
// ];

// // WE PASS THE OBJECT

// // 🚀 What the developer writes inside their application file:
// const accountingSummary = matchReduce<'TRANSACTION_EVENT'>(
//   transactionChunks,
//   {
//     id: 'retain', // Rule: Keep the ID from the stream
//     currency: 'retain', // Rule: Keep the currency symbol from the stream
//     amount: {
//       operator: 'add', // Rule: Accumulate this specific numeric field!
//     },
//     breakdown: {
//       subtotal: { operator: 'add' },
//       fee: { operator: 'add' },
//       tax: { operator: 'add' },
//     },
//   },
//   {
//     success: (aggregatedData) => aggregatedData,
//     default: (auditLedger) => {
//       throw new Error(
//         `Batch aggregation crashed at type: ${auditLedger.targetSymbolName}`,
//       );
//     },
//   },
// );

// // ============================================================================
// // 📤 THE EXACT CONSOLIDATED AND CAST MASTER OBJECT RETURNED AT RUNTIME:
// // ============================================================================
// // accountingSummary === {
// //   id: "tx_99812",
// //   currency: "usd",
// //   amount: 150,
// //   breakdown: {
// //     subtotal: 135,
// //     fee: 8,
// //     tax: 7
// //   }
// // }

// //=> exmaple data object returned
// ```

// ## Enhanced

// ### Example 2: Valibot Style — Modular Functional Piping

// Instead of static text strings like "add", we import tiny, standalone, tree-shakable functional operators. If your production build doesn't use a certain operator, your bundle completely drops it, keeping your footprint exceptionally light.

// ```ts
// import { latest, sum, append } from '@bgskinner2/xalor/operators';

// const result = matchReduce<'TRANSACTION_EVENT'>(transactionChunks, {
//   id: latest(), // Keeps the absolute latest non-null ID found in the stream
//   currency: latest(), // Keeps the latest currency token
//   amount: sum(), // Mathematically totals numeric values
//   tags: append(), // Unique: Merges arrays together into a flat list!
// });

// // If all fields match the primitive layout constraints, the engine
// //  aggregates the data arrays and output a single unified asset:

// /* result === {
//      id: "tx_7721",
//      currency: "usd",
//      amount: 150,
//      tags: ["checkout", "promo_applied"] // Arrays are cleanly aggregated inline!
//    }
// */
// ```

// ### Example 3: Zod Style — Custom Closure Transformation

// This is the ultimate flexibility layer. If a field arrives completely broken or un-coerced, you pass an inline, type-safe custom callback function directly into the property slot to evolve the data inside the running loop.

// ```ts
// const result = matchReduce<'TRANSACTION_EVENT'>(transactionChunks, {
//   id: 'retain',
//   currency: 'retain',

//   // 🚀 The Zod Transformer: Intercepts the value and cleanses it inline!
//   amount: (currentVal, accumulatorVal) => {
//     // If it's already a clean number, add it straight to the total
//     if (typeof currentVal === 'number') {
//       return accumulatorVal + currentVal;
//     }
//     // If it arrives as a messy text string like "$10.50", parse it safely!
//     if (typeof currentVal === 'string') {
//       const cleanNum = parseFloat(currentVal.replace('$', ''));
//       return accumulatorVal + cleanNum;
//     }
//     return accumulatorVal;
//   },
// });

// // Because your inline custom function successfully intercepted and repaired Chunk 3's messy string value on the fly, the validation pass succeeds 100%. The loop outputs a clean, safe, fully cast data structure:

// /* result === {
//      id: "tx_7721",
//      currency: "usd",
//      amount: 160.50 // Safely included the parsed string amount: 100 + 50 + 10.50!
//    }
// */
// ```

/**
 * !!! FOR in depth notes on how we designed Drift
 * @see {@link RuntimeApiCoreDocs.matchXalorReducePlan}
 */
