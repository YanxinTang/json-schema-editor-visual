import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import schemaEditor from '../src';

test('The button should have correct background color', async () => {
  const SchemaEditor = schemaEditor();

  const { container } = render(<SchemaEditor />);
  const el = container.querySelector('.json-schema-react-editor');

  expect(el).toBeTruthy();
});
