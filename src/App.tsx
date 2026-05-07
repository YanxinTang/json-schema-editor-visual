import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Input,
  Row,
  Tooltip,
  Col,
  Select,
  Checkbox,
  Button,
  Modal,
  message,
  Tabs,
} from 'antd';
import {
  QuestionCircleOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
  EditOutlined,
  SettingOutlined,
  PlusOutlined,
} from '@ant-design/icons';
const Option = Select.Option;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;

declare const TEST: boolean | undefined;
import './index.css';
import AceEditor from './components/AceEditor/AceEditor';
import _ from 'underscore';
import SchemaJson from './components/SchemaComponents/SchemaJson.js';
import { SCHEMA_TYPE, debounce } from './utils';
import GenerateSchema from 'generate-schema/src/schemas/json.js';
import CustomItem from './components/SchemaComponents/SchemaOther';
import LocalProvider from './components/LocalProvider';
import MockSelect from './components/MockSelect';
import { JSONSchema, MockSource, Format } from './types';
import { useAppDispatch, useAppSelector } from './store';
import {
  changeEditorSchemaAction,
  changeTypeAction,
  addChildFieldAction,
  changeValueAction,
  requireAllAction,
} from './store/schemaSlice';

export interface JsonSchemaEditorOwnedProps {
  isMock?: boolean;
  data?: string;
  showEditor?: boolean;
  onChange?: (schema: string) => void;
}

export interface JsonSchemaProps extends JsonSchemaEditorOwnedProps {
  formatSource: Format;
  mockSource?: MockSource;
}

