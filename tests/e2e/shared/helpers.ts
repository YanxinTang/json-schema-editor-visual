import { type Page, type Locator } from '@playwright/test';

type NodeType =
  | 'string'
  | 'number'
  | 'array'
  | 'object'
  | 'boolean'
  | 'integer';

interface EditorParams {
  locale?: string;
  mock?: boolean;
  format?: boolean;
  data?: string;
}

export async function addTypedNode(
  page: Page,
  type: NodeType,
): Promise<Locator> {
  await page.getByRole('img', { name: 'plus' }).click();
  const addedRow = page.getByTestId('SchemaItem').last();
  await addedRow.locator('div.ant-select.type-select-style').click();
  await page
    .locator('div.ant-select-dropdown div.ant-select-item')
    .filter({ hasText: type })
    .click();
  return addedRow;
}

export async function getSchemaOutput(page: Page): Promise<string> {
  return page.getByTestId('schema-output').innerText();
}

export async function gotoEditor(
  page: Page,
  params?: EditorParams,
): Promise<void> {
  const searchParams = new URLSearchParams();
  if (params?.locale) searchParams.set('locale', params.locale);
  if (params?.mock) searchParams.set('mock', '1');
  if (params?.format) searchParams.set('format', '1');
  if (params?.data) searchParams.set('data', params.data);
  const qs = searchParams.toString();
  await page.goto(qs ? `/?${qs}` : '/');
}
