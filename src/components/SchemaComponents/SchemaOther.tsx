import React, { useState, useEffect } from 'react';
import {
  Input,
  InputNumber,
  Row,
  Col,
  Select,
  Checkbox,
  Tooltip,
  Switch,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
const { TextArea } = Input;
import './schemaJson.css';
import { isNil } from '../../utils';
const Option = Select.Option;
import AceEditor from '../AceEditor/AceEditor';
import LocalProvider from '../LocalProvider';
import {
  JsonSchema,
  JsonSchemaString,
  JsonSchemaNumber,
  JsonSchemaBoolean,
  JsonSchemaArray,
  Format,
} from '../../types';

declare const TEST: boolean | undefined;

const changeOtherValue = (
  value: unknown,
  name: string,
  data: JsonSchema,
  change: (d: JsonSchema) => void,
) => {
  (data as Record<string, unknown>)[name] = value;
  change(data);
};

interface SchemaStringProps {
  data: JsonSchemaString;
  changeCustomValue: (data: JsonSchemaString) => void;
  format: Format;
}

const SchemaString: React.FC<SchemaStringProps> = ({ data, changeCustomValue, format }) => {
  const [checked, setChecked] = useState(isNil(data.enum) ? false : true);

  useEffect(() => {
    setChecked(isNil(data.enum) ? false : true);
  }, [data.enum]);

  const handleChangeOtherValue = (value: unknown, name: string) => {
    (data as Record<string, unknown>)[name] = value;
    changeCustomValue(data);
  };

  const changeEnumOtherValue = (value: string) => {
    const arr = value.split('\n');
    if (arr.length === 0 || (arr.length === 1 && !arr[0])) {
      delete data.enum;
      changeCustomValue(data);
    } else {
      data.enum = arr;
      changeCustomValue(data);
    }
  };

  const changeEnumDescOtherValue = (value: string) => {
    data.enumDesc = value;
    changeCustomValue(data);
  };

  const onChangeCheckBox = (checked: boolean) => {
    setChecked(checked);
    if (!checked) {
      delete data.enum;
      changeCustomValue(data);
    }
  };

  return (
    <div>
      <div className="default-setting">{LocalProvider('base_setting')}</div>
      <Row className="other-row" align="middle">
        <Col span={4} className="other-label">
          {LocalProvider('default')}：
        </Col>
        <Col span={20}>
          <Input
            value={data.default}
            placeholder={LocalProvider('default')}
            onChange={(e) => handleChangeOtherValue(e.target.value, 'default')}
          />
        </Col>
      </Row>
      <Row className="other-row" align="middle">
        <Col span={12}>
          <Row align="middle">
            <Col span={8} className="other-label">
              {LocalProvider('minLength')}：
            </Col>
            <Col span={16}>
              <InputNumber
                value={data.minLength}
                placeholder="min.length"
                onChange={(e) => handleChangeOtherValue(e, 'minLength')}
              />
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row align="middle">
            <Col span={8} className="other-label">
              {LocalProvider('maxLength')}：
            </Col>
            <Col span={16}>
              <InputNumber
                value={data.maxLength}
                placeholder="max.length"
                onChange={(e) => handleChangeOtherValue(e, 'maxLength')}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="other-row" align="middle">
        <Col span={4} className="other-label">
          <span>
            Pattern&nbsp;
            <Tooltip title={LocalProvider('pattern')}>
              <QuestionCircleOutlined
                type="question-circle-o"
                style={{ width: '10px' }}
              />
            </Tooltip>
            &nbsp; :
          </span>
        </Col>
        <Col span={20}>
          <Input
            value={data.pattern}
            placeholder="Pattern"
            onChange={(e) => handleChangeOtherValue(e.target.value, 'pattern')}
          />
        </Col>
      </Row>
      <Row className="other-row" align="middle">
        <Col span={4} className="other-label">
          <span>
            {LocalProvider('enum')}
            <Checkbox
              checked={checked}
              onChange={(e) => onChangeCheckBox(e.target.checked)}
            />{' '}
            :
          </span>
        </Col>
        <Col span={20}>
          <TextArea
            value={data.enum && data.enum.length && data.enum.join('\n')}
            disabled={!checked}
            placeholder={LocalProvider('enum_msg')}
            autoSize={{ minRows: 2, maxRows: 6 }}
            onChange={(e) => {
              changeEnumOtherValue(e.target.value);
            }}
          />
        </Col>
      </Row>
      {checked && (
        <Row className="other-row" align="middle">
          <Col span={4} className="other-label">
            <span>{LocalProvider('enum_desc')}</span>
          </Col>
          <Col span={20}>
            <TextArea
              value={data.enumDesc}
              disabled={!checked}
              placeholder={LocalProvider('enum_desc_msg')}
              autoSize={{ minRows: 2, maxRows: 6 }}
              onChange={(e) => {
                changeEnumDescOtherValue(e.target.value);
              }}
            />
          </Col>
        </Row>
      )}
      <Row className="other-row" align="middle">
        <Col span={4} className="other-label">
          <span>format :</span>
        </Col>
        <Col span={20}>
          <Select
            showSearch
            style={{ width: 150 }}
            value={data.format}
            dropdownClassName="json-schema-react-editor-adv-modal-select"
            placeholder="Select a format"
            optionFilterProp="children"
            optionLabelProp="value"
            onChange={(e) => handleChangeOtherValue(e, 'format')}
            filterOption={(input, option) => {
              return (
                (option?.value as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              );
            }}
          >
            {format.map((item) => {
              return (
                <Option value={item.name} key={item.name}>
                  {item.name}{' '}
                  <span className="format-items-title">{item.title}</span>
                </Option>
              );
            })}
          </Select>
        </Col>
      </Row>
    </div>
  );
};

interface SchemaNumberProps {
  data: JsonSchemaNumber;
  changeCustomValue: (data: JsonSchemaNumber) => void;
}

const SchemaNumber: React.FC<SchemaNumberProps> = ({ data, changeCustomValue }) => {
  const [checked, setChecked] = useState(isNil(data.enum) ? false : true);
  const [enumValue, setEnumValue] = useState(
    isNil(data.enum) ? '' : data.enum.join('\n'),
  );

  useEffect(() => {
    const nextEnumStr = isNil(data.enum) ? '' : data.enum.join('\n');
    setEnumValue(nextEnumStr);
  }, [data.enum]);

  const onChangeCheckBox = (checked: boolean) => {
    setChecked(checked);
    if (!checked) {
      delete data.enum;
      setEnumValue('');
      changeCustomValue(data);
    }
  };

  const changeEnumOtherValue = (value: string) => {
    setEnumValue(value);
    const arr = value.split('\n');
    if (arr.length === 0 || (arr.length === 1 && !arr[0])) {
      delete data.enum;
      changeCustomValue(data);
    } else {
      data.enum = arr.map((item) => +item);
      changeCustomValue(data);
    }
  };

  const changeEnumDescOtherValue = (value: string) => {
    data.enumDesc = value;
    changeCustomValue(data);
  };

  return (
    <div>
      <div className="default-setting">{LocalProvider('base_setting')}</div>
      <Row className="other-row" align="middle">
        <Col span={4} className="other-label">
          {LocalProvider('default')}：
        </Col>
        <Col span={20}>
          <Input
            value={data.default}
            placeholder={LocalProvider('default')}
            onChange={(e) =>
              changeOtherValue(
                e.target.value,
                'default',
                data,
                changeCustomValue,
              )
            }
            data-testid={TEST ? 'advSettingModal_default' : undefined}
          />
        </Col>
      </Row>
      <Row className="other-row" align="middle">
        <Col span={12}>
          <Row align="middle">
            <Col span={13} className="other-label">
              <span>
                exclusiveMinimum&nbsp;
                <Tooltip title={LocalProvider('exclusiveMinimum')}>
                  <QuestionCircleOutlined
                    type="question-circle-o"
                    style={{ width: '10px' }}
                  />
                </Tooltip>
                &nbsp; :
              </span>
            </Col>
            <Col span={11}>
              <Switch
                checked={data.exclusiveMinimum}
                placeholder="exclusiveMinimum"
                onChange={(e) =>
                  changeOtherValue(
                    e,
                    'exclusiveMinimum',
                    data,
                    changeCustomValue,
                  )
                }
                data-testid={TEST ? 'advSettingModal_exclusiveMinimum' : undefined}
              />
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row align="middle">
            <Col span={13} className="other-label">
              <span>
                exclusiveMaximum&nbsp;
                <Tooltip title={LocalProvider('exclusiveMaximum')}>
                  <QuestionCircleOutlined
                    type="question-circle-o"
                    style={{ width: '10px' }}
                  />
                </Tooltip>
                &nbsp; :
              </span>
            </Col>
            <Col span={11}>
              <Switch
                checked={data.exclusiveMaximum}
                placeholder="exclusiveMaximum"
                onChange={(e) =>
                  changeOtherValue(
                    e,
                    'exclusiveMaximum',
                    data,
                    changeCustomValue,
                  )
                }
                data-testid={TEST ? 'advSettingModal_exclusiveMaximum' : undefined}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="other-row" align="middle">
        <Col span={12}>
          <Row align="middle">
            <Col span={8} className="other-label">
              {LocalProvider('minimum')}：
            </Col>
            <Col span={16}>
              <InputNumber
                value={data.minimum}
                placeholder={LocalProvider('minimum')}
                onChange={(e) =>
                  changeOtherValue(e, 'minimum', data, changeCustomValue)
                }
                data-testid={TEST ? 'advSettingModal_minimum' : undefined}
              />
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row align="middle">
            <Col span={8} className="other-label">
              {LocalProvider('maximum')}：
            </Col>
            <Col span={16}>
              <InputNumber
                value={data.maximum}
                placeholder={LocalProvider('maximum')}
                onChange={(e) =>
                  changeOtherValue(e, 'maximum', data, changeCustomValue)
                }
                data-testid={TEST ? 'advSettingModal_maximum' : undefined}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="other-row" align="middle">
        <Col span={4} className="other-label">
          <span>
            {LocalProvider('enum')}
            <Checkbox
              checked={checked}
              onChange={(e) => onChangeCheckBox(e.target.checked)}
              data-testid={TEST ? 'advSettingModal_enumCheckbox' : undefined}
            />{' '}
            :
          </span>
        </Col>
        <Col span={20}>
          <TextArea
            value={enumValue}
            disabled={!checked}
            placeholder={LocalProvider('enum_msg')}
            autoSize={{ minRows: 2, maxRows: 6 }}
            onChange={(e) => {
              changeEnumOtherValue(e.target.value);
            }}
            data-testid={TEST ? 'advSettingModal_enumTextarea' : undefined}
          />
        </Col>
      </Row>
      {checked && (
        <Row className="other-row" align="middle">
          <Col span={4} className="other-label">
            <span>{LocalProvider('enum_desc')} ：</span>
          </Col>
          <Col span={20}>
            <TextArea
              value={data.enumDesc}
              disabled={!checked}
              placeholder={LocalProvider('enum_desc_msg')}
              autoSize={{ minRows: 2, maxRows: 6 }}
              onChange={(e) => {
                changeEnumDescOtherValue(e.target.value);
              }}
              data-testid={TEST ? 'advSettingModal_enumDesc' : undefined}
            />
          </Col>
        </Row>
      )}
    </div>
  );
};

interface SchemaBooleanProps {
  data: JsonSchemaBoolean;
  changeCustomValue: (data: JsonSchemaBoolean) => void;
}

const SchemaBoolean: React.FC<SchemaBooleanProps> = ({ data, changeCustomValue }) => {
  const value = isNil(data.default) ? '' : data.default ? 'true' : 'false';
  return (
    <div>
      <div className="default-setting">{LocalProvider('base_setting')}</div>
      <Row className="other-row" align="middle">
        <Col span={4} className="other-label">
          {LocalProvider('default')}：
        </Col>
        <Col span={20}>
          <Select
            value={value}
            onChange={(e) =>
              changeOtherValue(
                e === 'true' ? true : false,
                'default',
                data,
                changeCustomValue,
              )
            }
            style={{ width: 200 }}
            data-testid={TEST ? 'advSettingModal_defaultSelect' : undefined}
          >
            <Option value="true">true</Option>
            <Option value="false">false</Option>
          </Select>
        </Col>
      </Row>
    </div>
  );
};

interface SchemaArrayAdvProps {
  data: JsonSchemaArray;
  changeCustomValue: (data: JsonSchemaArray) => void;
}

const SchemaArray: React.FC<SchemaArrayAdvProps> = ({ data, changeCustomValue }) => {
  return (
    <div>
      <div className="default-setting">{LocalProvider('base_setting')}</div>
      <Row className="other-row" align="middle">
        <Col span={6} className="other-label">
          <span>
            uniqueItems&nbsp;
            <Tooltip title={LocalProvider('unique_items')}>
              <QuestionCircleOutlined
                type="question-circle-o"
                style={{ width: '10px' }}
              />
            </Tooltip>
            &nbsp; :
          </span>
        </Col>
        <Col span={18}>
          <Switch
            checked={data.uniqueItems}
            placeholder="uniqueItems"
            onChange={(e) =>
              changeOtherValue(e, 'uniqueItems', data, changeCustomValue)
            }
            data-testid={TEST ? 'advSettingModal_uniqueItemsSwitch' : undefined}
          />
        </Col>
      </Row>
      <Row className="other-row" align="middle">
        <Col span={12}>
          <Row align="middle">
            <Col span={12} className="other-label">
              {LocalProvider('min_items')}：
            </Col>
            <Col span={12}>
              <InputNumber
                value={data.minItems}
                placeholder="minItems"
                onChange={(e) =>
                  changeOtherValue(e, 'minItems', data, changeCustomValue)
                }
                data-testid={TEST ? 'advSettingModal_minItemsInput' : undefined}
              />
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row align="middle">
            <Col span={12} className="other-label">
              {LocalProvider('max_items')}：
            </Col>
            <Col span={12}>
              <InputNumber
                value={data.maxItems}
                placeholder="maxItems"
                onChange={(e) =>
                  changeOtherValue(e, 'maxItems', data, changeCustomValue)
                }
                data-testid={TEST ? 'advSettingModal_maxItemsInput' : undefined}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

const mapping = (
  data: JsonSchema,
  changeCustomValue: (d: JsonSchema) => void,
  format: Format,
) => {
  const map: Record<string, React.ReactNode> = {
    string: <SchemaString data={data as JsonSchemaString} changeCustomValue={changeCustomValue as (d: JsonSchemaString) => void} format={format} />,
    number: <SchemaNumber data={data as JsonSchemaNumber} changeCustomValue={changeCustomValue as (d: JsonSchemaNumber) => void} />,
    boolean: <SchemaBoolean data={data as JsonSchemaBoolean} changeCustomValue={changeCustomValue as (d: JsonSchemaBoolean) => void} />,
    integer: <SchemaNumber data={data as JsonSchemaNumber} changeCustomValue={changeCustomValue as (d: JsonSchemaNumber) => void} />,
    array: <SchemaArray data={data as JsonSchemaArray} changeCustomValue={changeCustomValue as (d: JsonSchemaArray) => void} />,
  };
  return map[data.type];
};

const handleInputEditor = (
  e: { text: string; jsonData: JsonSchema },
  change: (d: JsonSchema) => void,
) => {
  if (!e.text) return;
  change(e.jsonData);
};

interface CustomItemProps {
  data: string;
  changeCustomValue: (data: JsonSchema) => void;
  formatSource: Format;
}

const CustomItem: React.FC<CustomItemProps> = ({ data, changeCustomValue, formatSource }) => {
  const parsed = JSON.parse(data) as JsonSchema;
  const format = formatSource;
  const optionForm = mapping(parsed, changeCustomValue, format);

  return (
    <div>
      <div>{optionForm}</div>
      <div className="default-setting">{LocalProvider('all_setting')}</div>
      <AceEditor
        data={data}
        mode="json"
        onChange={(e: { text: string; jsonData: JsonSchema }) => handleInputEditor(e, changeCustomValue)}
      />
    </div>
  );
};

export default CustomItem;
