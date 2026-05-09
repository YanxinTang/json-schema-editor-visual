import type { JsonSchema } from './types';

/**
 * Input type for schema handling functions.
 * Allows missing fields that handleSchema will fill in with defaults.
 */
interface SchemaInput {
  type?: string;
  title?: string;
  items?: SchemaInput;
  properties?: Record<string, SchemaInput>;
  required?: string[];
  [key: string]: unknown;
}

function handleType(schema: SchemaInput): void {
  if (
    !schema.type &&
    schema.properties &&
    typeof schema.properties === 'object'
  ) {
    schema.type = 'object';
  }
}

export function handleSchema(schema: SchemaInput): JsonSchema {
  if (schema && !schema.type && !schema.properties) {
    schema.type = 'string';
  }
  handleType(schema);

  if (schema.type === 'object') {
    if (!schema.properties) schema.properties = {};
    handleObject(schema.properties);
    return schema as JsonSchema;
  } else if (schema.type === 'array') {
    if (!schema.items) schema.items = { type: 'string' };
    return handleSchema(schema.items);
  } else {
    return schema as JsonSchema;
  }
}

function handleObject(properties: Record<string, SchemaInput>): void {
  for (const key in properties) {
    handleType(properties[key]);
    if (properties[key].type === 'array' || properties[key].type === 'object') {
      handleSchema(properties[key]);
    }
  }
}
