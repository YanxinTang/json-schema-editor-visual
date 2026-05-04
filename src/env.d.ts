/// <reference types="@rslib/core/types" />
/// <reference types="@rstest/core/importMeta" />

declare module 'underscore' {
  const _: {
    isUndefined(obj: unknown): boolean;
    isEqual(a: unknown, b: unknown): boolean;
    [key: string]: (...args: unknown[]) => unknown;
  };
  export default _;
}

declare module 'generate-schema/src/schemas/json.js' {
  function GenerateSchema(obj: object): object;
  export default GenerateSchema;
}

declare module '*.js' {
  const value: any;
  export default value;
}
