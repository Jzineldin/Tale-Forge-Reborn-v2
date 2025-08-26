import fs from 'fs';

const pages = [
  'src/pages/public/FeaturesPage.tsx',
  'src/pages/public/HelpPage.tsx',
  'src/pages/public/PricingPage.tsx',
  'src/pages/auth/SignInPage.tsx',
  'src/pages/auth/SignUpPage.tsx'
];

function fixPage(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix H1 headers
    content = content.replace(
      /text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold/g,
      'h1-page gradient-text'
    );
    
    // Fix smaller H1 variants
    content = content.replace(
      /text-3xl md:text-4xl lg:text-5xl font-bold/g,
      'h1-page'
    );
    
    // Fix H2 headers
    content = content.replace(
      /text-3xl md:text-4xl font-bold/g,
      'h2-section'
    );
    
    // Fix H3 headers
    content = content.replace(
      /<h3 className="text-xl font-semibold/g,
      '<h3 className="h3-card'
    );
    
    // Fix containers
    content = content.replace(
      /max-w-7xl mx-auto/g,
      'container-default'
    );
    
    content = content.replace(
      /max-w-6xl mx-auto/g,
      'container-default'
    );
    
    // Fix section padding
    content = content.replace(
      /px-4 sm:px-6 lg:px-8 py-16/g,
      'section-spacing'
    );
    
    // Add semantic sections
    content = content.replace(
      /<div className="relative z-10 flex-1 flex items-center justify-center section-spacing">/g,
      '<section className="section-hero relative z-10 flex-1 flex items-center justify-center">'
    );
    
    // Fix buttons
    content = content.replace(
      /px-8 py-4/g,
      'btn btn-lg'
    );
    
    content = content.replace(
      /px-6 py-3/g,
      'btn btn-md'
    );
    
    content = content.replace(
      /px-4 py-2/g,
      'btn btn-sm'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error: ${filePath} - ${error.message}`);
    return false;
  }
}

console.log('🔧 Fixing UI consistency...\n');

pages.forEach(page => {
  fixPage(page);
});

console.log('\n✨ Done!');