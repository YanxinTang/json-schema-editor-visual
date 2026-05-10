/// <reference types="@rslib/core/types" />
/// <reference types="@rstest/core/importMeta" />

declare module 'generate-schema/src/schemas/json.js' {
  function GenerateSchema(
    obj: Record<string, unknown>,
  ): Record<string, unknown>;
  export default GenerateSchema;
}

declare const TEST: boolean | undefined;
