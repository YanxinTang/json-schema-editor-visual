import { createStore } from './store';
import { format as defaultFormat } from './utils';
import { Format, MockSource } from './types';
import App, { JsonSchemaEditorOwnedProps } from './App';
import { Provider } from 'react-redux';

export interface SchemaEditorConfiguration {
  format?: Format;
  mock?: MockSource;
}

export default function schemaEditor(config: SchemaEditorConfiguration = {}) {
  const store = createStore();

  const formatSource = config.format ?? defaultFormat;
  const mockSource = config.mock;

  const Component = (props: JsonSchemaEditorOwnedProps) => {
    return (
      <Provider store={store}>
        <App formatSource={formatSource} mockSource={mockSource} {...props} />
      </Provider>
    );
  };
  return Component;
}
