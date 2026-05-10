import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtures = ['react18-antd5', 'react19-antd6'];

function run(cmd, cwd = rootDir) {
  console.log(`\x1b[36m> ${cmd}\x1b[0m`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

// 1. Build json-schema-editor-visual with TEST=1
console.log('\n==> Building json-schema-editor-visual (TEST=1) ...');
run('pnpm --filter @tyx1703/json-schema-editor-visual build:test');

// 2. Reinstall dependencies in fixture projects
console.log('\n==> Installing fixture dependencies ...');
for (const fixture of fixtures) {
  console.log(`  -> ${fixture}`);
  run('pnpm install --ignore-workspace', resolve(rootDir, 'fixtures', fixture));
}

// 3. Run e2e tests
console.log('\n==> Running e2e tests ...');
const args = process.argv.slice(2);
const isUi = args[0] === '--ui';
const playwrightArgs = isUi ? args.slice(1) : args;
const flag = isUi ? '--ui ' : '';
run(`pnpm exec playwright test ${flag}${playwrightArgs.join(' ')}`.trim());
