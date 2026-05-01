import React, { useContext, useMemo, useCallback } from 'react';
import {
  Dropdown,
  Menu,
  Row,
  Col,
  Form,
  Select,
  Checkbox,
  Input,
  Tooltip,
  message,
} from 'antd';
import {
  CaretDownOutlined,
  CaretRightOutlined,
  EditOutlined,
  SettingOutlined,
  PlusOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import _ from 'underscore';
import { JSONPATH_JOIN_CHAR, SCHEMA_TYPE } from '../../utils.js';
import FieldInput from './FieldInput.js';
import LocaleProvider from '../LocalProvider/index.js';
import MockSelect from '../MockSelect/index.js';
import { SchemaEditorContext } from '../../SchemaEditorContext.js';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import {
  addChildFieldAction,
  addFieldAction,
  setOpenValueAction,
} from '../../store/schemaSlice';

import './schemaJson.css';
import { JSONSchema } from '../../types.js';

const { Option } = Select;

// 声明全局 TEST 变量，避免 TS 报错
declare const TEST: boolean | undefined;

// ==========================
// Types & Interfaces
// ==========================


export interface CommonProps {
  prefix: string[];
  data: JSONSchema;
  showEdit: (prefix: string[], name: string, value: any, type: string) => void;
  showAdv: (prefix: string[], value: any) => void;
}

export interface SchemaItemProps extends CommonProps {
  name: string;
}

export interface DropPlusProps {
  prefix: string[];
  name: string;
}

interface EditorContextType {
  Model: {
    schema: {
      changeTypeAction: (payload: { key: string[]; value: string }) => void;
      changeValueAction: (payload: { key: string[]; value: any }) => void;
      changeNameAction: (payload: { value: string; prefix: string[]; name: string }) => void;
      addChildFieldAction: (payload: { key: string[] }) => void;
      setOpenValueAction: (payload: { key: string[]; value?: boolean }) => void;
      deleteItemAction: (payload: { key: string[] }) => void;
      enableRequireAction: (payload: { prefix: string[]; name: string; required: boolean }) => void;
      addFieldAction: (payload: { prefix: string[]; name: string }) => void;
    };
  };
  getOpenValue: (keys: string[]) => boolean;
  isMock: boolean;
}

// ==========================
// Render Mapping function
// ==========================

const mapping = (
  name: string[],
  data: JSONSchema,
  showEdit: CommonProps['showEdit'],
  showAdv: CommonProps['showAdv']
) => {
  switch (data.type) {
    case 'array':
      return <SchemaArray prefix={name} data={data} showEdit={showEdit} showAdv={showAdv} />;
    case 'object':
      const nameArray = [...name, 'properties'];
      return <SchemaObject prefix={nameArray} data={data} showEdit={showEdit} showAdv={showAdv} />;
    default:
      return null;
  }
};

// ==========================
// SchemaArray Component
// ==========================

const SchemaArray: React.FC<CommonProps> = React.memo(({ data, prefix, showEdit, showAdv }) => {
  const context = useContext(SchemaEditorContext) as EditorContextType;
  const Model = context.Model.schema;

  const tagPaddingLeftStyle = useMemo(() => {
    const length = prefix.filter((name) => name !== 'properties').length;
    return { paddingLeft: `${20 * (length + 1)}px` };
  }, [prefix]);

  const getPrefix = useCallback(() => [...prefix, 'items'], [prefix]);

  const handleChangeType = (value: string) => {
    const key = [...getPrefix(), 'type'];
    Model.changeTypeAction({ key, value });
  };

  const handleChangeDesc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = [...getPrefix(), 'description'];
    Model.changeValueAction({ key, value: e.target.value });
  };

  const handleChangeMock = (e: string) => {
    const key = [...getPrefix(), 'mock'];
    const value = e ? { mock: e } : '';
    Model.changeValueAction({ key, value });
  };

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = [...getPrefix(), 'title'];
    Model.changeValueAction({ key, value: e.target.value });
  };

  const handleAddChildField = () => {
    const keyArr = [...getPrefix(), 'properties'];
    Model.addChildFieldAction({ key: keyArr });
    Model.setOpenValueAction({ key: keyArr, value: true });
  };

  const handleClickIcon = () => {
    const keyArr = [...getPrefix(), 'properties'];
    Model.setOpenValueAction({ key: keyArr });
  };

  const handleShowEdit = (name: string, type?: string) => {
    showEdit(getPrefix(), name, data.items![name], type!);
  };

  const handleShowAdv = () => {
    showAdv(getPrefix(), data.items!);
  };

  if (_.isUndefined(data.items)) return null;

  const items = data.items;
  const prefixArray = getPrefix();
  const prefixArrayStr = [...prefixArray, 'properties'].join(JSONPATH_JOIN_CHAR);
  const showIcon = context.getOpenValue([prefixArrayStr]);

  return (
    <div className="array-type">
      <Row className="array-item-type" type="flex" justify="space-around" align="middle">
        <Col span={8} className="col-item name-item col-item-name" style={tagPaddingLeftStyle}>
          <Row type="flex" justify="space-around" align="middle">
            <Col span={2} className="down-style-col">
              {items.type === 'object' && (
                <span className="down-style" onClick={handleClickIcon}>
                  {showIcon ? (
                    <CaretDownOutlined className="icon-object" />
                  ) : (
                    <CaretRightOutlined className="icon-object" />
                  )}
                </span>
              )}
            </Col>
            <Col span={22}>
              <Input addonAfter={<Checkbox disabled />} disabled value="Items" />
            </Col>
          </Row>
        </Col>
        <Col span={3} className="col-item col-item-type">
          <Select className="type-select-style" onChange={handleChangeType} value={items.type}>
            {SCHEMA_TYPE.map((item, index) => (
              <Option value={item} key={index}>
                {item}
              </Option>
            ))}
          </Select>
        </Col>
        {context.isMock && (
          <Col span={3} className="col-item col-item-mock">
            <MockSelect
              schema={items}
              showEdit={() => handleShowEdit('mock', items.type)}
              onChange={handleChangeMock}
            />
          </Col>
        )}
        <Col span={context.isMock ? 4 : 5} className="col-item col-item-mock">
          <Input
            addonAfter={<EditOutlined onClick={() => handleShowEdit('title')} />}
            placeholder={LocaleProvider('title')}
            value={items.title}
            onChange={handleChangeTitle}
          />
        </Col>
        <Col span={context.isMock ? 4 : 5} className="col-item col-item-desc">
          <Input
            addonAfter={<EditOutlined onClick={() => handleShowEdit('description')} />}
            placeholder={LocaleProvider('description')}
            value={items.description}
            onChange={handleChangeDesc}
          />
        </Col>
        <Col span={context.isMock ? 2 : 3} className="col-item col-item-setting">
          <span className="adv-set" onClick={handleShowAdv}>
            <Tooltip placement="top" title={LocaleProvider('adv_setting')}>
              <SettingOutlined />
            </Tooltip>
          </span>
          {items.type === 'object' && (
            <span onClick={handleAddChildField}>
              <Tooltip placement="top" title={LocaleProvider('add_child_node')}>
                <PlusOutlined className="plus" />
              </Tooltip>
            </span>
          )}
        </Col>
      </Row>
      <div className="option-formStyle">{mapping(prefixArray, items, showEdit, showAdv)}</div>
    </div>
  );
});

