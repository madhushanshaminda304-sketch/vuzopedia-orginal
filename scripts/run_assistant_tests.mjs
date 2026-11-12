// Node 22.13+ is needed for the SQLite-backed usage reservation regression.
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const temp = await mkdtemp(path.join(tmpdir(), 'assistant-evaluation-'));
try {
  const entry = path.join(temp, 'evaluation.mjs');
  await build({ entryPoints: ['scripts/evaluate_assistant_quality.ts'], bundle: true, platform: 'node', format: 'esm', outfile: entry });
  const evaluation = spawnSync(process.execPath, [entry], { stdio: 'inherit' });
  const regressions = spawnSync(process.execPath, ['--test', 'scripts/assistant_regressions.test.mjs'], { stdio: 'inherit' });
  process.exitCode = evaluation.status === 0 && regressions.status === 0 ? 0 : 1;
} finally { await rm(temp, { recursive: true, force: true }); }
