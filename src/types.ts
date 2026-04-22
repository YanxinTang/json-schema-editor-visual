export interface JSONSchema {
  type: string;
  items?: JSONSchema;
  properties?: Record<string, JSONSchema>;
  required?: string[];
}
