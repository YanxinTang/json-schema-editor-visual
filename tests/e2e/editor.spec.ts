import { test, expect } from '@playwright/test';
import { addTypedNode, gotoEditor } from './helpers';

test.describe('JsonSchemaReactEditor', () => {
  test('初始状态渲染', async ({ page }) => {
    await gotoEditor(page);

    // 顶部导入按钮
    await expect(
      page.getByRole('button', { name: 'Import JSON' }),
    ).toBeVisible();

    // root 输入框（禁用状态）
    const rootInput = page.locator('input[value="root"]');
    await expect(rootInput).toBeVisible();
    await expect(rootInput).toBeDisabled();

    // 类型选择器 object
    await expect(
      page.locator('.type-select-style').getByText('object'),
    ).toBeVisible();

    // title 输入框
    await expect(page.getByRole('textbox', { name: 'Title' })).toBeVisible();

    // description 输入框
    await expect(page.getByPlaceholder('description')).toBeVisible();

    // 根节点展开图标
    await expect(page.getByRole('img', { name: 'caret-down' })).toBeVisible();

    // 设置按钮
    await expect(page.getByRole('img', { name: 'setting' })).toBeVisible();

    // 新增按钮
    await expect(page.getByRole('img', { name: 'plus' })).toBeVisible();
  });

  test('初始值渲染', async ({ page }) => {
    const data = `{"type":"object","title":"title","properties":{"field_1":{"type":"string","title":"field_1_title","description":"field_1_description"}},"required":["field_1"]}`;
    await gotoEditor(page, { data });

    const field1 = page.locator('input[value="field_1"]');
    await expect(field1).toBeVisible();

    const row = page
      .locator('.schema-content div.ant-row')
      .filter({ has: field1 });
    await expect(row.getByText('string')).toBeVisible();
    await expect(row.getByRole('checkbox')).toBeVisible();
    await expect(row.locator('input[value="field_1_title"]')).toBeVisible();
    await expect(
      row.locator('input[value="field_1_description"]'),
    ).toBeVisible();
  });

  test('导入按钮可被点击，点击后打开导入模态框', async ({ page }) => {
    await gotoEditor(page);

    await page.getByRole('button', { name: 'Import JSON' }).click();

    await expect(
      page.getByRole('dialog', { name: 'Import JSON' }),
    ).toBeVisible();
  });

  test('标题编辑按钮可被点击，点击后打开标题模态框', async ({ page }) => {
    await gotoEditor(page);

    const titleInput = page.getByRole('textbox', { name: 'Title' });
    const wrapper = titleInput.locator(
      'xpath=ancestor::*[contains(@class, "ant-space-compact")]',
    );

    await wrapper.getByRole('img', { name: /edit/i }).click();

    await expect(page.getByRole('dialog', { name: 'Title' })).toBeVisible();
  });

  test('描述编辑按钮可被点击，点击后打开描述模态框', async ({ page }) => {
    await gotoEditor(page);

    const descInput = page.getByPlaceholder('description');
    const wrapper = descInput.locator(
      'xpath=ancestor::*[contains(@class, "ant-space-compact")]',
    );

    await wrapper.getByRole('img', { name: /edit/i }).click();

    await expect(
      page.getByRole('dialog', { name: 'Description' }),
    ).toBeVisible();
  });

  test('高级设置按钮可被点击，点击后打开高级设置模态框', async ({ page }) => {
    await gotoEditor(page);

    await page.getByRole('img', { name: 'setting' }).click();

    await expect(
      page.getByRole('dialog', { name: 'Advanced Settings' }),
    ).toBeVisible();
  });

  test('添加节点按钮可被点击，点击后新增子节点', async ({ page }) => {
    await gotoEditor(page);

    await page.getByRole('img', { name: 'plus' }).click();

    const newField = page.locator('input[value="field_1"]');
    await expect(newField).toBeVisible();

    const row = page
      .locator('.schema-content div.ant-row')
      .filter({ has: newField });
    await expect(row.getByText('string')).toBeVisible();
    await expect(row.getByRole('checkbox')).toBeVisible();
  });

  test('编辑 string 类型子节点', async ({ page }) => {
    await gotoEditor(page);

    // 新增节点
    const addedRow = await addTypedNode(page, 'string');
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"string"}},"required":["field_1"]}`,
    );

    await addedRow
      .getByTestId('SchemaItem_propNameInput')
      .fill('field1_string');
    await addedRow.getByTestId('SchemaItem_propNameInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field1_string":{"type":"string"}},"required":["field1_string"]}`,
    );

    await addedRow.getByTestId('SchemaItem_titleInput').fill('field1_title');
    await addedRow.getByTestId('SchemaItem_titleInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field1_string":{"type":"string","title":"field1_title"}},"required":["field1_string"]}`,
    );

    await addedRow.getByTestId('SchemaItem_descInput').fill('field1_desc');
    await addedRow.getByTestId('SchemaItem_descInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field1_string":{"type":"string","title":"field1_title","description":"field1_desc"}},"required":["field1_string"]}`,
    );

    // string 类型节点高级设置
    await addedRow.getByRole('button', { name: 'Advanced settings' }).click();

    const advModal = page.getByRole('dialog', { name: 'Advanced Settings' });
    await expect(advModal).toBeVisible();
    await advModal
      .getByRole('textbox', { name: 'Default' })
      .fill('string_default');
    await advModal.getByRole('spinbutton', { name: 'min.length' }).fill('8');
    await advModal.getByRole('spinbutton', { name: 'max.length' }).fill('12');
    await advModal.getByRole('textbox', { name: 'Pattern' }).fill('/\\s+/g');
  });

  test('string 节点高级设置', async ({ page }) => {
    await gotoEditor(page);

    // 新增节点
    const addedRow = await addTypedNode(page, 'string');

    // string 类型节点高级设置
    await addedRow.getByRole('button', { name: 'Advanced settings' }).click();

    const advModal = page.getByRole('dialog', { name: 'Advanced Settings' });
    await expect(advModal).toBeVisible();
    await advModal
      .getByRole('textbox', { name: 'Default' })
      .fill('string_default');
    await advModal.getByRole('spinbutton', { name: 'min.length' }).fill('8');
    await advModal.getByRole('spinbutton', { name: 'max.length' }).fill('12');
    await advModal.getByRole('textbox', { name: 'Pattern' }).fill('/\\s+/g');
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
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"string","default":"string_default","minLength":8,"maxLength":12,"pattern":"/\\\\s+/g","format":"email"}},"required":["field_1"]}`,
    );
  });

  test('编辑 number 类型子节点', async ({ page }) => {
    await gotoEditor(page);

    // 新增节点
    const addedRow = await addTypedNode(page, 'number');
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"number"}},"required":["field_1"]}`,
    );

    await addedRow
      .getByTestId('SchemaItem_propNameInput')
      .fill('field1_number');
    await addedRow.getByTestId('SchemaItem_propNameInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field1_number":{"type":"number"}},"required":["field1_number"]}`,
    );

    await addedRow.getByTestId('SchemaItem_titleInput').fill('field1_title');
    await addedRow.getByTestId('SchemaItem_titleInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field1_number":{"type":"number","title":"field1_title"}},"required":["field1_number"]}`,
    );

    await addedRow.getByTestId('SchemaItem_descInput').fill('field1_desc');
    await addedRow.getByTestId('SchemaItem_descInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field1_number":{"type":"number","title":"field1_title","description":"field1_desc"}},"required":["field1_number"]}`,
    );
  });

  test('number 节点高级设置', async ({ page }) => {
    await gotoEditor(page);

    // 新增节点
    const addedRow = await addTypedNode(page, 'number');

    // 节点高级设置
    await addedRow.getByRole('button', { name: 'Advanced settings' }).click();

    const advModal = page.getByRole('dialog', { name: 'Advanced Settings' });
    await expect(advModal).toBeVisible();
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
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"number","default":"number_default","exclusiveMinimum":true,"exclusiveMaximum":true,"minimum":1,"maximum":100,"enum":[1,2,3],"enumDesc":"number_desc"}},"required":["field_1"]}`,
    );
  });

  test('编辑 array 类型子节点', async ({ page }) => {
    await gotoEditor(page);

    // 新增节点
    const addedRow = await addTypedNode(page, 'array');
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"array","items":{"type":"string"}}},"required":["field_1"]}`,
    );

    await addedRow.getByTestId('SchemaItem_propNameInput').fill('field1_array');
    await addedRow.getByTestId('SchemaItem_propNameInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field1_array":{"type":"array","items":{"type":"string"}}},"required":["field1_array"]}`,
    );

    await addedRow.getByTestId('SchemaItem_titleInput').fill('field1_title');
    await addedRow.getByTestId('SchemaItem_titleInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field1_array":{"type":"array","items":{"type":"string"},"title":"field1_title"}},"required":["field1_array"]}`,
    );

    await addedRow.getByTestId('SchemaItem_descInput').fill('field1_desc');
    await addedRow.getByTestId('SchemaItem_descInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field1_array":{"type":"array","items":{"type":"string"},"title":"field1_title","description":"field1_desc"}},"required":["field1_array"]}`,
    );
  });

  test('array 节点高级设置', async ({ page }) => {
    await gotoEditor(page);

    // 新增节点
    const addedRow = await addTypedNode(page, 'array');

    // 节点高级设置
    await addedRow.getByRole('button', { name: 'Advanced settings' }).click();

    const advModal = page.getByRole('dialog', { name: 'Advanced Settings' });
    await expect(advModal).toBeVisible();

    await advModal.getByTestId('advSettingModal_uniqueItemsSwitch').click();
    await advModal.getByTestId('advSettingModal_minItemsInput').fill('12');
    await advModal.getByTestId('advSettingModal_maxItemsInput').fill('34');

    await advModal.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"array","items":{"type":"string"},"uniqueItems":true,"minItems":12,"maxItems":34}},"required":["field_1"]}`,
    );
  });

  test('编辑 object 类型子节点', async ({ page }) => {
    await gotoEditor(page);

    // 新增节点
    const addedRow = await addTypedNode(page, 'object');
    await expect(page.getByTestId('schema-output')).toHaveText(
      '{"type":"object","title":"title","properties":{"field_1":{"type":"object","properties":{}}},"required":["field_1"]}',
    );

    // 修改属性名称
    await addedRow
      .getByTestId('SchemaItem_propNameInput')
      .fill('field1_object');
    await addedRow.getByTestId('SchemaItem_propNameInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      '{"type":"object","title":"title","properties":{"field1_object":{"type":"object","properties":{}}},"required":["field1_object"]}',
    );

    // 修改标题
    await addedRow.getByTestId('SchemaItem_titleInput').fill('field1_title');
    await addedRow.getByTestId('SchemaItem_titleInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      '{"type":"object","title":"title","properties":{"field1_object":{"type":"object","properties":{},"title":"field1_title"}},"required":["field1_object"]}',
    );

    // 修改描述
    await addedRow.getByTestId('SchemaItem_descInput').fill('field1_desc');
    await addedRow.getByTestId('SchemaItem_descInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      '{"type":"object","title":"title","properties":{"field1_object":{"type":"object","properties":{},"title":"field1_title","description":"field1_desc"}},"required":["field1_object"]}',
    );
  });

  test('object 节点高级设置', async ({ page }) => {
    await gotoEditor(page);

    // 新增节点
    const addedRow = await addTypedNode(page, 'object');

    // 节点高级设置
    await addedRow.getByRole('button', { name: 'Advanced settings' }).click();

    const advModal = page.getByRole('dialog', { name: 'Advanced Settings' });
    await expect(advModal).toBeVisible();

    await advModal.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByTestId('schema-output')).toHaveText(
      '{"type":"object","title":"title","properties":{"field_1":{"type":"object","properties":{}}},"required":["field_1"]}',
    );
  });

  test('编辑 boolean 类型子节点', async ({ page }) => {
    await gotoEditor(page);

    const addedRow = await addTypedNode(page, 'boolean');
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"boolean"}},"required":["field_1"]}`,
    );

    await addedRow
      .getByTestId('SchemaItem_propNameInput')
      .fill('field1_boolean');
    await addedRow.getByTestId('SchemaItem_propNameInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field1_boolean":{"type":"boolean"}},"required":["field1_boolean"]}`,
    );

    await addedRow.getByTestId('SchemaItem_titleInput').fill('field1_title');
    await addedRow.getByTestId('SchemaItem_titleInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field1_boolean":{"type":"boolean","title":"field1_title"}},"required":["field1_boolean"]}`,
    );

    await addedRow.getByTestId('SchemaItem_descInput').fill('field1_desc');
    await addedRow.getByTestId('SchemaItem_descInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field1_boolean":{"type":"boolean","title":"field1_title","description":"field1_desc"}},"required":["field1_boolean"]}`,
    );
  });

  test('boolean 节点高级设置', async ({ page }) => {
    await gotoEditor(page);

    const addedRow = await addTypedNode(page, 'boolean');

    await addedRow.getByRole('button', { name: 'Advanced settings' }).click();

    const advModal = page.getByRole('dialog', { name: 'Advanced Settings' });
    await expect(advModal).toBeVisible();

    await advModal.getByTestId('advSettingModal_defaultSelect').click();
    await page
      .locator('div.ant-select-dropdown div.ant-select-item')
      .filter({ hasText: 'true' })
      .click();

    await advModal.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"boolean","default":true}},"required":["field_1"]}`,
    );
  });

  test('编辑 integer 类型子节点', async ({ page }) => {
    await gotoEditor(page);

    const addedRow = await addTypedNode(page, 'integer');
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"integer"}},"required":["field_1"]}`,
    );

    await addedRow
      .getByTestId('SchemaItem_propNameInput')
      .fill('field1_integer');
    await addedRow.getByTestId('SchemaItem_propNameInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field1_integer":{"type":"integer"}},"required":["field1_integer"]}`,
    );

    await addedRow.getByTestId('SchemaItem_titleInput').fill('field1_title');
    await addedRow.getByTestId('SchemaItem_titleInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field1_integer":{"type":"integer","title":"field1_title"}},"required":["field1_integer"]}`,
    );

    await addedRow.getByTestId('SchemaItem_descInput').fill('field1_desc');
    await addedRow.getByTestId('SchemaItem_descInput').blur();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field1_integer":{"type":"integer","title":"field1_title","description":"field1_desc"}},"required":["field1_integer"]}`,
    );
  });

  test('integer 节点高级设置', async ({ page }) => {
    await gotoEditor(page);

    const addedRow = await addTypedNode(page, 'integer');

    await addedRow.getByRole('button', { name: 'Advanced settings' }).click();

    const advModal = page.getByRole('dialog', { name: 'Advanced Settings' });
    await expect(advModal).toBeVisible();
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
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"integer","default":"integer_default","exclusiveMinimum":true,"exclusiveMaximum":true,"minimum":1,"maximum":100,"enum":[1,2,3],"enumDesc":"integer_desc"}},"required":["field_1"]}`,
    );
  });

  test('string 节点高级设置 - 自定义 format 列表', async ({ page }) => {
    await gotoEditor(page, { format: true });

    const addedRow = await addTypedNode(page, 'string');

    await addedRow.getByRole('button', { name: 'Advanced settings' }).click();

    const advModal = page.getByRole('dialog', { name: 'Advanced Settings' });
    await expect(advModal).toBeVisible();

    // 打开 format 下拉框，验证自定义 format 选项出现
    await advModal
      .locator('.ant-row')
      .filter({ hasText: 'format' })
      .getByRole('combobox')
      .click();

    const dropdownItems = page.locator(
      'div.ant-select-dropdown div.ant-select-item',
    );
    await expect(dropdownItems.filter({ hasText: 'uuid' })).toBeVisible();
    await expect(dropdownItems.filter({ hasText: 'phone' })).toBeVisible();

    // 默认 format 不应出现
    await expect(dropdownItems.filter({ hasText: 'email' })).not.toBeVisible();

    // 选择自定义 format 并验证
    await dropdownItems.filter({ hasText: 'uuid' }).click();
    await advModal.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"string","format":"uuid"}},"required":["field_1"]}`,
    );
  });

  test('object 节点增加子节点和相邻节点', async ({ page }) => {
    await gotoEditor(page);

    // 新增节点
    await addTypedNode(page, 'object');
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

    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"object","properties":{"field_2":{"type":"string"}},"required":["field_2"]},"field_3":{"type":"string"}},"required":["field_1","field_3"]}`,
    );
  });

  test('传入 mock 时显示 mock 列', async ({ page }) => {
    await gotoEditor(page, { mock: true });

    // mock AutoComplete 应可见
    await expect(
      page.locator('.certain-category-search').first(),
    ).toBeVisible();
  });

  test('未传 mock 时不显示 mock 列', async ({ page }) => {
    await gotoEditor(page);

    // mock AutoComplete 不应存在
    await expect(
      page.locator('.certain-category-search').first(),
    ).not.toBeVisible();
  });

  test('mock 输入框在 object 类型时禁用', async ({ page }) => {
    await gotoEditor(page, { mock: true });

    // 根节点是 object 类型，mock 输入框应禁用
    const mockInput = page.locator('.certain-category-search input').first();
    await expect(mockInput).toBeVisible();
    await expect(mockInput).toBeDisabled();
  });

  test('mock 输入框在 array 类型时禁用', async ({ page }) => {
    await gotoEditor(page, { mock: true });

    // 新增 array 类型节点
    const addedRow = await addTypedNode(page, 'array');
    const mockInput = addedRow
      .locator('.certain-category-search input')
      .first();
    await expect(mockInput).toBeVisible();
    await expect(mockInput).toBeDisabled();
  });

  test('mock 输入框在 string 类型时可用', async ({ page }) => {
    await gotoEditor(page, { mock: true });

    // 新增 string 类型节点
    const addedRow = await addTypedNode(page, 'string');
    const mockInput = addedRow.locator('.certain-category-search input');
    await expect(mockInput).toBeVisible();
    await expect(mockInput).not.toBeDisabled();
  });

  test('选择 mock 值后更新 schema', async ({ page }) => {
    await gotoEditor(page, { mock: true });

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
    await expect(page.getByTestId('schema-output')).toHaveText(
      `{"type":"object","title":"title","properties":{"field_1":{"type":"string","mock":{"mock":"@string"}}},"required":["field_1"]}`,
    );
  });

  test('初始值包含 mock 时正确渲染', async ({ page }) => {
    const data = `{"type":"object","title":"title","properties":{"field_1":{"type":"string","mock":{"mock":"@string"}}},"required":["field_1"]}`;
    await gotoEditor(page, { mock: true, data });

    // 验证 mock 输入框显示正确的值
    const field1 = page.locator('input[value="field_1"]');
    const row = page
      .locator('.schema-content div.ant-row')
      .filter({ has: field1 });
    const mockInput = row.locator('.certain-category-search input');
    await expect(mockInput).toBeVisible();
    await expect(mockInput).toHaveValue('@string');
  });
});
