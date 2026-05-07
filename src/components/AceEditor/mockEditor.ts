import ace from 'brace';
import 'brace/mode/json';

export interface MockEditorData {
  text: string;
  format: boolean | string;
  jsonData: Record<string, unknown> | null;
}

export interface MockEditorOptions {
  container: HTMLElement | null;
  data?: string;
  onChange?: (data: MockEditorData) => void;
  readOnly?: boolean;
  fullScreen?: boolean;
  wordList?: { name: string; mock: string };
}

export interface MockEditorInstance {
  curData: MockEditorData;
  getValue: () => string;
  setValue: (data: string) => void;
  editor: ace.Editor;
  options: MockEditorOptions;
  insertCode: (code: string) => void;
}

const wordList: Array<{ name: string; mock: string }> = [];

function handleData(data: unknown): string {
  data = data || '';
  if (typeof data === 'string') {
    return data;
  } else if (typeof data === 'object') {
    return JSON.stringify(data, null, '  ');
  }
  return '';
}

export function run(options: MockEditorOptions): MockEditorInstance {
  const container = options.container;
  if (!container) throw new Error('AceEditor: container is required');

  if (
    options.wordList &&
    typeof options.wordList === 'object' &&
    options.wordList.name &&
    options.wordList.mock
  ) {
    wordList.push(options.wordList);
  }

  const data = options.data || '';
  const readOnly = options.readOnly || false;
  const fullScreen = options.fullScreen || false;

  const editor = ace.edit(container);
  editor.$blockScrolling = Infinity;
  editor.getSession().setMode('ace/mode/json');
  if (readOnly) {
    editor.setReadOnly(true);
    editor.renderer.$cursorLayer.element.style.display = 'none';
  }
  editor.setOptions({
    useWorker: true,
  });
  (editor as any)._fullscreen_yapi = fullScreen;

  const mockEditor: MockEditorInstance = {
    curData: { text: '', format: false, jsonData: null },
    getValue: () => mockEditor.curData.text,
    setValue: (data: string) => {
      editor.setValue(handleData(data));
    },
    editor,
    options,
    insertCode: (code: string) => {
      const pos = editor.selection.getCursor();
      editor.session.insert(pos, code);
    },
  };

  function handleJson(json: string) {
    const curData = mockEditor.curData;
    try {
      curData.text = json;
      const obj = JSON.parse(json);
      curData.format = true;
      curData.jsonData = obj;
    } catch (e: any) {
      curData.format = e.message;
    }
  }

  mockEditor.setValue(handleData(data));
  handleJson(editor.getValue());

  editor.clearSelection();

  editor.getSession().on('change', () => {
    handleJson(editor.getValue());
    if (typeof options.onChange === 'function') {
      options.onChange.call(mockEditor, mockEditor.curData);
    }
    editor.clearSelection();
  });

  return mockEditor;
}
