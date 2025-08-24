#!/usr/bin/env node

// Test the age format extraction logic

const testCases = [
  { ageGroup: "3-4 years (Toddlers)", targetAge: 3, expected: "3-4" },
  { ageGroup: "7-12 years (Elementary)", targetAge: 7, expected: "7-12" },
  { ageGroup: "5-6 years (Preschool)", targetAge: 5, expected: "5-6" },
  { ageGroup: "", targetAge: 3, expected: "3-4" },
  { ageGroup: "", targetAge: 8, expected: "7-9" },
  { ageGroup: "", targetAge: 12, expected: "10-12" },
];

const getCleanAgeFormat = (storyData) => {
  // If ageGroup contains descriptive text, extract just the age range
  if (storyData.ageGroup) {
    const match = storyData.ageGroup.match(/(\d+(-\d+)?)/);
    if (match) {
      return match[1]; // Returns "3-4" from "3-4 years (Toddlers)"
    }
  }
  
  // Fallback to targetAge logic
  if (storyData.targetAge <= 4) return "3-4";
  if (storyData.targetAge <= 6) return "4-6"; 
  if (storyData.targetAge <= 9) return "7-9";
  return "10-12";
};

console.log('🧪 Testing Age Format Extraction Logic\n');

testCases.forEach((testCase, index) => {
  const result = getCleanAgeFormat(testCase);
  const status = result === testCase.expected ? '✅' : '❌';
  
  console.log(`Test ${index + 1}: ${status}`);
  console.log(`  Input: ageGroup="${testCase.ageGroup}", targetAge=${testCase.targetAge}`);
  console.log(`  Expected: "${testCase.expected}"`);
  console.log(`  Got: "${result}"`);
  console.log();
});

console.log('✅ Age extraction logic test completed!');