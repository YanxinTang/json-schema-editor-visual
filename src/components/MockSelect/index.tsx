import React, { useContext, useMemo } from 'react';
import { Input, AutoComplete } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import LocaleProvider from '../LocalProvider/index.js';
import { SchemaEditorContext } from '../../SchemaEditorContext';
import { JsonSchema } from '../../types';

interface MockSelectProps {
  schema: JsonSchema;
  showEdit: () => void;
  onChange: (value: string) => void;
}

const MockSelect: React.FC<MockSelectProps> = ({ schema, showEdit, onChange }) => {
  const { Model } = useContext(SchemaEditorContext);
  const mock = (Model as any).__jsonSchemaMock || [];
  const disabled = schema.type === 'object' || schema.type === 'array';

  const options = useMemo(
    () => mock.map((item: { mock: string }) => ({ value: item.mock })),
    [mock],
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
