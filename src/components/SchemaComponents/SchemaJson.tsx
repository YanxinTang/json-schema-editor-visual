import React, { useMemo, useCallback } from 'react';
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
  Space,
  Button,
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
import { JSONPATH_JOIN_CHAR, SCHEMA_TYPE, getData, isNil } from '../../utils.js';
import FieldInput from './FieldInput.js';
import LocaleProvider from '../LocalProvider';
import MockSelect from '../MockSelect';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  addChildFieldAction,
  addFieldAction,
  setOpenValueAction,
  changeTypeAction,
  changeValueAction,
  changeNameAction,
  deleteItemAction,
  enableRequireAction,
} from '../../store/schemaSlice';

import './schemaJson.css';
import { JSONSchema, MockSource } from '../../types.js';

const { Option } = Select;

declare const TEST: boolean | undefined;

/**
 * 通用属性接口
 * @property prefix - 当前节点的路径前缀
 * @property data - 当前节点的 JSON Schema 数据
 * @property showEdit - 打开备注/mock 编辑弹窗的回调
 * @property showAdv - 打开高级设置弹窗的回调
 */

export interface CommonProps {
  prefix: string[];
  data: JSONSchema;
  showEdit: (prefix: string[], name: string, value: any, type: string) => void;
  showAdv: (prefix: string[], value: any) => void;
  isMock: boolean;
  mockSource?: MockSource;
}

export interface SchemaItemProps extends CommonProps {
  name: string;
}

/**
 * 根据数据类型渲染对应的 Schema 子组件
 * @property name - 当前节点的路径
 * @property data - 当前节点的 JSON Schema 数据
 * @property showEdit - 打开备注/mock 编辑弹窗的回调
 * @property showAdv - 打开高级设置弹窗的回调
 */

const mapping = (
  name: string[],
  data: JSONSchema,
  showEdit: CommonProps['showEdit'],
  showAdv: CommonProps['showAdv'],
  isMock: boolean,
  mockSource?: MockSource,
) => {
  switch (data.type) {
    case 'array':
      return (
        <SchemaArray
          prefix={name}
          data={data}
          showEdit={showEdit}
          showAdv={showAdv}
          isMock={isMock}
          mockSource={mockSource}
        />
      );
    case 'object':
      const nameArray = [...name, 'properties'];
      return (
        <SchemaObject
          prefix={nameArray}
          data={data}
          showEdit={showEdit}
          showAdv={showAdv}
          isMock={isMock}
          mockSource={mockSource}
        />
      );
    default:
      return null;
  }
};

/**
 * 数组类型的 Schema 编辑组件，用于渲染和编辑 JSON Schema 中 type 为 array 的节点
 */

