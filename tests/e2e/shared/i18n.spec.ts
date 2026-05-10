import { test, expect } from '@playwright/test';
import { addTypedNode, gotoEditor } from './helpers';

test.describe('国际化 (i18n)', () => {
  test('zh_CN 语言下显示中文导入按钮', async ({ page }) => {
    await gotoEditor(page, { locale: 'zh_CN' });
    await expect(page.getByRole('button', { name: '导入 json' })).toBeVisible();
  });

  test('zh_CN 语言下显示中文高级设置', async ({ page }) => {
    await gotoEditor(page, { locale: 'zh_CN' });
    await page.getByRole('img', { name: 'setting' }).click();
    await expect(page.getByRole('dialog', { name: '高级设置' })).toBeVisible();
  });

  test('zh_CN 语言下显示中文标题和描述占位符', async ({ page }) => {
    await gotoEditor(page, { locale: 'zh_CN' });
    const addedRow = await addTypedNode(page, 'string');
    await expect(addedRow.getByPlaceholder('标题')).toBeVisible();
    await expect(addedRow.getByPlaceholder('备注')).toBeVisible();
  });

  test('zh_CN 语言下显示中文节点操作提示', async ({ page }) => {
    await gotoEditor(page, { locale: 'zh_CN' });
    const addedRow = await addTypedNode(page, 'object');
    await addedRow.getByRole('img', { name: 'plus' }).hover();
    await expect(
      page.getByRole('menuitem', { name: '兄弟节点' }),
    ).toBeVisible();
    await expect(page.getByRole('menuitem', { name: '子节点' })).toBeVisible();
  });

  test('zh_CN 语言下高级设置模态框显示中文', async ({ page }) => {
    await gotoEditor(page, { locale: 'zh_CN' });
    const addedRow = await addTypedNode(page, 'string');
    await addedRow.getByTestId('SchemaItem_FieldInput_advSet').click();
    const advModal = page.getByRole('dialog', { name: '高级设置' });
    await expect(advModal).toBeVisible();
    await expect(advModal.getByText('基础设置')).toBeVisible();
    await expect(advModal.getByPlaceholder('默认值')).toBeVisible();
  });
});
