import React, { useRef, useEffect } from 'react';
import { run as mockEditor } from './mockEditor';
import type { MockEditorInstance, MockEditorData } from './mockEditor';
import _ from 'underscore';
import type ace from 'brace';

const ModeMap = {
  javascript: 'ace/mode/javascript',
  json: 'ace/mode/json',
  text: 'ace/mode/text',
  xml: 'ace/mode/xml',
  html: 'ace/mode/html',
} as const;

type ModeKey = keyof typeof ModeMap;

function isNotMatch(a: unknown, b: unknown): boolean {
  try {
    a = JSON.parse(a as string);
    b = JSON.parse(b as string);
    return !_.isEqual(a, b);
  } catch (e) {
    return true;
  }
}

function getMode(mode: string): string {
  return ModeMap[mode as ModeKey] || ModeMap.text;
}

interface AceEditorProps {
  data?: string;
  onChange?: (data: MockEditorData) => void;
  className?: string;
  mode?: ModeKey;
  readOnly?: boolean;
  callback?: (editor: ace.Editor) => void;
  style?: React.CSSProperties;
  fullScreen?: boolean;
  insertCode?: (code: string) => void;
}

const AceEditor: React.FC<AceEditorProps> = ({
  data,
  onChange,
  className,
  mode = 'javascript',
  readOnly,
  callback,
  style,
  fullScreen,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<MockEditorInstance | null>(null);
  const prevDataRef = useRef(data);

  useEffect(() => {
    const instance = mockEditor({
      container: editorRef.current,
      data,
      onChange,
      readOnly,
      fullScreen,
    });

    instance.editor.getSession().setMode(getMode(mode));
    instanceRef.current = instance;

    if (typeof callback === 'function') {
      callback(instance.editor);
    }

    return () => {
      instance.editor.destroy();
    };
  }, []);

  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance) return;

    if (
      isNotMatch(data, prevDataRef.current) &&
      isNotMatch(instance.getValue(), data)
    ) {
      instance.setValue(data || '');
      instance.editor.getSession().setMode(getMode(mode));
      instance.editor.clearSelection();
    }
    prevDataRef.current = data;
  }, [data, mode]);

  return (
    <div
      className={className}
      style={className ? undefined : style || { width: '100%', height: '200px' }}
      ref={editorRef}
    />
  );
};

export default React.memo(AceEditor);