const SchemaArray: React.FC<CommonProps> = React.memo(
  ({ data, prefix, showEdit, showAdv, isMock, mockSource }) => {
    const dispatch = useAppDispatch();
    const open = useAppSelector((state: any) => state.schema.open);

    const tagPaddingLeftStyle = useMemo(() => {
      const length = prefix.filter((name) => name !== 'properties').length;
      return { paddingLeft: `${20 * (length + 1)}px` };
    }, [prefix]);

    const getPrefix = useCallback(() => [...prefix, 'items'], [prefix]);

    const handleChangeType = (value: string) => {
      const key = [...getPrefix(), 'type'];
      dispatch(changeTypeAction({ key, value }));
    };

    const handleChangeDesc = (e: React.ChangeEvent<HTMLInputElement>) => {
      const key = [...getPrefix(), 'description'];
      dispatch(changeValueAction({ key, value: e.target.value }));
    };

    const handleChangeMock = (e: string) => {
      const key = [...getPrefix(), 'mock'];
      const value = e ? { mock: e } : '';
      dispatch(changeValueAction({ key, value }));
    };

    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
      const key = [...getPrefix(), 'title'];
      dispatch(changeValueAction({ key, value: e.target.value }));
    };

    const handleAddChildField = () => {
      const keyArr = [...getPrefix(), 'properties'];
      dispatch(addChildFieldAction({ key: keyArr }));
      dispatch(setOpenValueAction({ key: keyArr, value: true }));
    };

    const handleClickIcon = () => {
      const keyArr = [...getPrefix(), 'properties'];
      dispatch(setOpenValueAction({ key: keyArr }));
    };

    const handleShowEdit = (name: string, type?: string) => {
      showEdit(getPrefix(), name, data.items![name], type!);
    };

    const handleShowAdv = () => {
      showAdv(getPrefix(), data.items!);
    };

    if (isNil(data.items)) return null;

    const items = data.items;
    const prefixArray = getPrefix();
    const prefixArrayStr = [...prefixArray, 'properties'].join(
      JSONPATH_JOIN_CHAR,
    );
    const showIcon = getData(open, [prefixArrayStr]);

    return (
      <div className="array-type">
        <Row
          className="array-item-type"
          justify="space-around"
          align="middle"
        >
          <Col
            span={8}
            className="col-item name-item col-item-name"
            style={tagPaddingLeftStyle}
          >
            <Row justify="space-around" align="middle">
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
                <Space.Compact>
                  <Input disabled value="Items" />
                  <Button type="text" disabled icon={<Checkbox disabled />} />
                </Space.Compact>
              </Col>
            </Row>
          </Col>
          <Col span={3} className="col-item col-item-type">
            <Select
              className="type-select-style"
              onChange={handleChangeType}
              value={items.type}
            >
              {SCHEMA_TYPE.map((item, index) => (
                <Option value={item} key={index}>
                  {item}
                </Option>
              ))}
            </Select>
          </Col>
          {isMock && (
            <Col span={3} className="col-item col-item-mock">
              <MockSelect
                schema={items}
                showEdit={() => handleShowEdit('mock', items.type)}
                onChange={handleChangeMock}
                mockSource={mockSource}
              />
            </Col>
          )}
          <Col span={isMock ? 4 : 5} className="col-item col-item-mock">
            <Space.Compact>
              <Input
                placeholder={LocaleProvider('title')}
                value={items.title}
                onChange={handleChangeTitle}
              />
              <Button icon={<EditOutlined />} onClick={() => handleShowEdit('title')} />
            </Space.Compact>
          </Col>
          <Col span={isMock ? 4 : 5} className="col-item col-item-desc">
            <Space.Compact>
              <Input
                placeholder={LocaleProvider('description')}
                value={items.description}
                onChange={handleChangeDesc}
              />
              <Button icon={<EditOutlined />} onClick={() => handleShowEdit('description')} />
            </Space.Compact>
          </Col>
          <Col span={isMock ? 2 : 3} className="col-item col-item-setting">
            <span className="adv-set" onClick={handleShowAdv}>
              <Tooltip placement="top" title={LocaleProvider('adv_setting')}>
                <SettingOutlined />
              </Tooltip>
            </span>
            {items.type === 'object' && (
              <span onClick={handleAddChildField}>
                <Tooltip
                  placement="top"
                  title={LocaleProvider('add_child_node')}
                >
                  <PlusOutlined className="plus" />
                </Tooltip>
              </span>
            )}
          </Col>
        </Row>
        <div className="option-formStyle">
          {mapping(prefixArray, items, showEdit, showAdv, isMock, mockSource)}
        </div>
      </div>
    );
  },
);

/**
 * 对象属性项的 Schema 编辑组件，用于渲染和编辑 object 中的单个字段
 */

