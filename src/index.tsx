import { Provider } from 'react-redux';
import { createStore } from './store';
import JsonSchemaEditor, { JsonSchemaEditorProps } from './JsonSchemaEditor';

export default function schemaEditor() {
  const store = createStore();

  const Component = (props: JsonSchemaEditorProps) => {
    return (
      <Provider store={store}>
        <JsonSchemaEditor {...props} />
      </Provider>
    );
  };
  return Component;
}
