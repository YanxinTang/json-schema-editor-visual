import React from 'react';
import type { JSONSchema } from './types';

interface SchemaEditorContextValue {
  getOpenValue: (keys: string[]) => unknown;
  changeCustomValue: (newValue: JSONSchema) => void;
  Model: unknown;
  isMock: boolean;
}

export const SchemaEditorContext =
  React.createContext<SchemaEditorContextValue>({
    getOpenValue: () => {},
    changeCustomValue: () => {},
    Model: {},
    isMock: false,
  });
