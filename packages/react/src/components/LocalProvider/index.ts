import { useContext } from 'react';
import { ConfigProvider } from 'antd';

const langs = {
  en_US: {
    title: 'Title',
    import_json: 'Import JSON',
    base_setting: 'Base Setting',
    all_setting: 'Source Code',
    default: 'Default',
    description: 'Description',
    adv_setting: 'Advanced Settings',
    add_child_node: 'Add child node',
    add_sibling_node: 'Add sibling nodes',
    add_node: 'Add sibling/child nodes',
    remove_node: 'Remove node',
    child_node: 'Child node',
    sibling_node: 'Sibling node',
    ok: 'OK',
    cancel: 'Cancel',
    minLength: 'Min length',
    maxLength: 'Max length',
    pattern: 'MUST be a string and SHOULD be a valid regular expression.',
    exclusiveMinimum: 'Value strictly less than',
    exclusiveMaximum: 'Value strictly more than',
    minimum: 'Min',
    maximum: 'Max',
    unique_items: 'Unique Items',
    min_items: 'MinItems',
    max_items: 'MaxItems',
    checked_all: 'Checked All',
    valid_json: 'Not valid json',
    enum: 'Enum',
    enum_msg: 'One value per line',
    enum_desc: 'desc',
    enum_desc_msg: 'enum description',
    required: 'required',
    mock: 'mock',
    mockLink: 'Help',
  },
  zh_CN: {
    title: '标题',
    import_json: '导入 json',
    base_setting: '基础设置',
    all_setting: '编辑源码',
    default: '默认值',
    description: '备注',
    adv_setting: '高级设置',
    add_child_node: '添加子节点',
    add_sibling_node: '添加兄弟节点',
    add_node: '添加兄弟/子节点',
    remove_node: '移除节点',
    child_node: '子节点',
    sibling_node: '兄弟节点',
    ok: '确定',
    cancel: '取消',
    minLength: '最小长度',
    maxLength: '最大长度',
    pattern: '用正则表达式约束字符串',
    exclusiveMinimum: '开启后，数据必须大于最小值',
    exclusiveMaximum: '开启后，数据必须小于最大值',
    minimum: '最小值',
    maximum: '最大值',
    unique_items: '开启后，每个元素都不相同',
    min_items: '最小元素个数',
    max_items: '最大元素个数',
    checked_all: '全选',
    valid_json: '不是合法的json字符串',
    enum: '枚举',
    enum_msg: '每行只能写一个值',
    enum_desc: '备注',
    enum_desc_msg: '备注描述信息',
    required: '是否必须',
    mock: 'mock',
    mockLink: '查看文档',
  },
};

type LangKey = keyof typeof langs;

export type MessageKey = keyof (typeof langs)['en_US'];

/**
 * 从 antd ConfigProvider 中获取当前语言环境，并返回国际化查询函数
 * @returns 一个接受 MessageKey 返回对应语言字符串的函数
 */
export function useLocalProvider() {
  const { locale } = useContext(ConfigProvider.ConfigContext);

  const langKey: LangKey = locale?.locale.startsWith('zh') ? 'zh_CN' : 'en_US';
  return (message: MessageKey) => langs[langKey][message];
}
