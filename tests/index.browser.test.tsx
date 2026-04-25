import { afterEach, describe, expect, rs, test } from '@rstest/core';
import schemaEditor from '../src';
import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';

describe('JsonSchemaReactEditor', () => {
  test('初始状态渲染', async () => {
    const SchemaEditor = schemaEditor();
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
    await expect.element(page.locator('input[value="title"]')).toBeVisible();

    // description 输入框
    await expect.element(page.getByPlaceholder('description')).toBeVisible();

    // 根节点展开图标
    await expect
      .element(page.getByRole('img', { name: 'caret-down' }))
      .toBeVisible();

    // 设置按钮
    await expect
      .element(page.getByRole('img', { name: 'setting' }))
      .toBeVisible();

    // 新增按钮
    await expect.element(page.getByRole('img', { name: 'plus' })).toBeVisible();
  });

  test('导入按钮可被点击，点击后打开导入模态框', async () => {
    const SchemaEditor = schemaEditor();
    await render(<SchemaEditor />);

    await page.getByRole('button', { name: 'Import JSON' }).click();

    await expect
      .element(page.getByRole('dialog', { name: 'Import JSON' }))
      .toBeVisible();
  });

  test('标题编辑按钮可被点击，点击后打开标题模态框', async () => {
    const SchemaEditor = schemaEditor();
    await render(<SchemaEditor />);

    const titleInput = page.locator('input[value="title"]');
    const wrapper = titleInput.locator(
      'xpath=ancestor::*[contains(@class, "ant-input-wrapper")]',
    );

    await wrapper.getByRole('img', { name: /edit/i }).click();

    await expect
      .element(page.getByRole('dialog', { name: 'Title' }))
      .toBeVisible();
  });

  test('描述编辑按钮可被点击，点击后打开描述模态框', async () => {
    const SchemaEditor = schemaEditor();
    await render(<SchemaEditor />);

    const descInput = page.getByPlaceholder('description');
    const wrapper = descInput.locator(
      'xpath=ancestor::*[contains(@class, "ant-input-wrapper")]',
    );

    await wrapper.getByRole('img', { name: /edit/i }).click();

    await expect
      .element(page.getByRole('dialog', { name: 'Description' }))
      .toBeVisible();
  });

  test('高级设置按钮可被点击，点击后打开高级设置模态框', async () => {
    const SchemaEditor = schemaEditor();
    await render(<SchemaEditor />);

    await page.getByRole('img', { name: 'setting' }).click();

    await expect
      .element(page.getByRole('dialog', { name: 'Advanced Settings' }))
      .toBeVisible();
  });

  test('添加节点按钮可被点击，点击后新增子节点', async () => {
    const SchemaEditor = schemaEditor();
    await render(<SchemaEditor />);

    await page.getByRole('img', { name: 'plus' }).click();

    const newField = page.locator('input[value="field_1"]');
    await expect.element(newField).toBeVisible();

    const row = page.locator('div.ant-row').filter({ has: newField });

    await expect.element(row.getByText('string')).toBeVisible();
  });
});
