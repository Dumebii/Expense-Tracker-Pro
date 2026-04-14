#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';

const projectRoot = process.cwd();

console.log('Removing old monorepo directories from git tracking...');

try {
  // Remove directories from git tracking (but keep them locally deleted)
  execSync('git rm -r --cached artifacts 2>/dev/null || true', { cwd: projectRoot, stdio: 'inherit' });
  execSync('git rm -r --cached lib 2>/dev/null || true', { cwd: projectRoot, stdio: 'inherit' });
  execSync('git rm -r --cached tsconfig.base.json 2>/dev/null || true', { cwd: projectRoot, stdio: 'inherit' });
  
  console.log('✓ Removed artifacts/, lib/, and tsconfig.base.json from git tracking');
  console.log('✓ These directories will be removed from the repository on next commit');
  console.log('\nYour Next.js app in src/ is safe and ready to build!');
  
} catch (error) {
  console.error('Error during cleanup:', error.message);
  process.exit(1);
}
