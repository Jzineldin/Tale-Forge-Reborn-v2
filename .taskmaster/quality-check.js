#!/usr/bin/env node

/**
 * Quality Check Script
 * Runs comprehensive quality checks using MCP integrations
 */

import { execSync } from 'child_process';

console.log('🔍 Running comprehensive quality checks...\n');

// 1. TypeScript checking
console.log('1️⃣ TypeScript checking...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript check passed');
} catch (error) {
  console.error('❌ TypeScript errors found');
}

// 2. ESLint checking
console.log('\n2️⃣ ESLint checking...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ ESLint check passed');
} catch (error) {
  console.error('❌ ESLint errors found');
}

// 3. Test suite
console.log('\n3️⃣ Running tests...');
try {
  execSync('npm test', { stdio: 'inherit' });
  console.log('✅ Tests passed');
} catch (error) {
  console.error('❌ Tests failed');
}

console.log('\n🎯 Quality check completed');
