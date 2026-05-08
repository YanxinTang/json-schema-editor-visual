import React, { useCallback } from 'react';
import Editor from '@monaco-editor/react';

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

interface AceEditorProps {
  data?: string;
  onChange?: (data: MockEditorData) => void;
  className?: string;
  mode?: ModeKey;
}

const AceEditor: React.FC<AceEditorProps> = ({
  data,
  onChange,
  className,
  mode = 'json',
}) => {
  const handleChange = useCallback(
    (value: string | undefined) => {
      const text = value ?? '';
      onChange?.(buildMockEditorData(text));
    },
    [onChange],
  );

  return (
    <div className={className ?? 'monaco-editor-container'} style={!className ? { width: '100%', height: '200px' } : undefined}>
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
};

export default React.memo(AceEditor);
