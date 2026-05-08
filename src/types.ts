export type Format = { name: string; title?: string }[];

export type MockSource = { name: string; mock: string }[];

// --- Discriminated union JSON Schema types ---

interface JsonSchemaBase {
  title?: string;
  description?: string;
  enumDesc?: string;
  mock?: unknown;
  // Common structural fields (used across types without narrowing)
  items?: JsonSchema;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  [key: string]: unknown;
}

export interface JsonSchemaString extends JsonSchemaBase {
  type: 'string';
  default?: string;
  enum?: string[];
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
}

export interface JsonSchemaNumber extends JsonSchemaBase {
  type: 'number' | 'integer';
  default?: number;
  enum?: number[];
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
}

export interface JsonSchemaBoolean extends JsonSchemaBase {
  type: 'boolean';
  default?: boolean;
}

export interface JsonSchemaArray extends JsonSchemaBase {
  type: 'array';
  uniqueItems?: boolean;
  minItems?: number;
  maxItems?: number;
}

export interface JsonSchemaObject extends JsonSchemaBase {
  type: 'object';
}

export type JsonSchema =
  | JsonSchemaString
  | JsonSchemaNumber
  | JsonSchemaBoolean
  | JsonSchemaArray
  | JsonSchemaObject;

/** @deprecated Use JsonSchema instead */
export type JSONSchema = JsonSchema;
