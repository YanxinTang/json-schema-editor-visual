import { afterEach, describe, expect, rs, test } from '@rstest/core';
import { BrowserPage, page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import SchemaEditor from '../src';

describe('JsonSchemaReactEditor', () => {
  test('初始状态渲染', async () => {
    await render(<SchemaEditor />);

    // 顶部导入按钮
    await expect
      .element(page.getByRole('button', { name: 'Import JSON' }))
      .toBeVisible();

    // root 输入框（禁用状态）
    const rootInput = page.locator('input[value="root"]');
    await expect.element(rootInput).toBeVisible();
    await expect.element(rootInput).toBeDisabled();

    // 类型选择器 object
    await expect.element(page.getByText('object')).toBeVisible();

    // title 输入框
    await expect
      .element(page.getByRole('textbox', { name: 'Title' }))
      .toBeVisible();

    // description 输入框
    await expect
      .element(page.getByRole('textbox', { name: 'Description' }))
      .toBeVisible();

    // 根节点展开图标
    await expect
      .element(page.getByRole('img', { name: 'caret-down' }))
      .toBeVisible();

    // 设置按钮
    await expect
      .element(page.getByRole('button', { name: 'Advanced Settings' }))
      .toBeVisible();

    // 新增按钮
    await expect
      .element(page.getByRole('button', { name: 'Add child node' }))
      .toBeVisible();
  });

  test('初始值渲染', async () => {
    const data = `{"type":"object","title":"title","properties":{"field_1":{"type":"string","title":"field_1_title","description":"field_1_description"}},"required":["field_1"]}`;
    await render(<SchemaEditor data={data} />);

    const field1 = page.locator('input[value="field_1"]');
    await expect.element(field1).toBeVisible();

    const row = page
      .locator('.schema-content div.ant-row')
      .filter({ has: field1 });
    await expect.element(row.getByText('string')).toBeVisible();
    await expect.element(row.getByRole('checkbox')).toBeVisible();
    await expect
      .element(row.locator('input[value="field_1_title"]'))
      .toBeVisible();
    await expect
      .element(row.locator('input[value="field_1_description"]'))
      .toBeVisible();
  });

  test('导入按钮可被点击，点击后打开导入模态框', async () => {
    await render(<SchemaEditor />);

    await page.getByRole('button', { name: 'Import JSON' }).click();

    await expect
      .element(page.getByRole('dialog', { name: 'Import JSON' }))
      .toBeVisible();
  });

  test('标题编辑按钮可被点击，点击后打开标题模态框', async () => {
    await render(<SchemaEditor />);

    const titleInput = page.getByRole('textbox', { name: 'Title' });
    const wrapper = titleInput.locator(
      'xpath=ancestor::*[contains(@class, "ant-space-compact")]',
    );

    await wrapper.getByRole('img', { name: /edit/i }).click();

    await expect
      .element(page.getByRole('dialog', { name: 'Title' }))
      .toBeVisible();
  });

  test('描述编辑按钮可被点击，点击后打开描述模态框', async () => {
    await render(<SchemaEditor />);

    const descInput = page.getByPlaceholder('description');
    const wrapper = descInput.locator(
      'xpath=ancestor::*[contains(@class, "ant-space-compact")]',
    );

    await wrapper.getByRole('img', { name: /edit/i }).click();

    await expect
      .element(page.getByRole('dialog', { name: 'Description' }))
      .toBeVisible();
  });

  test('高级设置按钮可被点击，点击后打开高级设置模态框', async () => {
    await render(<SchemaEditor />);

    await page.getByRole('img', { name: 'setting' }).click();

    await expect
      .element(page.getByRole('dialog', { name: 'Advanced Settings' }))
      .toBeVisible();
  });

  test('添加节点按钮可被点击，点击后新增子节点', async () => {
    await render(<SchemaEditor />);

    await page.getByRole('img', { name: 'plus' }).click();

    const newField = page.locator('input[value="field_1"]');
    await expect.element(newField).toBeVisible();

    const row = page
      .locator('.schema-content div.ant-row')
      .filter({ has: newField });
    await expect.element(row.getByText('string')).toBeVisible();
    await expect.element(row.getByRole('checkbox')).toBeVisible();
  });

  test('编辑 string 类型子节点', async () => {
    const onChange = rs.fn();
    await render(<SchemaEditor onChange={onChange} />);

    // 新增节点
    const addedRow = await addTypedNode(page, 'string');
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"string"}},"required":["field_1"]}`,
    );

    await addedRow
      .getByTestId('SchemaItem_propNameInput')
      .fill('field1_string');
    await addedRow.getByTestId('SchemaItem_propNameInput').blur();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field1_string":{"type":"string"}},"required":["field1_string"]}`,
    );

    await addedRow.getByTestId('SchemaItem_titleInput').fill('field1_title');
    await addedRow.getByTestId('SchemaItem_titleInput').blur();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field1_string":{"type":"string","title":"field1_title"}},"required":["field1_string"]}`,
    );

    await addedRow.getByTestId('SchemaItem_descInput').fill('field1_desc');
    await addedRow.getByTestId('SchemaItem_descInput').blur();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field1_string":{"type":"string","title":"field1_title","description":"field1_desc"}},"required":["field1_string"]}`,
    );

    // string 类型节点高级设置
    await addedRow.getByRole('button', { name: 'Advanced settings' }).click();

    const advModal = page.getByRole('dialog', { name: 'Advanced settings' });
    expect.element(advModal).toBeVisible();
    await advModal
      .getByRole('textbox', { name: 'Default' })
      .fill('string_default');
    await advModal.getByRole('spinbutton', { name: 'min.length' }).fill('8');
    await advModal.getByRole('spinbutton', { name: 'max.length' }).fill('12');
    await advModal.getByRole('textbox', { name: 'Pattern' }).fill('/\s+/g');
  });

  test('string 节点高级设置', async () => {
    const onChange = rs.fn();
    await render(<SchemaEditor onChange={onChange} />);

    // 新增节点
    const addedRow = await addTypedNode(page, 'string');

    // string 类型节点高级设置
    await addedRow.getByRole('button', { name: 'Advanced settings' }).click();

    const advModal = page.getByRole('dialog', { name: 'Advanced settings' });
    expect.element(advModal).toBeVisible();
    await advModal
      .getByRole('textbox', { name: 'Default' })
      .fill('string_default');
    await advModal.getByRole('spinbutton', { name: 'min.length' }).fill('8');
    await advModal.getByRole('spinbutton', { name: 'max.length' }).fill('12');
    await advModal.getByRole('textbox', { name: 'Pattern' }).fill('/\s+/g');
    await advModal
      .locator('.ant-row')
      .filter({ hasText: 'format' })
      .getByRole('combobox')
      .click();
    await page
      .locator('div.ant-select-dropdown div.ant-select-item')
      .filter({ hasText: 'email' })
      .click();

    await advModal.getByRole('button', { name: 'OK' }).click();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"string","default":"string_default","minLength":8,"maxLength":12,"pattern":"/s+/g","format":"email"}},"required":["field_1"]}`,
    );
  });

  test('编辑 number 类型子节点', async () => {
    const onChange = rs.fn();
    await render(<SchemaEditor onChange={onChange} />);

    // 新增节点
    const addedRow = await addTypedNode(page, 'number');
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"number"}},"required":["field_1"]}`,
    );

    await addedRow
      .getByTestId('SchemaItem_propNameInput')
      .fill('field1_number');
    await addedRow.getByTestId('SchemaItem_propNameInput').blur();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field1_number":{"type":"number"}},"required":["field1_number"]}`,
    );

    await addedRow.getByTestId('SchemaItem_titleInput').fill('field1_title');
    await addedRow.getByTestId('SchemaItem_titleInput').blur();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field1_number":{"type":"number","title":"field1_title"}},"required":["field1_number"]}`,
    );

    await addedRow.getByTestId('SchemaItem_descInput').fill('field1_desc');
    await addedRow.getByTestId('SchemaItem_descInput').blur();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field1_number":{"type":"number","title":"field1_title","description":"field1_desc"}},"required":["field1_number"]}`,
    );
  });

  test('number 节点高级设置', async () => {
    const onChange = rs.fn();
    await render(<SchemaEditor onChange={onChange} />);

    // 新增节点
    const addedRow = await addTypedNode(page, 'number');

    // 节点高级设置
    await addedRow.getByRole('button', { name: 'Advanced settings' }).click();

    const advModal = page.getByRole('dialog', { name: 'Advanced settings' });
    expect.element(advModal).toBeVisible();
    await advModal
      .getByTestId('advSettingModal_default')
      .fill('number_default');
    await advModal.getByTestId('advSettingModal_exclusiveMinimum').click();
    await advModal.getByTestId('advSettingModal_exclusiveMaximum').click();
    await advModal.getByTestId('advSettingModal_minimum').fill('1');
    await advModal.getByTestId('advSettingModal_maximum').fill('100');
    await advModal.getByTestId('advSettingModal_enumCheckbox').click();
    await advModal.getByTestId('advSettingModal_enumTextarea').fill('1\n2\n3');
    await advModal.getByTestId('advSettingModal_enumDesc').fill('number_desc');
    await advModal.getByRole('button', { name: 'OK' }).click();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"number","default":"number_default","exclusiveMinimum":true,"exclusiveMaximum":true,"minimum":1,"maximum":100,"enum":[1,2,3],"enumDesc":"number_desc"}},"required":["field_1"]}`,
    );
  });

  test('编辑 array 类型子节点', async () => {
    const onChange = rs.fn();
    await render(<SchemaEditor onChange={onChange} />);

    // 新增节点
    const addedRow = await addTypedNode(page, 'array');
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"array","items":{"type":"string"}}},"required":["field_1"]}`,
    );

    await addedRow.getByTestId('SchemaItem_propNameInput').fill('field1_array');
    await addedRow.getByTestId('SchemaItem_propNameInput').blur();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field1_array":{"type":"array","items":{"type":"string"}}},"required":["field1_array"]}`,
    );

    await addedRow.getByTestId('SchemaItem_titleInput').fill('field1_title');
    await addedRow.getByTestId('SchemaItem_titleInput').blur();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field1_array":{"type":"array","items":{"type":"string"},"title":"field1_title"}},"required":["field1_array"]}`,
    );

    await addedRow.getByTestId('SchemaItem_descInput').fill('field1_desc');
    await addedRow.getByTestId('SchemaItem_descInput').blur();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field1_array":{"type":"array","items":{"type":"string"},"title":"field1_title","description":"field1_desc"}},"required":["field1_array"]}`,
    );
  });

  test('array 节点高级设置', async () => {
    const onChange = rs.fn();
    await render(<SchemaEditor onChange={onChange} />);

    // 新增节点
    const addedRow = await addTypedNode(page, 'array');

    // 节点高级设置
    await addedRow.getByRole('button', { name: 'Advanced settings' }).click();

    const advModal = page.getByRole('dialog', { name: 'Advanced settings' });
    expect.element(advModal).toBeVisible();

    await advModal.getByTestId('advSettingModal_uniqueItemsSwitch').click();
    await advModal.getByTestId('advSettingModal_minItemsInput').fill('12');
    await advModal.getByTestId('advSettingModal_maxItemsInput').fill('34');

    await advModal.getByRole('button', { name: 'OK' }).click();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"array","items":{"type":"string"},"uniqueItems":true,"minItems":12,"maxItems":34}},"required":["field_1"]}`,
    );
  });

  test('编辑 object 类型子节点', async () => {
    const onChange = rs.fn();
    await render(<SchemaEditor onChange={onChange} />);

    // 新增节点
    const addedRow = await addTypedNode(page, 'object');
    expect(onChange).lastCalledWith(
      '{"type":"object","title":"title","properties":{"field_1":{"type":"object","properties":{}}},"required":["field_1"]}',
    );

    // 修改属性名称
    await addedRow
      .getByTestId('SchemaItem_propNameInput')
      .fill('field1_object');
    await addedRow.getByTestId('SchemaItem_propNameInput').blur();
    expect(onChange).lastCalledWith(
      '{"type":"object","title":"title","properties":{"field1_object":{"type":"object","properties":{}}},"required":["field1_object"]}',
    );

    // 修改标题
    await addedRow.getByTestId('SchemaItem_titleInput').fill('field1_title');
    await addedRow.getByTestId('SchemaItem_titleInput').blur();
    expect(onChange).lastCalledWith(
      '{"type":"object","title":"title","properties":{"field1_object":{"type":"object","properties":{},"title":"field1_title"}},"required":["field1_object"]}',
    );

    // 修改描述
    await addedRow.getByTestId('SchemaItem_descInput').fill('field1_desc');
    await addedRow.getByTestId('SchemaItem_descInput').blur();
    expect(onChange).lastCalledWith(
      '{"type":"object","title":"title","properties":{"field1_object":{"type":"object","properties":{},"title":"field1_title","description":"field1_desc"}},"required":["field1_object"]}',
    );
  });

  test('object 节点高级设置', async () => {
    const onChange = rs.fn();
    await render(<SchemaEditor onChange={onChange} />);

    // 新增节点
    const addedRow = await addTypedNode(page, 'object');

    // 节点高级设置
    await addedRow.getByRole('button', { name: 'Advanced settings' }).click();

    const advModal = page.getByRole('dialog', { name: 'Advanced settings' });
    expect.element(advModal).toBeVisible();

    await advModal.getByRole('button', { name: 'OK' }).click();
    expect(onChange).lastCalledWith(
      '{"type":"object","title":"title","properties":{"field_1":{"type":"object","properties":{}}},"required":["field_1"]}',
    );
  });

  test('编辑 boolean 类型子节点', async () => {
    const onChange = rs.fn();
    await render(<SchemaEditor onChange={onChange} />);

    const addedRow = await addTypedNode(page, 'boolean');
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"boolean"}},"required":["field_1"]}`,
    );

    await addedRow
      .getByTestId('SchemaItem_propNameInput')
      .fill('field1_boolean');
    await addedRow.getByTestId('SchemaItem_propNameInput').blur();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field1_boolean":{"type":"boolean"}},"required":["field1_boolean"]}`,
    );

    await addedRow.getByTestId('SchemaItem_titleInput').fill('field1_title');
    await addedRow.getByTestId('SchemaItem_titleInput').blur();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field1_boolean":{"type":"boolean","title":"field1_title"}},"required":["field1_boolean"]}`,
    );

    await addedRow.getByTestId('SchemaItem_descInput').fill('field1_desc');
    await addedRow.getByTestId('SchemaItem_descInput').blur();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field1_boolean":{"type":"boolean","title":"field1_title","description":"field1_desc"}},"required":["field1_boolean"]}`,
    );
  });

  test('boolean 节点高级设置', async () => {
    const onChange = rs.fn();
    await render(<SchemaEditor onChange={onChange} />);

    const addedRow = await addTypedNode(page, 'boolean');

    await addedRow.getByRole('button', { name: 'Advanced settings' }).click();

    const advModal = page.getByRole('dialog', { name: 'Advanced settings' });
    expect.element(advModal).toBeVisible();

    await advModal.getByTestId('advSettingModal_defaultSelect').click();
    await page
      .locator('div.ant-select-dropdown div.ant-select-item')
      .filter({ hasText: 'true' })
      .click();

    await advModal.getByRole('button', { name: 'OK' }).click();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"boolean","default":true}},"required":["field_1"]}`,
    );
  });

  test('编辑 integer 类型子节点', async () => {
    const onChange = rs.fn();
    await render(<SchemaEditor onChange={onChange} />);

    const addedRow = await addTypedNode(page, 'integer');
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"integer"}},"required":["field_1"]}`,
    );

    await addedRow
      .getByTestId('SchemaItem_propNameInput')
      .fill('field1_integer');
    await addedRow.getByTestId('SchemaItem_propNameInput').blur();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field1_integer":{"type":"integer"}},"required":["field1_integer"]}`,
    );

    await addedRow.getByTestId('SchemaItem_titleInput').fill('field1_title');
    await addedRow.getByTestId('SchemaItem_titleInput').blur();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field1_integer":{"type":"integer","title":"field1_title"}},"required":["field1_integer"]}`,
    );

    await addedRow.getByTestId('SchemaItem_descInput').fill('field1_desc');
    await addedRow.getByTestId('SchemaItem_descInput').blur();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field1_integer":{"type":"integer","title":"field1_title","description":"field1_desc"}},"required":["field1_integer"]}`,
    );
  });

  test('integer 节点高级设置', async () => {
    const onChange = rs.fn();
    await render(<SchemaEditor onChange={onChange} />);

    const addedRow = await addTypedNode(page, 'integer');

    await addedRow.getByRole('button', { name: 'Advanced settings' }).click();

    const advModal = page.getByRole('dialog', { name: 'Advanced settings' });
    expect.element(advModal).toBeVisible();
    await advModal
      .getByTestId('advSettingModal_default')
      .fill('integer_default');
    await advModal.getByTestId('advSettingModal_exclusiveMinimum').click();
    await advModal.getByTestId('advSettingModal_exclusiveMaximum').click();
    await advModal.getByTestId('advSettingModal_minimum').fill('1');
    await advModal.getByTestId('advSettingModal_maximum').fill('100');
    await advModal.getByTestId('advSettingModal_enumCheckbox').click();
    await advModal.getByTestId('advSettingModal_enumTextarea').fill('1\n2\n3');
    await advModal.getByTestId('advSettingModal_enumDesc').fill('integer_desc');
    await advModal.getByRole('button', { name: 'OK' }).click();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"integer","default":"integer_default","exclusiveMinimum":true,"exclusiveMaximum":true,"minimum":1,"maximum":100,"enum":[1,2,3],"enumDesc":"integer_desc"}},"required":["field_1"]}`,
    );
  });

  test('string 节点高级设置 - 自定义 format 列表', async () => {
    const onChange = rs.fn();
    const customFormats = [
      { name: 'uuid', title: 'UUID' },
      { name: 'phone', title: 'Phone Number' },
    ];
    await render(<SchemaEditor format={customFormats} onChange={onChange} />);

    const addedRow = await addTypedNode(page, 'string');

    await addedRow.getByRole('button', { name: 'Advanced settings' }).click();

    const advModal = page.getByRole('dialog', { name: 'Advanced settings' });
    expect.element(advModal).toBeVisible();

    // 打开 format 下拉框，验证自定义 format 选项出现
    await advModal
      .locator('.ant-row')
      .filter({ hasText: 'format' })
      .getByRole('combobox')
      .click();

    const dropdownItems = page.locator(
      'div.ant-select-dropdown div.ant-select-item',
    );
    await expect
      .element(dropdownItems.filter({ hasText: 'uuid' }))
      .toBeVisible();
    await expect
      .element(dropdownItems.filter({ hasText: 'phone' }))
      .toBeVisible();

    // 默认 format 不应出现
    await expect
      .element(dropdownItems.filter({ hasText: 'email' }))
      .not.toBeVisible();

    // 选择自定义 format 并验证
    await dropdownItems.filter({ hasText: 'uuid' }).click();
    await advModal.getByRole('button', { name: 'OK' }).click();
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"string","format":"uuid"}},"required":["field_1"]}`,
    );
  });

  test('object 节点增加子节点和相邻节点', async () => {
    const onChange = rs.fn();
    await render(<SchemaEditor onChange={onChange} />);

    // 新增节点
    const addedRow = await addTypedNode(page, 'object');
    await page
      .getByTestId('SchemaItem')
      .locator('.ant-row')
      .filter({ has: page.locator('input[value="field_1"]') })
      .getByRole('img', { name: 'plus' })
      .hover();
    await page.getByRole('menuitem', { name: 'Child node' }).click();
    await page
      .getByTestId('SchemaItem')
      .locator('.ant-row')
      .filter({ has: page.locator('input[value="field_1"]') })
      .getByRole('img', { name: 'plus' })
      .hover();
    await page.getByRole('menuitem', { name: 'Sibling node' }).click();

    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"object","properties":{"field_2":{"type":"string"}},"required":["field_2"]},"field_3":{"type":"string"}},"required":["field_1","field_3"]}`,
    );
  });

  test('传入 mock 时显示 mock 列', async () => {
    const mockSource = [
      { name: '字符串', mock: '@string' },
      { name: '自然数', mock: '@natural' },
    ];
    await render(<SchemaEditor mock={mockSource} />);

    // mock AutoComplete 应可见（MockSelect 使用 certain-category-search 类名）
    await expect
      .element(page.locator('.certain-category-search').first())
      .toBeVisible();
  });

  test('未传 mock 时不显示 mock 列', async () => {
    await render(<SchemaEditor />);

    // mock AutoComplete 不应存在
    await expect
      .element(page.locator('.certain-category-search').first())
      .not.toBeVisible();
  });

  test('mock 输入框在 object 类型时禁用', async () => {
    const mockSource = [
      { name: '字符串', mock: '@string' },
      { name: '自然数', mock: '@natural' },
    ];
    await render(<SchemaEditor mock={mockSource} />);

    // 根节点是 object 类型，mock 输入框应禁用
    const mockInput = page.locator('.certain-category-search input').first();
    await expect.element(mockInput).toBeVisible();
    await expect.element(mockInput).toBeDisabled();
  });

  test('mock 输入框在 array 类型时禁用', async () => {
    const mockSource = [
      { name: '字符串', mock: '@string' },
      { name: '自然数', mock: '@natural' },
    ];
    await render(<SchemaEditor mock={mockSource} />);

    // 新增 array 类型节点
    const addedRow = await addTypedNode(page, 'array');
    // array 类型会自动展开子节点，取第一个 mock 输入框（即 array 行本身的）
    const mockInput = addedRow
      .locator('.certain-category-search input')
      .first();
    await expect.element(mockInput).toBeVisible();
    await expect.element(mockInput).toBeDisabled();
  });

  test('mock 输入框在 string 类型时可用', async () => {
    const mockSource = [
      { name: '字符串', mock: '@string' },
      { name: '自然数', mock: '@natural' },
    ];
    await render(<SchemaEditor mock={mockSource} />);

    // 新增 string 类型节点
    const addedRow = await addTypedNode(page, 'string');
    const mockInput = addedRow.locator('.certain-category-search input');
    await expect.element(mockInput).toBeVisible();
    await expect.element(mockInput).not.toBeDisabled();
  });

  test('选择 mock 值后更新 schema', async () => {
    const onChange = rs.fn();
    const mockSource = [
      { name: '字符串', mock: '@string' },
      { name: '自然数', mock: '@natural' },
    ];
    await render(<SchemaEditor mock={mockSource} onChange={onChange} />);

    // 新增 string 类型节点
    const addedRow = await addTypedNode(page, 'string');

    // 选择 mock 值
    const mockInput = addedRow.locator('.certain-category-search input');
    await mockInput.click();
    await page
      .locator('div.ant-select-dropdown div.ant-select-item')
      .filter({ hasText: '@string' })
      .click();

    // 验证 onChange 被调用且包含 mock 值
    expect(onChange).lastCalledWith(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"string","mock":{"mock":"@string"}}},"required":["field_1"]}`,
    );
  });

  test('初始值包含 mock 时正确渲染', async () => {
    const mockSource = [
      { name: '字符串', mock: '@string' },
      { name: '自然数', mock: '@natural' },
    ];
    const data = `{"type":"object","title":"title","properties":{"field_1":{"type":"string","mock":{"mock":"@string"}}},"required":["field_1"]}`;
    await render(<SchemaEditor mock={mockSource} data={data} />);

    // 验证 mock 输入框显示正确的值
    const field1 = page.locator('input[value="field_1"]');
    const row = page
      .locator('.schema-content div.ant-row')
      .filter({ has: field1 });
    const mockInput = row.locator('.certain-category-search input');
    await expect.element(mockInput).toBeVisible();
    await expect.element(mockInput).toHaveValue('@string');
  });
});

