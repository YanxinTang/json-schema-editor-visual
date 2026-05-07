import React, { useMemo } from 'react';
import { Input, AutoComplete, Space, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import LocaleProvider from '../LocalProvider';
import { JsonSchema, MockSource } from '../../types';

interface MockSelectProps {
  schema: JsonSchema;
  showEdit: () => void;
  onChange: (value: string) => void;
  mockSource?: MockSource;
}

const MockSelect: React.FC<MockSelectProps> = ({
  schema,
  showEdit,
  onChange,
  mockSource,
}) => {
  const disabled = schema.type === 'object' || schema.type === 'array';

  const options = useMemo(
    () => (mockSource || []).map((item) => ({ value: item.mock })),
    [mockSource],
  );

  console.log('schema: ', schema);

  return (
    <Space.Compact className='mock-select'>
      <AutoComplete
        className="certain-category-search"
        style={{ flex: 1 }}
        popupMatchSelectWidth={false}
        options={options}
        placeholder={LocaleProvider('mock')}
        filterOption={true}
        value={schema.mock ? schema.mock.mock : ''}
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
};

export default MockSelect;
