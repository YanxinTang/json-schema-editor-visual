import { SchemaSliceActions } from "./store/schemaSlice";

export interface ModelType {
  schema: Record<keyof SchemaSliceActions, unknown>;
  __jsonSchemaFormat: Format;
  __jsonSchemaMock: unknown;
}

export type Format = { name: string }[];

export interface JSONSchema {
  title?: string;
  type: string;
  description?: string;
  items?: JSONSchema;
  properties?: Record<string, JSONSchema>;
  required?: string[];
}
