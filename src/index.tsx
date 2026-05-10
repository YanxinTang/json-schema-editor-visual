import { Provider } from 'react-redux';
import { createStore } from './store';
import { format as defaultFormat } from './utils';
import JsonSchemaEditor, {
  JsonSchemaEditorOwnedProps,
} from './JsonSchemaEditor';

export default function schemaEditor() {
  const store = createStore();

  const Component = ({ format, ...rest }: JsonSchemaEditorOwnedProps) => {
    return (
      <Provider store={store}>
        <JsonSchemaEditor format={format ?? defaultFormat} {...rest} />
      </Provider>
    );
  };
  return Component;
}
