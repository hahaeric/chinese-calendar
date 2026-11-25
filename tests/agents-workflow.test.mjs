import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const agents = readFileSync(join(root, 'AGENTS.md'), 'utf8');
const rule = readFileSync(join(root, '.cursor/rules/agents-workflow.mdc'), 'utf8');

describe('AGENTS workflow rules', () => {
  it('requires discuss-then-build approval gate', () => {
    assert.match(agents, /同意.*ty|ty.*同意/i);
    assert.match(agents, /不修改程序文件/);
  });

  it('requires commit, tests, and GitHub push after changes', () => {
    assert.match(agents, /Git commit/);
    assert.match(agents, /测试/);
    assert.match(agents, /推送到 GitHub/);
    assert.match(agents, /远程名 `github`/);
    assert.match(agents, /不要默认推送 Gitee/);
  });

  it('keeps Cursor always-applied rule in sync with AGENTS.md bullets', () => {
    assert.match(rule, /alwaysApply:\s*true/);
    assert.match(rule, /推送到 GitHub/);
    assert.match(rule, /不要默认推送 Gitee/);
    assert.match(rule, /Git commit/);
  });
});