const SchemaItem: React.FC<SchemaItemProps> = React.memo(
  ({ name, data, prefix, showEdit, showAdv, isMock, mockSource }) => {
    const dispatch = useAppDispatch();
    const open = useAppSelector((state: any) => state.schema.open);

    const tagPaddingLeftStyle = useMemo(() => {
      const length = prefix.filter((n) => n !== 'properties').length;
      return { paddingLeft: `${20 * (length + 1)}px` };
    }, [prefix]);

    const getPrefix = useCallback(() => [...prefix, name], [prefix, name]);

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (
        data.properties![value] &&
        typeof data.properties![value] === 'object'
      ) {
        return message.error(`The field "${value}" already exists.`);
      }
      dispatch(changeNameAction({ value, prefix, name }));
    };

    const handleChangeDesc = (e: React.ChangeEvent<HTMLInputElement>) => {
      const key = [...getPrefix(), 'description'];
      dispatch(changeValueAction({ key, value: e.target.value }));
    };

    const handleChangeMock = (e: string) => {
      const key = [...getPrefix(), 'mock'];
      const value = e ? { mock: e } : '';
      dispatch(changeValueAction({ key, value }));
    };

    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
      const key = [...getPrefix(), 'title'];
      dispatch(changeValueAction({ key, value: e.target.value }));
    };

    const handleChangeType = (value: string) => {
      const key = [...getPrefix(), 'type'];
      dispatch(changeTypeAction({ key, value }));
    };

    const handleDeleteItem = () => {
      const keyArr = getPrefix();
      dispatch(deleteItemAction({ key: keyArr }));
      dispatch(enableRequireAction({ prefix, name, required: false }));
    };

    const handleShowEdit = (editorName: string, type?: string) => {
      showEdit(
        getPrefix(),
        editorName,
        data.properties![name][editorName],
        type!,
      );
    };

    const handleShowAdv = () => {
      showAdv(getPrefix(), data.properties![name]);
    };

    const handleAddField = () => {
      dispatch(addFieldAction({ prefix, name }));
    };

    const handleClickIcon = () => {
      const keyArr = [...getPrefix(), 'properties'];
      dispatch(setOpenValueAction({ key: keyArr }));
    };

    const handleEnableRequire = (e: any) => {
      const required = e.target.checked;
      dispatch(enableRequireAction({ prefix, name, required }));
    };

    const value = data.properties![name];
    const prefixArray = getPrefix();
    const prefixStr = prefix.join(JSONPATH_JOIN_CHAR);
    const prefixArrayStr = [...prefixArray, 'properties'].join(
      JSONPATH_JOIN_CHAR,
    );

    const show = getData(open, [prefixStr]);
    const showIcon = getData(open, [prefixArrayStr]);

    if (!show) return null;

    return (
      <div
        data-testid={
          typeof TEST !== 'undefined' && TEST ? 'SchemaItem' : undefined
        }
      >
        <Row justify="space-around" align="middle">
          <Col
            span={8}
            className="col-item name-item col-item-name"
            style={tagPaddingLeftStyle}
          >
            <Row justify="space-around" align="middle">
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
                <Space.Compact>
                  <FieldInput
                    onChange={handleChangeName}
                    value={name}
                    data-testid={
                      typeof TEST !== 'undefined' && TEST
                        ? 'SchemaItem_propNameInput'
                        : undefined
                    }
                  />
                  <Tooltip placement="top" title={LocaleProvider('required')}>
                    <Button type="text">
                      <Checkbox
                        onChange={handleEnableRequire}
                        checked={
                          isNil(data.required)
                            ? false
                            : data.required.includes(name)
                        }
                      />
                    </Button>
                  </Tooltip>
                </Space.Compact>
              </Col>
            </Row>
          </Col>

          <Col span={3} className="col-item col-item-type">
            <Select
              className="type-select-style"
              onChange={handleChangeType}
              value={value.type}
            >
              {SCHEMA_TYPE.map((item, index) => (
                <Option value={item} key={index}>
                  {item}
                </Option>
              ))}
            </Select>
          </Col>

          {isMock && (
            <Col span={3} className="col-item col-item-mock">
              <MockSelect
                schema={value}
                showEdit={() => handleShowEdit('mock', value.type)}
                onChange={handleChangeMock}
                mockSource={mockSource}
              />
            </Col>
          )}

          <Col span={isMock ? 4 : 5} className="col-item col-item-mock">
            <Space.Compact>
              <Input
                placeholder={LocaleProvider('title')}
                value={value.title}
                onChange={handleChangeTitle}
                data-testid={
                  typeof TEST !== 'undefined' && TEST
                    ? 'SchemaItem_titleInput'
                    : undefined
                }
              />
              <Button icon={<EditOutlined />} onClick={() => handleShowEdit('title')} />
            </Space.Compact>
          </Col>

          <Col span={isMock ? 4 : 5} className="col-item col-item-desc">
            <Space.Compact>
              <Input
                placeholder={LocaleProvider('description')}
                value={value.description}
                onChange={handleChangeDesc}
                data-testid={
                  typeof TEST !== 'undefined' && TEST
                    ? 'SchemaItem_descInput'
                    : undefined
                }
              />
              <Button icon={<EditOutlined />} onClick={() => handleShowEdit('description')} />
            </Space.Compact>
          </Col>

          <Col span={isMock ? 2 : 3} className="col-item col-item-setting">
            <span
              className="adv-set"
              onClick={handleShowAdv}
              data-testid={
                typeof TEST !== 'undefined' && TEST
                  ? 'SchemaItem_FieldInput_advSet'
                  : undefined
              }
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
                <Tooltip
                  placement="top"
                  title={LocaleProvider('add_sibling_node')}
                >
                  <PlusOutlined className="plus" />
                </Tooltip>
              </span>
            )}
          </Col>
        </Row>
        <div className="option-formStyle">
          {mapping(prefixArray, value, showEdit, showAdv, isMock, mockSource)}
        </div>
      </div>
    );
  },
);

