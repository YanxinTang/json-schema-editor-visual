import { useState } from 'react';
import JsonSchemaEditorVisual from '@tyx1703/json-schema-editor-visual';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

const MOCK_SOURCE = [
  { name: '字符串', mock: '@string' },
  { name: '自然数', mock: '@natural' },
];

const CUSTOM_FORMATS = [
  { name: 'uuid', title: 'UUID' },
  { name: 'phone', title: 'Phone Number' },
];

const App = () => {
  const params = new URLSearchParams(window.location.search);
  const locale = params.get('locale');
  const showMock = params.get('mock') === '1';
  const showFormat = params.get('format') === '1';
  const initialData = params.get('data');

  const [schemaOutput, setSchemaOutput] = useState('');

  const editor = (
    <JsonSchemaEditorVisual
      data={initialData || undefined}
      mock={showMock ? MOCK_SOURCE : undefined}
      format={showFormat ? CUSTOM_FORMATS : undefined}
      onChange={setSchemaOutput}
    />
  );

  return (
    <div className="content">
      {locale === 'zh_CN' ? (
        <ConfigProvider locale={zhCN}>{editor}</ConfigProvider>
      ) : (
        editor
      )}
      <pre data-testid="schema-output">{schemaOutput}</pre>
    </div>
  );
};

export default App;
