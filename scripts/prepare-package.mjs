import { copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageDir = resolve(rootDir, 'packages', 'json-schema-editor-visual');

const files = ['README.md', 'LICENSE'];

for (const file of files) {
  const src = resolve(rootDir, file);
  const dest = resolve(packageDir, file);
  copyFileSync(src, dest);
  console.log(`Copied ${file} -> packages/json-schema-editor-visual/${file}`);
}