/**
 * 对象类型的 Schema 编辑组件，遍历 properties 中的每个字段渲染 SchemaItem
 */

const SchemaObjectComponent: React.FC<CommonProps> = ({
  data,
  prefix,
  showEdit,
  showAdv,
  isMock,
  mockSource,
}) => {
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
          isMock={isMock}
          mockSource={mockSource}
        />
      ))}
    </div>
  );
};

/** 使用深比较优化避免不必要的重渲染 */
const SchemaObject = React.memo(
  SchemaObjectComponent,
  (prevProps, nextProps) => {
    return (
      _.isEqual(prevProps.data, nextProps.data) &&
      _.isEqual(prevProps.prefix, nextProps.prefix)
    );
  },
);

export interface DropPlusProps {
  prefix: string[];
  name: string;
}

/**
 * 添加节点下拉按钮，提供添加兄弟节点和子节点两种操作
 * @property prefix - 当前节点的路径前缀
 * @property name - 当前字段的名称
 */
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
            dispatch(
              setOpenValueAction({
                key: [...prefix, name, 'properties'],
                value: true,
              }),
            );
            dispatch(
              addChildFieldAction({ key: [...prefix, name, 'properties'] }),
            );
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

/**
 * Schema 编辑器入口组件，根据根节点数据类型渲染对应的 Schema 子树
 * @property data - 根节点的 JSON Schema 数据
 * @property showEdit - 打开备注/mock 编辑弹窗的回调
 * @property showAdv - 打开高级设置弹窗的回调
 */

export interface SchemaJsonProps {
  data: JSONSchema;
  showEdit: (prefix: string[], name: string, value: any, type: string) => void;
  showAdv: (prefix: string[], value: any) => void;
  isMock: boolean;
  mockSource?: MockSource;
}

const SchemaJson: React.FC<SchemaJsonProps> = ({ data, showEdit, showAdv, isMock, mockSource }) => {
  const item = mapping([], data, showEdit, showAdv, isMock, mockSource);
  return <div className="schema-content">{item}</div>;
};

export default SchemaJson;