// ==========================
// SchemaItem Component
// ==========================

const SchemaItem: React.FC<SchemaItemProps> = React.memo(({ name, data, prefix, showEdit, showAdv }) => {
  const context = useContext(SchemaEditorContext) as EditorContextType;
  const Model = context.Model.schema;

  const tagPaddingLeftStyle = useMemo(() => {
    const length = prefix.filter((n) => n !== 'properties').length;
    return { paddingLeft: `${20 * (length + 1)}px` };
  }, [prefix]);

  const getPrefix = useCallback(() => [...prefix, name], [prefix, name]);

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (data.properties![value] && typeof data.properties![value] === 'object') {
      return message.error(`The field "${value}" already exists.`);
    }
    Model.changeNameAction({ value, prefix, name });
  };

  const handleChangeDesc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = [...getPrefix(), 'description'];
    Model.changeValueAction({ key, value: e.target.value });
  };

  const handleChangeMock = (e: string) => {
    const key = [...getPrefix(), 'mock'];
    const value = e ? { mock: e } : '';
    Model.changeValueAction({ key, value });
  };

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = [...getPrefix(), 'title'];
    Model.changeValueAction({ key, value: e.target.value });
  };

  const handleChangeType = (value: string) => {
    const key = [...getPrefix(), 'type'];
    Model.changeTypeAction({ key, value });
  };

  const handleDeleteItem = () => {
    const keyArr = getPrefix();
    Model.deleteItemAction({ key: keyArr });
    Model.enableRequireAction({ prefix, name, required: false });
  };

  const handleShowEdit = (editorName: string, type?: string) => {
    showEdit(getPrefix(), editorName, data.properties![name][editorName], type!);
  };

  const handleShowAdv = () => {
    showAdv(getPrefix(), data.properties![name]);
  };

  const handleAddField = () => {
    Model.addFieldAction({ prefix, name });
  };

  const handleClickIcon = () => {
    const keyArr = [...getPrefix(), 'properties'];
    Model.setOpenValueAction({ key: keyArr });
  };

  const handleEnableRequire = (e: any) => {
    const required = e.target.checked;
    Model.enableRequireAction({ prefix, name, required });
  };

  const value = data.properties![name];
  const prefixArray = getPrefix();
  const prefixStr = prefix.join(JSONPATH_JOIN_CHAR);
  const prefixArrayStr = [...prefixArray, 'properties'].join(JSONPATH_JOIN_CHAR);
  
  const show = context.getOpenValue([prefixStr]);
  const showIcon = context.getOpenValue([prefixArrayStr]);

  if (!show) return null;

  return (
    <div data-testid={typeof TEST !== 'undefined' && TEST ? 'SchemaItem' : undefined}>
      <Row type="flex" justify="space-around" align="middle">
        <Col span={8} className="col-item name-item col-item-name" style={tagPaddingLeftStyle}>
          <Row type="flex" justify="space-around" align="middle">
            <Col span={2} className="down-style-col">
              {value.type === 'object' && (
                <span className="down-style" onClick={handleClickIcon}>
                  {showIcon ? (
                    <CaretDownOutlined className="icon-object" />
                  ) : (
                    <CaretRightOutlined className="icon-object" />
                  )}
                </span>
              )}
            </Col>
            <Col span={22}>
              <FieldInput
                addonAfter={
                  <Tooltip placement="top" title={LocaleProvider('required')}>
                    <Checkbox
                      onChange={handleEnableRequire}
                      checked={
                        _.isUndefined(data.required) ? false : data.required.includes(name)
                      }
                    />
                  </Tooltip>
                }
                onChange={handleChangeName}
                value={name}
                data-testid={typeof TEST !== 'undefined' && TEST ? 'SchemaItem_propNameInput' : undefined}
              />
            </Col>
          </Row>
        </Col>

        <Col span={3} className="col-item col-item-type">
          <Select className="type-select-style" onChange={handleChangeType} value={value.type}>
            {SCHEMA_TYPE.map((item, index) => (
              <Option value={item} key={index}>
                {item}
              </Option>
            ))}
          </Select>
        </Col>

        {context.isMock && (
          <Col span={3} className="col-item col-item-mock">
            <MockSelect
              schema={value}
              showEdit={() => handleShowEdit('mock', value.type)}
              onChange={handleChangeMock}
            />
          </Col>
        )}

        <Col span={context.isMock ? 4 : 5} className="col-item col-item-mock">
          <Input
            addonAfter={<EditOutlined onClick={() => handleShowEdit('title')} />}
            placeholder={LocaleProvider('title')}
            value={value.title}
            onChange={handleChangeTitle}
            data-testid={typeof TEST !== 'undefined' && TEST ? 'SchemaItem_titleInput' : undefined}
          />
        </Col>

        <Col span={context.isMock ? 4 : 5} className="col-item col-item-desc">
          <Input
            addonAfter={<EditOutlined onClick={() => handleShowEdit('description')} />}
            placeholder={LocaleProvider('description')}
            value={value.description}
            onChange={handleChangeDesc}
            data-testid={typeof TEST !== 'undefined' && TEST ? 'SchemaItem_descInput' : undefined}
          />
        </Col>

        <Col span={context.isMock ? 2 : 3} className="col-item col-item-setting">
          <span
            className="adv-set"
            onClick={handleShowAdv}
            data-testid={typeof TEST !== 'undefined' && TEST ? 'SchemaItem_FieldInput_advSet' : undefined}
          >
            <Tooltip placement="top" title={LocaleProvider('adv_setting')}>
              <SettingOutlined />
            </Tooltip>
          </span>
          <span className="delete-item" onClick={handleDeleteItem}>
            <CloseOutlined className="close" />
          </span>
          {value.type === 'object' ? (
            <DropPlus prefix={prefix} name={name} />
          ) : (
            <span onClick={handleAddField}>
              <Tooltip placement="top" title={LocaleProvider('add_sibling_node')}>
                <PlusOutlined className="plus" />
              </Tooltip>
            </span>
          )}
        </Col>
      </Row>
      <div className="option-formStyle">{mapping(prefixArray, value, showEdit, showAdv)}</div>
    </div>
  );
});

