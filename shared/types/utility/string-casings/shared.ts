export type TWords<
  S extends string,
  Acc extends string[] = [],
  Current extends string = '',
> = S extends `${infer First}${infer Rest}`
  ? First extends '-' | '_' | ' '
    ? TWords<Rest, [...Acc, ...(Current extends '' ? [] : [Current])], ''>
    : First extends Uppercase<First>
      ? First extends Lowercase<First>
        ? TWords<Rest, Acc, `${Current}${First}`> // It's a number/symbol
        : Current extends ''
          ? TWords<Rest, Acc, First>
          : Current extends Uppercase<Current>
            ? Rest extends `${infer Next}${string}`
              ? Next extends Lowercase<Next>
                ? Next extends Uppercase<Next>
                  ? TWords<Rest, Acc, `${Current}${First}`> // Next is number
                  : TWords<Rest, [...Acc, Current], First> // Acronym end: 'XML' | 'H'ttp
                : TWords<Rest, Acc, `${Current}${First}`> // Still Caps: 'A' | 'P'I
              : TWords<Rest, Acc, `${Current}${First}`>
            : TWords<Rest, [...Acc, Current], First> // Normal transition: 'camel' | 'C'ase
      : TWords<Rest, Acc, `${Current}${First}`>
  : [...Acc, ...(Current extends '' ? [] : [Current])];

export type TDelimiterCaseOptions = {
  /**
   * Whether to preserve consecutive uppercase letters.
   * @default true
   */
  preserveConsecutiveUppercase?: boolean;
};
export type TDefaultDelimiterCaseOptions = {
  preserveConsecutiveUppercase: true;
};
export type TMergeDelimiterCaseOptions<Options extends TDelimiterCaseOptions> =
  {
    preserveConsecutiveUppercase: Options['preserveConsecutiveUppercase'] extends boolean
      ? Options['preserveConsecutiveUppercase']
      : TDefaultDelimiterCaseOptions['preserveConsecutiveUppercase'];
  };
