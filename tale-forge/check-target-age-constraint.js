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

async function checkTargetAgeConstraint() {
  console.log('🔍 Investigating target_age constraint\n');

  // Check what values are currently in the database
  console.log('1️⃣ Current target_age values in database:');
  try {
    const { data: stories, error } = await supabase
      .from('stories')
      .select('target_age')
      .limit(10);
    
    if (error) {
      console.error('❌ Error fetching stories:', error);
      return;
    }
    
    const uniqueAges = [...new Set(stories.map(s => s.target_age))];
    uniqueAges.forEach(age => {
      console.log(`   ✅ "${age}"`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }

  // Test different age formats to see what works
  console.log('\n2️⃣ Testing different target_age formats:');
  
  const testAges = [
    '3-4',
    '3',
    '4',
    '5-6', 
    '7-9',
    '7-8',
    '5-10',
    '4-7',
    '3-5'
  ];
  
  for (const testAge of testAges) {
    try {
      const testStory = {
        title: `Test Story ${testAge}`,
        description: `Test story for age ${testAge}`,
        genre: 'adventure',
        target_age: testAge,
        story_mode: 'interactive',
        is_completed: false,
        is_public: false,
        language: 'en',
        content_rating: 'G',
        generation_settings: { test: true }
      };
      
      const { data, error } = await supabase
        .from('stories')
        .insert(testStory)
        .select()
        .single();
      
      if (error) {
        console.log(`   ❌ "${testAge}": ${error.message}`);
      } else {
        console.log(`   ✅ "${testAge}": ACCEPTED`);
        // Clean up successful insert
        await supabase.from('stories').delete().eq('id', data.id);
      }
      
    } catch (error) {
      console.log(`   ❌ "${testAge}": ${error.message}`);
    }
  }
  
  console.log('\n3️⃣ Analysis:');
  console.log('The constraint is likely enforcing specific age range formats.');
  console.log('Common formats might be: "4-7", "5-10", "7-9", etc.');
  console.log('Very young ages like "3-4" might not be in the allowed list.');
}

checkTargetAgeConstraint();