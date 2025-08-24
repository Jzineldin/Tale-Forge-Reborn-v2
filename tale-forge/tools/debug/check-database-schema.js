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

async function checkSchema() {
  console.log('🔍 Checking Database Schema\n');

  // Check stories table
  console.log('📊 Stories table structure:');
  try {
    const { data: stories, error } = await supabase
      .from('stories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    if (stories && stories.length > 0) {
      const firstStory = stories[0];
      console.log('✅ Available columns in stories table:');
      Object.keys(firstStory).forEach(key => {
        console.log(`   • ${key}: ${typeof firstStory[key]} = ${JSON.stringify(firstStory[key])?.substring(0, 50)}${JSON.stringify(firstStory[key])?.length > 50 ? '...' : ''}`);
      });
    } else {
      // Try to insert a test row to see what columns are expected
      console.log('ℹ️ No stories found. Checking table schema via error...');
      
      const { error: insertError } = await supabase
        .from('stories')
        .insert({});
      
      if (insertError) {
        console.log('Schema info from insert error:', insertError);
      }
    }
  } catch (error) {
    console.error('Schema check error:', error);
  }
  
  // Check story_segments table
  console.log('\n📊 Story segments table structure:');
  try {
    const { data: segments, error } = await supabase
      .from('story_segments')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    if (segments && segments.length > 0) {
      const firstSegment = segments[0];
      console.log('✅ Available columns in story_segments table:');
      Object.keys(firstSegment).forEach(key => {
        console.log(`   • ${key}: ${typeof firstSegment[key]} = ${JSON.stringify(firstSegment[key])?.substring(0, 50)}${JSON.stringify(firstSegment[key])?.length > 50 ? '...' : ''}`);
      });
    } else {
      console.log('ℹ️ No segments found.');
    }
  } catch (error) {
    console.error('Segments schema check error:', error);
  }
}

checkSchema();