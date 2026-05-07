import React, { useMemo } from 'react';
import { Input, AutoComplete } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import LocaleProvider from '../LocalProvider';
import { JsonSchema, MockSource } from '../../types';

interface MockSelectProps {
  schema: JsonSchema;
  showEdit: () => void;
  onChange: (value: string) => void;
  mockSource?: MockSource;
}

const MockSelect: React.FC<MockSelectProps> = ({ schema, showEdit, onChange, mockSource }) => {
  const disabled = schema.type === 'object' || schema.type === 'array';

  const options = useMemo(
    () => (mockSource || []).map((item) => ({ value: item.mock })),
    [mockSource],
  );

  return (
    <div>
      <AutoComplete
        className="certain-category-search"
        popupMatchSelectWidth={false}
        options={options}
        placeholder={LocaleProvider('mock')}
        filterOption={true}
        value={schema.mock ? schema.mock.mock : ''}
        onChange={onChange}
        disabled={disabled}
      >
        <Input
          disabled={disabled}
          suffix={
            <EditOutlined
              onClick={(e) => {
                e.stopPropagation();
                showEdit();
              }}
            />
          }
        />
      </AutoComplete>
    </div>
  );
};

export default MockSelect;
