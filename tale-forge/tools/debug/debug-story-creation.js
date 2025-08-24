#!/usr/bin/env node

/**
 * Debug what the frontend is actually sending
 */

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

// Simulate exactly what the frontend would send for age 3
const testStoryData = {
  title: "Kevin's Adventure",
  description: "A wonderful adventure awaits",
  genre: "bedtime",
  age_group: "3-4",  // What we expect
  target_age: "3-4", // What we expect
  theme: "friendship",
  setting: "underwater world",
  characters: [
    {
      name: "Kevin",
      role: "Magical Helper",
      traits: ["Brave", "Kind"]
    }
  ],
  conflict: "making new friends",
  quest: "discover the truth",
  moral_lesson: "never give up on your dreams",
  additional_details: "its in the middle of the day",
  setting_description: "underwater world",
  time_period: "timeless",
  atmosphere: "magical",
  words_per_chapter: 30,
  child_name: "Kevin"
};

async function debugStoryCreation() {
  console.log('🔍 Debug: What data would be sent to mock service');
  console.log('Story Data:', JSON.stringify(testStoryData, null, 2));
  
  // Test the exact mock story creation that would happen
  console.log('\n🎭 Testing mock story database insert...');
  
  const mockStoryForDB = {
    title: testStoryData.title,
    description: testStoryData.description,
    user_id: 'test-user-id',
    genre: testStoryData.genre,
    target_age: String(testStoryData.target_age || testStoryData.ageGroup || "7-9"),
    story_mode: 'interactive',
    is_completed: false,
    is_public: false,
    language: 'en',
    content_rating: 'G',
    ai_model_used: 'Mock-AI-Storyteller-v1',
    generation_settings: {
      theme: testStoryData.theme,
      setting: testStoryData.setting,
      characters: testStoryData.characters,
      conflict: testStoryData.conflict,
      quest: testStoryData.quest,
      moral_lesson: testStoryData.moral_lesson,
      time_period: testStoryData.time_period,
      atmosphere: testStoryData.atmosphere,
      additional_details: testStoryData.additional_details,
      words_per_chapter: testStoryData.words_per_chapter,
      target_age: testStoryData.target_age
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('\nMock Story Object for DB:');
  console.log('target_age:', mockStoryForDB.target_age, '(type:', typeof mockStoryForDB.target_age, ')');
  console.log('Full object:', JSON.stringify(mockStoryForDB, null, 2));
  
  // Test the database insert
  try {
    const { data: story, error } = await supabase
      .from('stories')
      .insert(mockStoryForDB)
      .select()
      .single();
    
    if (error) {
      console.error('\n❌ Database insert failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Test what values are currently allowed
      console.log('\n🔍 Testing current constraint...');
      const testValues = ['3-4', '7-9', '4-6', '10-12', '7-12', '5'];
      
      for (const testValue of testValues) {
        try {
          const testObj = { ...mockStoryForDB, target_age: testValue, title: `Test ${testValue}` };
          const { data: testStory, error: testError } = await supabase
            .from('stories')
            .insert(testObj)
            .select()
            .single();
          
          if (testError) {
            console.log(`❌ "${testValue}": ${testError.message}`);
          } else {
            console.log(`✅ "${testValue}": WORKS`);
            // Clean up
            await supabase.from('stories').delete().eq('id', testStory.id);
          }
        } catch (e) {
          console.log(`❌ "${testValue}": Exception - ${e.message}`);
        }
      }
    } else {
      console.log('\n✅ Database insert successful!');
      console.log('Story created with ID:', story.id);
      
      // Clean up
      await supabase.from('stories').delete().eq('id', story.id);
    }
  } catch (error) {
    console.error('\n💥 Exception during database insert:', error);
  }
}

debugStoryCreation();