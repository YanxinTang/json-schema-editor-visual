import { useMemo } from 'react';
import { Provider } from 'react-redux';
import { createStore } from './store';
import JsonSchemaEditorCore, {
  JsonSchemaEditorCoreProps,
} from './JsonSchemaEditor';

export default function JsonSchemaEditorVisual(
  props: JsonSchemaEditorCoreProps,
) {
  const store = useMemo(() => createStore(), []);

  return (
    <Provider store={store}>
      <JsonSchemaEditorCore {...props} />
    </Provider>
  );
}
