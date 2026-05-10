import { useMemo } from 'react';
import { AutoComplete, Space, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useLocalProvider } from '../LocalProvider';
import { JsonSchema, MockSource } from '../../types';

interface MockSelectProps {
  schema: JsonSchema;
  showEdit: () => void;
  onChange: (value: string) => void;
  mock?: MockSource;
}

export default function MockSelect({
  schema,
  showEdit,
  onChange,
  mock,
}: MockSelectProps) {
  const LocaleProvider = useLocalProvider();
  const disabled = schema.type === 'object' || schema.type === 'array';

  const options = useMemo(
    () => (mock || []).map((item) => ({ value: item.mock })),
    [mock],
  );

  return (
    <Space.Compact className="mock-select">
      <AutoComplete
        className="certain-category-search"
        style={{ flex: 1 }}
        popupMatchSelectWidth={false}
        options={options}
        placeholder={LocaleProvider('mock')}
        filterOption={true}
        value={schema.mock?.mock}
        onChange={onChange}
        disabled={disabled}
      ></AutoComplete>
      <Button
        icon={<EditOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          showEdit();
        }}
      ></Button>
    </Space.Compact>
  );
}
