import React, { useState, useEffect, useMemo } from 'react';
import {
  Input,
  InputNumber,
  Row,
  Col,
  Select,
  Checkbox,
  Tooltip,
  Switch,
  SelectProps,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
const { TextArea } = Input;
import { isNil } from '../../utils';
const Option = Select.Option;
import AceEditor from '../MonacoEditor';
import type { MockEditorData } from '../MonacoEditor/Editor';
import { useLocalProvider } from '../LocalProvider';
import {
  JsonSchema,
  JsonSchemaString,
  JsonSchemaNumber,
  JsonSchemaBoolean,
  JsonSchemaArray,
  Format,
} from '../../types';

declare const TEST: boolean | undefined;

const changeOtherValue = <T extends JsonSchema>(
  value: unknown,
  name: string,
  data: T,
  change: (d: T) => void,
) => {
  change({ ...data, [name]: value });
};

interface SchemaStringProps {
  data: JsonSchemaString;
  changeCustomValue: (data: JsonSchemaString) => void;
  format: Format;
}

const SchemaString: React.FC<SchemaStringProps> = ({
  data,
  changeCustomValue,
  format,
}) => {
  const LocalProvider = useLocalProvider();
  const [checked, setChecked] = useState(isNil(data.enum) ? false : true);

  useEffect(() => {
    setChecked(isNil(data.enum) ? false : true);
  }, [data.enum]);

  const formatOptions: SelectProps['options'] = useMemo(
    () =>
      format.map((item) => ({
        key: item.name,
        label: item.name,
        value: item.name,
      })),
    [format],
  );

  const handleChangeOtherValue = (value: unknown, name: string) => {
    changeCustomValue({ ...data, [name]: value });
  };

  const changeEnumOtherValue = (value: string) => {
    const arr = value.split('\n');
    if (arr.length === 0 || (arr.length === 1 && !arr[0])) {
      const { enum: _enum, ...rest } = data;
      changeCustomValue(rest as JsonSchemaString);
    } else {
      changeCustomValue({ ...data, enum: arr });
    }
  };

  const changeEnumDescOtherValue = (value: string) => {
    changeCustomValue({ ...data, enumDesc: value });
  };

  const onChangeCheckBox = (checked: boolean) => {
    setChecked(checked);
    if (!checked) {
      const { enum: _enum, ...rest } = data;
      changeCustomValue(rest as JsonSchemaString);
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
            showSearch={{
              filterOption: (input, option) => {
                const linput = input.toLowerCase();
                const lvalue = (option!.value as string).toLowerCase();
                return lvalue.includes(linput);
              },
            }}
            style={{ width: 150 }}
            value={data.format}
            classNames={{
              popup: { root: 'json-schema-react-editor-adv-modal-select' },
            }}
            placeholder="Select a format"
            onChange={(e) => handleChangeOtherValue(e, 'format')}
            options={formatOptions}
          ></Select>
        </Col>
      </Row>
    </div>
  );
};

interface SchemaNumberProps {
  data: JsonSchemaNumber;
  changeCustomValue: (data: JsonSchemaNumber) => void;
}

const SchemaNumber: React.FC<SchemaNumberProps> = ({
  data,
  changeCustomValue,
}) => {
  const LocalProvider = useLocalProvider();
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
      const { enum: _enum, ...rest } = data;
      setEnumValue('');
      changeCustomValue(rest as JsonSchemaNumber);
    }
  };

  const changeEnumOtherValue = (value: string) => {
    setEnumValue(value);
    const arr = value.split('\n');
    if (arr.length === 0 || (arr.length === 1 && !arr[0])) {
      const { enum: _enum, ...rest } = data;
      changeCustomValue(rest as JsonSchemaNumber);
    } else {
      changeCustomValue({ ...data, enum: arr.map((item) => +item) });
    }
  };

  const changeEnumDescOtherValue = (value: string) => {
    changeCustomValue({ ...data, enumDesc: value });
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
            data-testid={TEST ? 'advSettingModal_default' : null}
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
                onChange={(e) =>
                  changeOtherValue(
                    e,
                    'exclusiveMinimum',
                    data,
                    changeCustomValue,
                  )
                }
                data-testid={TEST ? 'advSettingModal_exclusiveMinimum' : null}
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
                onChange={(e) =>
                  changeOtherValue(
                    e,
                    'exclusiveMaximum',
                    data,
                    changeCustomValue,
                  )
                }
                data-testid={TEST ? 'advSettingModal_exclusiveMaximum' : null}
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
                data-testid={TEST ? 'advSettingModal_minimum' : null}
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
                data-testid={TEST ? 'advSettingModal_maximum' : null}
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
              data-testid={TEST ? 'advSettingModal_enumCheckbox' : null}
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
            data-testid={TEST ? 'advSettingModal_enumTextarea' : null}
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
              data-testid={TEST ? 'advSettingModal_enumDesc' : null}
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

const SchemaBoolean: React.FC<SchemaBooleanProps> = ({
  data,
  changeCustomValue,
}) => {
  const LocalProvider = useLocalProvider();
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
            data-testid={TEST ? 'advSettingModal_defaultSelect' : null}
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

const SchemaArray: React.FC<SchemaArrayAdvProps> = ({
  data,
  changeCustomValue,
}) => {
  const LocalProvider = useLocalProvider();
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
            onChange={(e) =>
              changeOtherValue(e, 'uniqueItems', data, changeCustomValue)
            }
            data-testid={TEST ? 'advSettingModal_uniqueItemsSwitch' : null}
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
                data-testid={TEST ? 'advSettingModal_minItemsInput' : null}
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
                data-testid={TEST ? 'advSettingModal_maxItemsInput' : null}
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
    string: (
      <SchemaString
        data={data as JsonSchemaString}
        changeCustomValue={changeCustomValue as (d: JsonSchemaString) => void}
        format={format}
      />
    ),
    number: (
      <SchemaNumber
        data={data as JsonSchemaNumber}
        changeCustomValue={changeCustomValue as (d: JsonSchemaNumber) => void}
      />
    ),
    boolean: (
      <SchemaBoolean
        data={data as JsonSchemaBoolean}
        changeCustomValue={changeCustomValue as (d: JsonSchemaBoolean) => void}
      />
    ),
    integer: (
      <SchemaNumber
        data={data as JsonSchemaNumber}
        changeCustomValue={changeCustomValue as (d: JsonSchemaNumber) => void}
      />
    ),
    array: (
      <SchemaArray
        data={data as JsonSchemaArray}
        changeCustomValue={changeCustomValue as (d: JsonSchemaArray) => void}
      />
    ),
  };
  return map[data.type];
};

const handleInputEditor = (
  e: MockEditorData,
  change: (d: JsonSchema) => void,
) => {
  if (!e.text || !e.jsonData) return;
  change(e.jsonData as unknown as JsonSchema);
};

interface CustomItemProps {
  data: string;
  changeCustomValue: (data: JsonSchema) => void;
  format: Format;
}

export default function CustomItem({
  data,
  changeCustomValue,
  format,
}: CustomItemProps) {
  const LocalProvider = useLocalProvider();
  const parsed = JSON.parse(data) as JsonSchema;
  const optionForm = mapping(parsed, changeCustomValue, format);

  return (
    <div>
      <div>{optionForm}</div>
      <div className="default-setting">{LocalProvider('all_setting')}</div>
      <AceEditor
        data={data}
        mode="json"
        onChange={(e) => handleInputEditor(e, changeCustomValue)}
      />
    </div>
  );
}
