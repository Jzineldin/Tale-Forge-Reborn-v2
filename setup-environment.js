#!/usr/bin/env node

/**
 * Tale Forge Environment Setup Helper
 * This script helps you configure the missing environment variables needed for edge functions
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

const REQUIRED_ENV_VARS = [
  {
    key: 'OPENAI_API_KEY',
    description: 'OpenAI API key for story generation',
    required: true,
    example: 'sk-proj-...',
    functions: ['generate-story-segment', 'generate-story-ending']
  },
  {
    key: 'OVH_AI_ENDPOINTS_ACCESS_TOKEN',
    description: 'OVH AI endpoints access token (fallback)',
    required: false,
    example: 'ovh-ai-token...',
    functions: ['generate-story-segment', 'generate-story-ending']
  },
  {
    key: 'NVIDIA_RIVA_API_KEY',
    description: 'NVIDIA RIVA API key for TTS',
    required: false,
    example: 'nvapi-...',
    functions: ['generate-tts-audio']
  },
  {
    key: 'NVIDIA_RIVA_ENDPOINT',
    description: 'NVIDIA RIVA API endpoint',
    required: false,
    example: 'https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions',
    functions: ['generate-tts-audio'],
    default: 'https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions'
  },
  {
    key: 'REPLICATE_API_TOKEN',
    description: 'Replicate API token for image generation',
    required: false,
    example: 'r8_...',
    functions: ['regenerate-image']
  },
  {
    key: 'STABILITY_API_KEY',
    description: 'Stability AI API key for image generation',
    required: false,
    example: 'sk-...',
    functions: ['regenerate-image']
  }
];

async function main() {
  console.log(`${colors.bold}${colors.cyan}🚀 Tale Forge Environment Setup${colors.reset}\n`);
  
  // Check if .env exists
  if (!existsSync('.env')) {
    console.log(`${colors.red}❌ .env file not found!${colors.reset}`);
    console.log(`${colors.yellow}Please copy .env.example to .env first${colors.reset}\n`);
    process.exit(1);
  }
  
  // Read current .env
  let envContent = readFileSync('.env', 'utf8');
  const existingVars = new Set();
  
  envContent.split('\n').forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key] = line.split('=');
      existingVars.add(key.trim());
    }
  });
  
  console.log(`${colors.bold}Current .env file status:${colors.reset}`);
  console.log(`📁 File exists: ${colors.green}✓${colors.reset}`);
  console.log(`📝 Existing variables: ${existingVars.size}\n`);
  
  let newVars = '';
  let hasChanges = false;
  
  console.log(`${colors.bold}${colors.magenta}🔧 Missing Environment Variables Setup${colors.reset}\n`);
  
  for (const envVar of REQUIRED_ENV_VARS) {
    const exists = existingVars.has(envVar.key);
    const status = exists ? `${colors.green}✓ EXISTS${colors.reset}` : `${colors.yellow}⚠ MISSING${colors.reset}`;
    
    console.log(`${colors.bold}${envVar.key}${colors.reset} - ${status}`);
    console.log(`  ${colors.blue}Description:${colors.reset} ${envVar.description}`);
    console.log(`  ${colors.blue}Used by:${colors.reset} ${envVar.functions.join(', ')}`);
    console.log(`  ${colors.blue}Required:${colors.reset} ${envVar.required ? colors.red + 'YES' + colors.reset : colors.yellow + 'Optional' + colors.reset}`);
    
    if (!exists) {
      const shouldAdd = await askQuestion(`  ${colors.cyan}Add ${envVar.key}? (y/N): ${colors.reset}`);
      
      if (shouldAdd.toLowerCase() === 'y') {
        let value = '';
        
        if (envVar.default) {
          const useDefault = await askQuestion(`  ${colors.cyan}Use default value '${envVar.default}'? (Y/n): ${colors.reset}`);
          if (useDefault.toLowerCase() !== 'n') {
            value = envVar.default;
          }
        }
        
        if (!value) {
          value = await askQuestion(`  ${colors.cyan}Enter ${envVar.key} (${envVar.example}): ${colors.reset}`);
        }
        
        if (value.trim()) {
          newVars += `\n# ${envVar.description}\n${envVar.key}=${value.trim()}\n`;
          hasChanges = true;
          console.log(`  ${colors.green}✓ Added${colors.reset}`);
        } else {
          console.log(`  ${colors.yellow}⚠ Skipped (empty value)${colors.reset}`);
        }
      } else {
        console.log(`  ${colors.yellow}⚠ Skipped${colors.reset}`);
      }
    }
    console.log('');
  }
  
  // Add new variables to .env
  if (hasChanges) {
    envContent += `\n# === AI Service API Keys (Added by setup script) ===${newVars}`;
    writeFileSync('.env', envContent);
    console.log(`${colors.bold}${colors.green}✅ Environment variables updated!${colors.reset}\n`);
  } else {
    console.log(`${colors.bold}${colors.blue}ℹ No changes made to .env file${colors.reset}\n`);
  }
  
  // Generate test command
  console.log(`${colors.bold}${colors.magenta}🧪 Next Steps:${colors.reset}`);
  console.log(`1. Restart your Supabase functions: ${colors.cyan}supabase functions serve${colors.reset}`);
  console.log(`2. Run the test script: ${colors.cyan}node test-edge-functions.js${colors.reset}`);
  console.log(`3. Check which functions are now working\n`);
  
  // Show which functions should now work
  const configuredFunctions = REQUIRED_ENV_VARS
    .filter(v => existingVars.has(v.key) || newVars.includes(v.key))
    .flatMap(v => v.functions);
  
  if (configuredFunctions.length > 0) {
    console.log(`${colors.bold}${colors.green}🎯 Functions that should now work:${colors.reset}`);
    [...new Set(configuredFunctions)].forEach(func => {
      console.log(`  • ${func}`);
    });
    console.log('');
  }
  
  rl.close();
}

main().catch(console.error);