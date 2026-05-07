import * as utils from './utils';
import { createStore } from './store';
import { Format, MockSource } from './types';
import App, { JsonSchemaEditorOwnedProps } from './App';
import { Provider } from 'react-redux';

export interface SchemaEditorConfiguration {
  lang?: 'zh_CN' | 'en_US';
  format?: Format;
  mock?: MockSource;
}

export default function schemaEditor(config: SchemaEditorConfiguration = {}) {
  if (config.lang) {
    utils.setLang(config.lang);
  }

  const store = createStore();

  const formatSource = config.format ?? utils.format;
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
