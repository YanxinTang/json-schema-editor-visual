import React from 'react';
import {
  Input,
  Row,
  Tooltip,
  Col,
  Form,
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
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;

declare const TEST: boolean | undefined;
import './index.css';
import AceEditor from './components/AceEditor/AceEditor.js';
import _ from 'underscore';
import { connect } from 'react-redux';
import SchemaJson from './components/SchemaComponents/SchemaJson.js';
import { SCHEMA_TYPE, debounce } from './utils';
import { handleSchema } from './schema';
import GenerateSchema from 'generate-schema/src/schemas/json.js';
import * as utils from './utils';
import CustomItem from './components/SchemaComponents/SchemaOther.js';
import LocalProvider from './components/LocalProvider';
import MockSelect from './components/MockSelect';
import { JSONSchema, MockSource, Format, ModelType } from './types';
import { RootState } from './store';
import { SchemaSliceActions, actions } from './store/schemaSlice';

export interface JsonSchemaEditorOwnedProps {
  isMock?: boolean;
  data?: string;
  showEditor?: boolean;
  onChange?: (schema: string) => void;
}

export interface JsonSchemaProps
  extends JsonSchemaEditorOwnedProps {
  Model: ModelType;
  formatSource: Format;
  mockSource?: MockSource;
  schema: JSONSchema;
  open: Record<string, boolean>;
  changeEditorSchemaAction: (payload: { value: unknown }) => void;
  changeTypeAction: (payload: { key: string[]; value: string }) => void;
  addChildFieldAction: (payload: { key: string[] }) => void;
  changeValueAction: (payload: { key: string[] | null; value: unknown }) => void;
  requireAllAction: (payload: { required: boolean; value: JSONSchema }) => void;
}

interface JsonSchemaState {
  visible: boolean;
  show: boolean;
  editVisible: boolean;
  description: string;
  descriptionKey: string[] | null;
  advVisible: boolean;
  itemKey: string[];
  curItemCustomValue: JSONSchema | null;
  checked: boolean;
  editorModalName: string;
  mock: string;
}

class jsonSchema extends React.Component<JsonSchemaProps, JsonSchemaState> {
  private jsonSchemaData: string | null;
  private jsonData: object | null;
  private importJsonType: string | null = null;

  constructor(props: JsonSchemaProps) {
    super(props);
    this.alterMsg = debounce(this.alterMsg, 2000);
    this.state = {
      visible: false,
      show: true,
      editVisible: false,
      description: '',
      descriptionKey: null,
      advVisible: false,
      itemKey: [],
      curItemCustomValue: null,
      checked: false,
      editorModalName: '', // 弹窗名称desctiption | mock
      mock: '',
    };
    this.jsonSchemaData = null;
    this.jsonData = null;
  }

  // json 导入弹窗
  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  handleOk = () => {
    if (this.importJsonType !== 'schema') {
      if (!this.jsonData) {
        return message.error('json 数据格式有误');
      }

      let jsonData = GenerateSchema(this.jsonData);
      this.props.changeEditorSchemaAction({ value: jsonData });
    } else {
      if (!this.jsonSchemaData) {
        return message.error('json 数据格式有误');
      }
      this.props.changeEditorSchemaAction({ value: this.jsonSchemaData });
    }
    this.setState({ visible: false });
  };
  handleCancel = () => {
    this.setState({ visible: false });
  };

  componentWillReceiveProps(nextProps: JsonSchemaProps) {
    if (
      typeof this.props.onChange === 'function' &&
      this.props.schema !== nextProps.schema
    ) {
      let oldData = JSON.stringify(this.props.schema || '');
      let newData = JSON.stringify(nextProps.schema || '');
      if (oldData !== newData) return this.props.onChange(newData);
    }
    if (this.props.data && this.props.data !== nextProps.data) {
      this.props.changeEditorSchemaAction({
        value: JSON.parse(nextProps.data!),
      });
    }
  }

  componentDidMount() {
    let data = this.props.data;
    if (!data) {
      data = `{
        "type": "object",
        "title": "title",
        "properties":{}
      }`;
    }
    this.props.changeEditorSchemaAction({ value: JSON.parse(data) });
  }

  alterMsg = () => {
    // return message.error(LocalProvider('valid_json'));
  };

  // AceEditor 中的数据
  handleParams = (e: { text: string; format: boolean; jsonData: Record<string, unknown> }) => {
    if (!e.text) return;
    // 将数据map 到store中
    if (e.format !== true) {
      return this.alterMsg();
    }
    handleSchema(e.jsonData);
    this.props.changeEditorSchemaAction({
      value: e.jsonData,
    });
  };

  // 修改数据类型
  changeType = (key: string, value: string) => {
    this.props.changeTypeAction({ key: [key], value });
  };

  handleImportJson = (e: { text: string; format: boolean; jsonData: Record<string, unknown> }) => {
    if (!e.text || e.format !== true) {
      return (this.jsonData = null);
    }
    this.jsonData = e.jsonData;
  };

  handleImportJsonSchema = (e: { text: string; format: boolean; jsonData: Record<string, unknown> }) => {
    if (!e.text || e.format !== true) {
      return (this.jsonSchemaData = null);
    }
    this.jsonSchemaData = e.jsonData;
  };
  // 增加子节点
  addChildField = (key: string) => {
    this.props.addChildFieldAction({ key: [key] });
    this.setState({ show: true });
  };

  clickIcon = () => {
    this.setState({ show: !this.state.show });
  };

  // 修改备注信息
  changeValue = (key: string[], value: unknown) => {
    if (key[0] === 'mock') {
      value = value ? { mock: value } : '';
    }
    this.props.changeValueAction({ key, value });
  };

  // 备注/mock弹窗 点击ok 时
  handleEditOk = (name: string) => {
    this.setState({
      editVisible: false,
    });
    let value = (this.state as Record<string, unknown>)[name];
    if (name === 'mock') {
      value = value ? { mock: value } : '';
    }
    this.props.changeValueAction({ key: this.state.descriptionKey, value });
  };

  handleEditCancel = () => {
    this.setState({
      editVisible: false,
    });
  };
  /*
    展示弹窗modal
    prefix: 节点前缀信息
    name: 弹窗的名称 ['description', 'mock']
    value: 输入值
    type: 如果当前字段是object || array showEdit 不可用
  */
  showEdit = (prefix: string[], name: string, value: unknown, type?: string) => {
    if (type === 'object' || type === 'array') {
      return;
    }
    let descriptionKey: string[] = [...prefix, name];

    value = name === 'mock' ? (value ? (value as Record<string, unknown>).mock : '') : value;
    this.setState({
      editVisible: true,
      [name]: value,
      descriptionKey,
      editorModalName: name,
    });
  };

  // 修改备注/mock参数信息
  changeDesc = (e: string, name: string) => {
    this.setState({
      [name]: e,
    } as unknown as JsonSchemaState);
  };

  // 高级设置
  handleAdvOk = () => {
    if (this.state.itemKey.length === 0) {
      this.props.changeEditorSchemaAction({
        value: this.state.curItemCustomValue,
      });
    } else {
      this.props.changeValueAction({
        key: this.state.itemKey,
        value: this.state.curItemCustomValue,
      });
    }
    this.setState({
      advVisible: false,
    });
  };
  handleAdvCancel = () => {
    this.setState({
      advVisible: false,
    });
  };
  showAdv = (key: string[], value: unknown) => {
    this.setState({
      advVisible: true,
      itemKey: key,
      curItemCustomValue: value as JSONSchema, // 当前节点的数据信息
    });
  };

  //  修改弹窗中的json-schema 值
  changeCustomValue = (newValue: JSONSchema) => {
    this.setState({
      curItemCustomValue: newValue,
    });
  };

  changeCheckBox = (e: boolean) => {
    this.setState({ checked: e });
    this.props.requireAllAction({ required: e, value: this.props.schema });
  };

  render() {
    const {
      visible,
      editVisible,
      description,
      advVisible,
      checked,
      editorModalName,
    } = this.state;
    const { schema } = this.props;

    let disabled =
      this.props.schema.type === 'object' || this.props.schema.type === 'array'
        ? false
        : true;

    return (
        <div className="json-schema-react-editor">
          <Button
            className="import-json-button"
            type="primary"
            onClick={this.showModal}
          >
            {LocalProvider('import_json')}
          </Button>
          <Modal
            maskClosable={false}
            visible={visible}
            title={LocalProvider('import_json')}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            className="json-schema-react-editor-import-modal"
            okText={'ok'}
            cancelText={LocalProvider('cancel')}
            footer={[
              <Button key="back" onClick={this.handleCancel}>
                {LocalProvider('cancel')}
              </Button>,
              <Button key="submit" type="primary" onClick={this.handleOk}>
                {LocalProvider('ok')}
              </Button>,
            ]}
          >
            <Tabs
              defaultActiveKey="json"
              onChange={(key) => {
                this.importJsonType = key;
              }}
            >
              <TabPane tab="JSON" key="json">
                <AceEditor
                  data=""
                  mode="json"
                  onChange={this.handleImportJson}
                />
              </TabPane>
              <TabPane tab="JSON-SCHEMA" key="schema">
                <AceEditor
                  data=""
                  mode="json"
                  onChange={this.handleImportJsonSchema}
                />
              </TabPane>
            </Tabs>
          </Modal>

          <Modal
            title={
              <div>
                {LocalProvider(editorModalName)}
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
            onOk={() => this.handleEditOk(editorModalName)}
            onCancel={this.handleEditCancel}
            okText={LocalProvider('ok')}
            cancelText={LocalProvider('cancel')}
          >
            <TextArea
              value={(this.state as Record<string, unknown>)[editorModalName] as string}
              placeholder={LocalProvider(editorModalName)}
              onChange={(e) => this.changeDesc(e.target.value, editorModalName)}
              autoSize={{ minRows: 6, maxRows: 10 }}
            />
          </Modal>

          {advVisible && (
            <Modal
              title={LocalProvider('adv_setting')}
              maskClosable={false}
              visible={advVisible}
              onOk={this.handleAdvOk}
              onCancel={this.handleAdvCancel}
              okText={LocalProvider('ok')}
              width={780}
              cancelText={LocalProvider('cancel')}
              className="json-schema-react-editor-adv-modal"
              data-testid={TEST ? 'JSONSchemaEditorAdvModal' : null}
            >
              <CustomItem
                data={JSON.stringify(this.state.curItemCustomValue, null, 2)}
                changeCustomValue={this.changeCustomValue}
                formatSource={this.props.formatSource}
              />
            </Modal>
          )}

          <Row>
            {this.props.showEditor && (
              <Col span={8}>
                <AceEditor
                  className="pretty-editor"
                  mode="json"
                  data={JSON.stringify(schema, null, 2)}
                  onChange={this.handleParams}
                />
              </Col>
            )}
            <Col
              span={this.props.showEditor ? 16 : 24}
              className="wrapper object-style"
            >
              <Row align="middle">
                <Col span={8} className="col-item name-item col-item-name">
                  <Row justify="space-around" align="middle">
                    <Col span={2} className="down-style-col">
                      {schema.type === 'object' ? (
                        <span className="down-style" onClick={this.clickIcon}>
                          {this.state.show ? (
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
                              onChange={(e) =>
                                this.changeCheckBox(e.target.checked)
                              }
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
                    onChange={(e) => this.changeType(`type`, e)}
                    value={schema.type || 'object'}
                  >
                    {SCHEMA_TYPE.map((item, index) => {
                      return (
                        <Option value={item} key={index}>
                          {item}
                        </Option>
                      );
                    })}
                  </Select>
                </Col>
                {this.props.isMock && (
                  <Col span={3} className="col-item col-item-mock">
                    <MockSelect
                      schema={schema}
                      showEdit={() =>
                        this.showEdit([], 'mock', schema.mock, schema.type)
                      }
                      onChange={(value: string) => this.changeValue(['mock'], value)}
                      mockSource={this.props.mockSource}
                    />
                  </Col>
                )}
                <Col
                  span={this.props.isMock ? 4 : 5}
                  className="col-item col-item-mock"
                >
                  <Input
                    addonAfter={
                      <EditOutlined
                        type="edit"
                        onClick={() =>
                          this.showEdit([], 'title', this.props.schema.title)
                        }
                      />
                    }
                    placeholder={'Title'}
                    value={this.props.schema.title}
                    onChange={(e) =>
                      this.changeValue(['title'], e.target.value)
                    }
                  />
                </Col>
                <Col
                  span={this.props.isMock ? 4 : 5}
                  className="col-item col-item-desc"
                >
                  <Input
                    addonAfter={
                      <EditOutlined
                        type="edit"
                        onClick={() =>
                          this.showEdit(
                            [],
                            'description',
                            this.props.schema.description,
                          )
                        }
                      />
                    }
                    placeholder={'description'}
                    value={schema.description}
                    onChange={(e) =>
                      this.changeValue(['description'], e.target.value)
                    }
                  />
                </Col>
                <Col span={2} className="col-item col-item-setting">
                  <span
                    className="adv-set"
                    onClick={() => this.showAdv([], this.props.schema)}
                  >
                    <Tooltip
                      placement="top"
                      title={LocalProvider('adv_setting')}
                    >
                      <SettingOutlined type="setting" />
                    </Tooltip>
                  </span>
                  {schema.type === 'object' ? (
                    <span onClick={() => this.addChildField('properties')}>
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
              {this.state.show && (
                <SchemaJson
                  data={this.props.schema}
                  showEdit={this.showEdit}
                  showAdv={this.showAdv}
                  isMock={this.props.isMock ?? false}
                  mockSource={this.props.mockSource}
                />
              )}
            </Col>
          </Row>
        </div>
    );
  }
}

export default connect(
  (state: RootState) => ({
    schema: state.schema.data,
    open: state.schema.open,
  }),
  actions,
)(jsonSchema);