// ==========================
// SchemaObject Component
// ==========================

const SchemaObjectComponent: React.FC<CommonProps> = ({ data, prefix, showEdit, showAdv }) => {
  // 仅作为依赖注入，触发组件在Redux state open发生变化时重新渲染
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const open = useAppSelector((state: any) => state.schema.open);

  return (
    <div className="object-style">
      {Object.keys(data.properties || {}).map((name) => (
        <SchemaItem
          key={name}
          data={data}
          name={name}
          prefix={prefix}
          showEdit={showEdit}
          showAdv={showAdv}
        />
      ))}
    </div>
  );
};

// 保持原来的 shouldComponentUpdate 深比较优化
const SchemaObject = React.memo(SchemaObjectComponent, (prevProps, nextProps) => {
  return _.isEqual(prevProps.data, nextProps.data) && _.isEqual(prevProps.prefix, nextProps.prefix);
});

// ==========================
// DropPlus Component
// ==========================

const DropPlus: React.FC<DropPlusProps> = ({ prefix, name }) => {
  const dispatch = useAppDispatch();

  const menu = (
    <Menu>
      <Menu.Item key="sibling">
        <span onClick={() => dispatch(addFieldAction({ prefix, name }))}>
          {LocaleProvider('sibling_node')}
        </span>
      </Menu.Item>
      <Menu.Item key="child">
        <span
          onClick={() => {
            dispatch(setOpenValueAction({ key: [...prefix, name, 'properties'], value: true }));
            dispatch(addChildFieldAction({ key: [...prefix, name, 'properties'] }));
          }}
        >
          {LocaleProvider('child_node')}
        </span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Tooltip placement="top" title={LocaleProvider('add_node')}>
      <Dropdown overlay={menu}>
        <PlusOutlined className="plus" />
      </Dropdown>
    </Tooltip>
  );
};

// ==========================
// SchemaJson Component (Entry)
// ==========================

export interface SchemaJsonProps {
  data: JSONSchema;
  showEdit: (prefix: string[], name: string, value: any, type: string) => void;
  showAdv: (prefix: string[], value: any) => void;
}

const SchemaJson: React.FC<SchemaJsonProps> = ({ data, showEdit, showAdv }) => {
  const item = mapping([], data, showEdit, showAdv);
  return <div className="schema-content">{item}</div>;
};

export default SchemaJson;