const JsonSchemaEditor: React.FC<JsonSchemaProps> = ({
  isMock,
  data,
  showEditor,
  onChange,
  formatSource,
  mockSource,
}) => {
  const dispatch = useAppDispatch();
  const schema = useAppSelector((state: any) => state.schema.data);

  // Refs
  const jsonDataRef = useRef<object | null>(null);
  const jsonSchemaDataRef = useRef<object | null>(null);
  const importJsonTypeRef = useRef<string | null>(null);
  const prevDataRef = useRef(data);
  const alterMsgRef = useRef(debounce(() => {}, 2000));

  // Local state
  const [visible, setVisible] = useState(false);
  const [show, setShow] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [descriptionKey, setDescriptionKey] = useState<string[] | null>(null);
  const [advVisible, setAdvVisible] = useState(false);
  const [itemKey, setItemKey] = useState<string[]>([]);
  const [curItemCustomValue, setCurItemCustomValue] = useState<JSONSchema | null>(null);
  const [checked, setChecked] = useState(false);
  const [editorModalName, setEditorModalName] = useState('');
  const [editValue, setEditValue] = useState('');

  // Mount: load initial data
  useEffect(() => {
    const parsed = data
      ? JSON.parse(data)
      : { type: 'object', title: 'title', properties: {} };
    dispatch(changeEditorSchemaAction({ value: parsed }));
  }, []);

  // Sync external data prop changes
  useEffect(() => {
    if (data && data !== prevDataRef.current) {
      dispatch(changeEditorSchemaAction({ value: JSON.parse(data) }));
    }
    prevDataRef.current = data;
  }, [data, dispatch]);

  // Notify parent of schema changes
  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange(JSON.stringify(schema || ''));
    }
  }, [schema]);

  // --- Handlers ---

  const showModal = useCallback(() => setVisible(true), []);

  const handleOk = useCallback(() => {
    if (importJsonTypeRef.current !== 'schema') {
      if (!jsonDataRef.current) return message.error('json 数据格式有误');
      const jsonData = GenerateSchema(jsonDataRef.current);
      dispatch(changeEditorSchemaAction({ value: jsonData }));
    } else {
      if (!jsonSchemaDataRef.current) return message.error('json 数据格式有误');
      dispatch(changeEditorSchemaAction({ value: jsonSchemaDataRef.current }));
    }
    setVisible(false);
  }, [dispatch]);

  const handleCancel = useCallback(() => setVisible(false), []);

  const handleImportJson = useCallback(
    (e: { text: string; format: boolean; jsonData: Record<string, unknown> }) => {
      if (!e.text || e.format !== true) {
        jsonDataRef.current = null;
        return;
      }
      jsonDataRef.current = e.jsonData;
    },
    [],
  );

  const handleImportJsonSchema = useCallback(
    (e: { text: string; format: boolean; jsonData: Record<string, unknown> }) => {
      if (!e.text || e.format !== true) {
        jsonSchemaDataRef.current = null;
        return;
      }
      jsonSchemaDataRef.current = e.jsonData;
    },
    [],
  );

  const handleParams = useCallback(
    (e: { text: string; format: boolean; jsonData: Record<string, unknown> }) => {
      if (!e.text) return;
      if (e.format !== true) return alterMsgRef.current();
      dispatch(changeEditorSchemaAction({ value: e.jsonData }));
    },
    [dispatch],
  );

  const changeType = useCallback(
    (key: string, value: string) => {
      dispatch(changeTypeAction({ key: [key], value }));
    },
    [dispatch],
  );

  const addChildField = useCallback(
    (key: string) => {
      dispatch(addChildFieldAction({ key: [key] }));
      setShow(true);
    },
    [dispatch],
  );

  const clickIcon = useCallback(() => setShow((s) => !s), []);

  const changeValue = useCallback(
    (key: string[], value: unknown) => {
      if (key[0] === 'mock') {
        value = value ? { mock: value } : '';
      }
      dispatch(changeValueAction({ key, value }));
    },
    [dispatch],
  );

  const handleEditOk = useCallback(
    (name: string) => {
      setEditVisible(false);
      let value: unknown = editValue;
      if (name === 'mock') {
        value = value ? { mock: value } : '';
      }
      dispatch(changeValueAction({ key: descriptionKey, value }));
    },
    [editValue, descriptionKey, dispatch],
  );

  const handleEditCancel = useCallback(() => setEditVisible(false), []);

  const showEdit = useCallback(
    (prefix: string[], name: string, value: unknown, type?: string) => {
      if (type === 'object' || type === 'array') return;
      const key = [...prefix, name];
      const val =
        name === 'mock' ? (value ? (value as Record<string, unknown>).mock : '') : value;
      setEditVisible(true);
      setEditValue(val as string);
      setDescriptionKey(key);
      setEditorModalName(name);
    },
    [],
  );

  const changeDesc = useCallback((e: string) => setEditValue(e), []);

  const handleAdvOk = useCallback(() => {
    if (itemKey.length === 0) {
      dispatch(changeEditorSchemaAction({ value: curItemCustomValue }));
    } else {
      dispatch(changeValueAction({ key: itemKey, value: curItemCustomValue }));
    }
    setAdvVisible(false);
  }, [itemKey, curItemCustomValue, dispatch]);

  const handleAdvCancel = useCallback(() => setAdvVisible(false), []);

  const showAdv = useCallback((key: string[], value: unknown) => {
    setAdvVisible(true);
    setItemKey(key);
    setCurItemCustomValue(value as JSONSchema);
  }, []);

  const changeCustomValue = useCallback(
    (newValue: JSONSchema) => setCurItemCustomValue(newValue),
    [],
  );

  const changeCheckBox = useCallback(
    (e: boolean) => {
      setChecked(e);
      dispatch(requireAllAction({ required: e, value: schema }));
    },
    [schema, dispatch],
  );

  const disabled = schema.type === 'object' || schema.type === 'array' ? false : true;

  return (
    <div className="json-schema-react-editor">
      <Button
        className="import-json-button"
        type="primary"
        onClick={showModal}
      >
        {LocalProvider('import_json')}
      </Button>
      <Modal
        maskClosable={false}
        visible={visible}
        title={LocalProvider('import_json')}
        onOk={handleOk}
        onCancel={handleCancel}
        className="json-schema-react-editor-import-modal"
        okText={'ok'}
        cancelText={LocalProvider('cancel')}
        footer={[
          <Button key="back" onClick={handleCancel}>
            {LocalProvider('cancel')}
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            {LocalProvider('ok')}
          </Button>,
        ]}
      >
        <Tabs
          defaultActiveKey="json"
          onChange={(key) => {
            importJsonTypeRef.current = key;
          }}
        >
          <TabPane tab="JSON" key="json">
            <AceEditor data="" mode="json" onChange={handleImportJson} />
          </TabPane>
          <TabPane tab="JSON-SCHEMA" key="schema">
            <AceEditor data="" mode="json" onChange={handleImportJsonSchema} />
          </TabPane>
        </Tabs>
      </Modal>

      <Modal
        title={
          <div>
            {LocalProvider(editorModalName as any)}
            &nbsp;
            {editorModalName === 'mock' && (
              <Tooltip title={LocalProvider('mockLink')}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/YMFE/json-schema-editor-visual/issues/38"
                >
                  <QuestionCircleOutlined />
                </a>
              </Tooltip>
            )}
          </div>
        }
        maskClosable={false}
        visible={editVisible}
        onOk={() => handleEditOk(editorModalName)}
        onCancel={handleEditCancel}
        okText={LocalProvider('ok')}
        cancelText={LocalProvider('cancel')}
      >
        <TextArea
          value={editValue}
          placeholder={LocalProvider(editorModalName as any)}
          onChange={(e) => changeDesc(e.target.value)}
          autoSize={{ minRows: 6, maxRows: 10 }}
        />
      </Modal>

      {advVisible && (
        <Modal
          title={LocalProvider('adv_setting')}
          maskClosable={false}
          visible={advVisible}
          onOk={handleAdvOk}
          onCancel={handleAdvCancel}
          okText={LocalProvider('ok')}
          width={780}
          cancelText={LocalProvider('cancel')}
          className="json-schema-react-editor-adv-modal"
          data-testid={TEST ? 'JSONSchemaEditorAdvModal' : null}
        >
          <CustomItem
            data={JSON.stringify(curItemCustomValue, null, 2)}
            changeCustomValue={changeCustomValue}
            formatSource={formatSource}
          />
        </Modal>
      )}

      <Row>
        {showEditor && (
          <Col span={8}>
            <AceEditor
              className="pretty-editor"
              mode="json"
              data={JSON.stringify(schema, null, 2)}
              onChange={handleParams}
            />
          </Col>
        )}
        <Col
          span={showEditor ? 16 : 24}
          className="wrapper object-style"
        >
          <Row align="middle">
            <Col span={8} className="col-item name-item col-item-name">
              <Row justify="space-around" align="middle">
                <Col span={2} className="down-style-col">
                  {schema.type === 'object' ? (
                    <span className="down-style" onClick={clickIcon}>
                      {show ? (
                        <CaretDownOutlined
                          className="icon-object"
                          type="caret-down"
                        />
                      ) : (
                        <CaretRightOutlined
                          className="icon-object"
                          type="caret-right"
                        />
                      )}
                    </span>
                  ) : null}
                </Col>
                <Col span={22}>
                  <Input
                    addonAfter={
                      <Tooltip placement="top" title={'checked_all'}>
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                          onChange={(e) => changeCheckBox(e.target.checked)}
                        />
                      </Tooltip>
                    }
                    disabled
                    value="root"
                  />
                </Col>
              </Row>
            </Col>
            <Col span={3} className="col-item col-item-type">
              <Select
                className="type-select-style"
                onChange={(e) => changeType(`type`, e)}
                value={schema.type || 'object'}
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
                  schema={schema}
                  showEdit={() => showEdit([], 'mock', schema.mock, schema.type)}
                  onChange={(value: string) => changeValue(['mock'], value)}
                  mockSource={mockSource}
                />
              </Col>
            )}
            <Col
              span={isMock ? 4 : 5}
              className="col-item col-item-mock"
            >
              <Input
                addonAfter={
                  <EditOutlined
                    type="edit"
                    onClick={() => showEdit([], 'title', schema.title)}
                  />
                }
                placeholder={'Title'}
                value={schema.title}
                onChange={(e) => changeValue(['title'], e.target.value)}
              />
            </Col>
            <Col
              span={isMock ? 4 : 5}
              className="col-item col-item-desc"
            >
              <Input
                addonAfter={
                  <EditOutlined
                    type="edit"
                    onClick={() =>
                      showEdit([], 'description', schema.description)
                    }
                  />
                }
                placeholder={'description'}
                value={schema.description}
                onChange={(e) => changeValue(['description'], e.target.value)}
              />
            </Col>
            <Col span={2} className="col-item col-item-setting">
              <span
                className="adv-set"
                onClick={() => showAdv([], schema)}
              >
                <Tooltip
                  placement="top"
                  title={LocalProvider('adv_setting')}
                >
                  <SettingOutlined type="setting" />
                </Tooltip>
              </span>
              {schema.type === 'object' ? (
                <span onClick={() => addChildField('properties')}>
                  <Tooltip
                    placement="top"
                    title={LocalProvider('add_child_node')}
                  >
                    <PlusOutlined type="plus" className="plus" />
                  </Tooltip>
                </span>
              ) : null}
            </Col>
          </Row>
          {show && (
            <SchemaJson
              data={schema}
              showEdit={showEdit}
              showAdv={showAdv}
              isMock={isMock ?? false}
              mockSource={mockSource}
            />
          )}
        </Col>
      </Row>
    </div>
  );
};

export default JsonSchemaEditor;
