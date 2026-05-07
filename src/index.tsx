import * as utils from './utils';
import { createStore, Store } from './store';
import { actions, SchemaSliceActions } from './store/schemaSlice';
import { Format, MockSource, ModelType } from './types';
import App, { JsonSchemaEditorOwnedProps, JsonSchemaProps } from './App.js';
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

  const Model: ModelType = {
    schema: {
      ...loadActions(store, actions),
    },
  };

  const formatSource = config.format ?? utils.format;
  const mockSource = config.mock;

  const Component = (props: JsonSchemaEditorOwnedProps) => {
    return (
      <Provider store={store}>
        <App Model={Model} formatSource={formatSource} mockSource={mockSource} {...props} />
      </Provider>
    );
  };
  return Component;
}

function loadActions(
  store: Store,
  originalActions: typeof actions,
): Record<keyof SchemaSliceActions, unknown> {
  var keys = Object.keys(originalActions);
  var actions: Record<string, unknown> = {};
  keys.forEach(function (key) {
    actions[key] = function actionCreator(params: unknown) {
      const actionCreator = (
        originalActions as Record<string, (params: unknown) => unknown>
      )[key];
      return store.dispatch(
        actionCreator(params) as Parameters<typeof store.dispatch>[0],
      );
    };
  });
  return actions;
}
