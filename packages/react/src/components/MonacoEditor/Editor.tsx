import React, { useCallback } from 'react';
import * as monaco from 'monaco-editor';
import Editor, { loader } from '@monaco-editor/react';

self.MonacoEnvironment = {
  getWorker: function (moduleId, label) {
    if (label === 'json') {
      return new Worker(
        new URL(
          'monaco-editor/esm/vs/language/json/json.worker',
          import.meta.url,
        ),
        { type: 'module' },
      );
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new Worker(
        new URL(
          'monaco-editor/esm/vs/language/html/html.worker',
          import.meta.url,
        ),
        { type: 'module' },
      );
    }
    if (label === 'typescript' || label === 'javascript') {
      return new Worker(
        new URL(
          'monaco-editor/esm/vs/language/typescript/ts.worker',
          import.meta.url,
        ),
        { type: 'module' },
      );
    }
    return new Worker(
      new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url),
      { type: 'module' },
    );
  },
};

loader.config({ monaco });

export interface MockEditorData {
  text: string;
  format: boolean | string;
  jsonData: Record<string, unknown> | null;
}

const LanguageMap: Record<string, string> = {
  javascript: 'javascript',
  json: 'json',
  text: 'plaintext',
  xml: 'xml',
  html: 'html',
};

type ModeKey = keyof typeof LanguageMap;

function buildMockEditorData(text: string): MockEditorData {
  try {
    const jsonData = JSON.parse(text);
    return { text, format: true, jsonData };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return { text, format: message, jsonData: null };
  }
}

export interface MocanoEditorProps {
  data?: string;
  onChange?: (data: MockEditorData) => void;
  className?: string;
  mode?: ModeKey;
}

export function MonacoEditor({
  data,
  onChange,
  className,
  mode = 'json',
}: MocanoEditorProps) {
  const handleChange = useCallback(
    (value: string | undefined) => {
      const text = value ?? '';
      onChange?.(buildMockEditorData(text));
    },
    [onChange],
  );

  return (
    <div
      className={className ?? 'monaco-editor-container'}
      style={
        !className
          ? { width: '100%', height: '400px', border: '1px solid #e5e7eb' }
          : undefined
      }
    >
      <Editor
        height="100%"
        language={LanguageMap[mode] ?? 'plaintext'}
        value={data ?? ''}
        onChange={handleChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </div>
  );
}

export default React.memo(MonacoEditor);
