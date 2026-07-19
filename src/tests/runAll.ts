/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { spawn } from 'child_process';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

async function findTestFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const list = await readdir(dir);
    for (const file of list) {
      const fullPath = join(dir, file);
      const info = await stat(fullPath);
      if (info.isDirectory()) {
        files.push(...await findTestFiles(fullPath));
      } else if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
  }
  return files;
}

async function runTestFile(file: string): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`\n==================================================`);
    console.log(`RUNNING: ${file}`);
    console.log(`==================================================`);
    // Run vitest specifically on this file to register correctly
    const proc = spawn('npx', ['vitest', 'run', file], { stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`\nSUCCESS: ${file} passed successfully.`);
        resolve(true);
      } else {
        console.error(`\nFAILURE: ${file} failed with exit code ${code}.`);
        resolve(false);
      }
    });
  });
}

async function main() {
  const testsDir = join(process.cwd(), 'src', 'tests');
  const testFiles = await findTestFiles(testsDir);
  console.log(`Found ${testFiles.length} test files to execute.`);
  
  const results: { file: string; success: boolean }[] = [];
  let passedCount = 0;
  
  for (const file of testFiles) {
    const success = await runTestFile(file);
    results.push({ file, success });
    if (success) {
      passedCount++;
    }
  }
  
  console.log(`\n==================================================`);
  console.log(`FIFA SYNAPSE AUTOMATED TESTING REPORT`);
  console.log(`==================================================`);
  for (const res of results) {
    const relativePath = res.file.replace(process.cwd(), '');
    console.log(`[${res.success ? '✓ PASSED' : '✗ FAILED'}] ${relativePath}`);
  }
  console.log(`--------------------------------------------------`);
  console.log(`Overall Summary: ${passedCount} / ${testFiles.length} files passed (${Math.round((passedCount / testFiles.length) * 100)}%)`);
  console.log(`==================================================\n`);
  
  if (passedCount !== testFiles.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unhandled runner exception:', err);
  process.exit(1);
});
