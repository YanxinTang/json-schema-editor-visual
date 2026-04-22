import React from 'react';

interface SchemaEditorContextValue {
  getOpenValue: (keys: string[]) => unknown;
  changeCustomValue: (keys: string[], value: unknown) => void;
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
