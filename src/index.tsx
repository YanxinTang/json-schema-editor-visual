import * as utils from './utils';
import { createStore, Store } from './store';
import { schemaSlice } from './store/schemaSlice';
import { Format, ModelType } from './types';
import App, { JsonSchemaEditorOwnedProps, JsonSchemaProps } from './App.js';
import { Provider } from 'react-redux';

export interface SchemaEditorConfiguration {
  lang?: 'zh_CN' | 'en_US';
  format?: Format;
  mock?: unknown;
}

export default function schemaEditor(config: SchemaEditorConfiguration = {}) {
  if (config.lang) {
    utils.setLang(config.lang);
  }

  const store = createStore();

  const Model: ModelType = {
    schema: {
      ...loadActions(store, schemaSlice.actions),
    },
    __jsonSchemaFormat: config.format ?? utils.format,
    __jsonSchemaMock: config.mock,
  };

  const Component = (props: JsonSchemaEditorOwnedProps) => {
    return (
      <Provider store={store}>
        <App Model={Model} {...props} />
      </Provider>
    );
  };
  return Component;
}

function loadActions(
  store: Store,
  originalActions: typeof schemaSlice.actions,
): Record<keyof typeof schemaSlice.actions, unknown> {
  var keys = Object.keys(originalActions);
  var actions: Record<string, unknown> = {};
  keys.forEach(function (key) {
    actions[key] = function actionCreator(params: unknown) {
      return store.dispatch(originalActions[key](params));
    };
  });
  return actions;
}
