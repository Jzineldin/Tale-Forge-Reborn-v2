#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables manually
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    lines.forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }
}

loadEnvFile();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFlexibleAges() {
  console.log('🎯 Testing Flexible Age System\n');
  
  const testAges = [
    '3-4',    // Original issue
    '7-12',   // Template issue from console 
    '5',      // Single age
    '12+',    // Plus format
    '4-6',    // Standard range
    '10-15'   // Wide range
  ];
  
  const results = [];
  
  for (const age of testAges) {
    try {
      const testStory = {
        title: `Test Story ${age}`,
        description: `Test story for age ${age}`,
        genre: 'adventure',
        target_age: age,
        story_mode: 'interactive',
        is_completed: false,
        is_public: false,
        language: 'en',
        content_rating: 'G',
        generation_settings: {
          theme: 'friendship',
          words_per_chapter: 50
        }
      };
      
      const { data: story, error } = await supabase
        .from('stories')
        .insert(testStory)
        .select()
        .single();
      
      if (error) {
        results.push({ age, status: '❌ FAILED', error: error.message });
      } else {
        results.push({ age, status: '✅ SUCCESS', id: story.id });
        // Clean up
        await supabase.from('stories').delete().eq('id', story.id);
      }
      
    } catch (error) {
      results.push({ age, status: '❌ EXCEPTION', error: error.message });
    }
  }
  
  // Display results
  console.log('📊 FLEXIBLE AGE TEST RESULTS:');
  console.log('===============================');
  results.forEach(result => {
    console.log(`${result.status} Age "${result.age}": ${result.error || 'Database accepts this format'}`);
  });
  
  const successCount = results.filter(r => r.status.includes('SUCCESS')).length;
  const totalCount = results.length;
  
  console.log(`\n🎉 Success Rate: ${successCount}/${totalCount} (${((successCount/totalCount)*100).toFixed(1)}%)`);
  
  if (successCount === totalCount) {
    console.log('\n✅ ALL AGE FORMATS NOW SUPPORTED!');
    console.log('The system is now flexible and can handle:');
    console.log('• Any numeric age range (3-4, 7-12, 5-15)');
    console.log('• Single ages (3, 7, 12)'); 
    console.log('• Plus formats (12+)');
    console.log('• Template-defined ages');
    console.log('\nThe AI will automatically understand the complexity level for any format.');
  } else {
    console.log('\n⚠️ Some age formats still need work.');
  }
}

testFlexibleAges();