describe('国际化 (i18n)', () => {
  test('zh_CN 语言下显示中文导入按钮', async () => {
    await render(
      <ConfigProvider locale={zhCN}>
        <SchemaEditor />
      </ConfigProvider>,
    );
    await expect
      .element(page.getByRole('button', { name: '导入 json' }))
      .toBeVisible();
  });

  test('zh_CN 语言下显示中文高级设置', async () => {
    await render(
      <ConfigProvider locale={zhCN}>
        <SchemaEditor />
      </ConfigProvider>,
    );
    await page.getByRole('img', { name: 'setting' }).click();
    await expect
      .element(page.getByRole('dialog', { name: '高级设置' }))
      .toBeVisible();
  });

  test('zh_CN 语言下显示中文标题和描述占位符', async () => {
    await render(
      <ConfigProvider locale={zhCN}>
        <SchemaEditor />
      </ConfigProvider>,
    );
    const addedRow = await addTypedNode(page, 'string');
    await expect.element(addedRow.getByPlaceholder('标题')).toBeVisible();
    await expect.element(addedRow.getByPlaceholder('备注')).toBeVisible();
  });

  test('zh_CN 语言下显示中文节点操作提示', async () => {
    await render(
      <ConfigProvider locale={zhCN}>
        <SchemaEditor />
      </ConfigProvider>,
    );
    const addedRow = await addTypedNode(page, 'object');
    await addedRow.getByRole('img', { name: 'plus' }).hover();
    await expect
      .element(page.getByRole('menuitem', { name: '兄弟节点' }))
      .toBeVisible();
    await expect
      .element(page.getByRole('menuitem', { name: '子节点' }))
      .toBeVisible();
  });

  test('zh_CN 语言下高级设置模态框显示中文', async () => {
    await render(
      <ConfigProvider locale={zhCN}>
        <SchemaEditor />
      </ConfigProvider>,
    );
    const addedRow = await addTypedNode(page, 'string');
    await addedRow.getByRole('button', { name: '高级设置' }).click();
    const advModal = page.getByRole('dialog', { name: '高级设置' });
    await expect.element(advModal).toBeVisible();
    await expect.element(advModal.getByText('基础设置')).toBeVisible();
    await expect.element(advModal.getByPlaceholder('默认值')).toBeVisible();
  });
});

/**
 * 增加指定类型节点
 */
async function addTypedNode(
  page: BrowserPage,
  type: 'string' | 'number' | 'array' | 'object' | 'boolean' | 'integer',
) {
  await page.getByRole('img', { name: 'plus' }).click();
  const addedRow = page.getByTestId('SchemaItem').last();
  await addedRow.locator('div.ant-select.type-select-style').click();
  await page
    .locator('div.ant-select-dropdown div.ant-select-item')
    .filter({ hasText: type })
    .click();
  return addedRow;
}
