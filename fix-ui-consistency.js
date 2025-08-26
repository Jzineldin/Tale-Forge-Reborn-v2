import fs from 'fs';
import path from 'path';

const pagesToFix = [
  'src/pages/public/FeaturesPage.tsx',
  'src/pages/public/HelpPage.tsx',
  'src/pages/public/PricingPage.tsx',
  'src/pages/public/DiscoverPage.tsx',
  'src/pages/public/TestimonialsPage.tsx',
  'src/pages/auth/SignInPage.tsx',
  'src/pages/auth/SignUpPage.tsx',
  'src/pages/public/PrivacyPage.tsx',
  'src/pages/public/TermsPage.tsx'
];

const replacements = [
  // Fix H1 headers that use responsive classes
  {
    from: /className="([^"]*)?text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl([^"]*)"/g,
    to: 'className="h1-page gradient-text$1$2"'
  },
  // Fix H1 headers with text-3xl to text-5xl variations
  {
    from: /className="([^"]*)?text-3xl md:text-4xl lg:text-5xl([^"]*)"/g,
    to: 'className="h1-page$1$2"'
  },
  // Fix H2 headers
  {
    from: /className="([^"]*)?text-2xl md:text-3xl lg:text-4xl([^"]*)"/g,
    to: 'className="h2-section$1$2"'
  },
  // Fix H3 headers
  {
    from: /<h3 className="text-xl font-semibold([^"]*)"/g,
    to: '<h3 className="h3-card$1"'
  },
  // Fix containers
  {
    from: /className="text-center max-w-7xl mx-auto"/g,
    to: 'className="container-default text-center"'
  },
  {
    from: /className="max-w-6xl mx-auto"/g,
    to: 'className="container-default"'
  },
  // Fix section wrappers - Hero
  {
    from: /{\\/\* Hero Section \*\\/}\s*<div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">/g,
    to: '{/* Hero Section */}\n      <section className="section-hero relative z-10 flex-1 flex items-center justify-center">'
  },
  // Fix other sections
  {
    from: /<div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16">/g,
    to: '<section className="section-content relative z-10">'
  },
  // Close sections properly
  {
    from: /(\s*)<\/div>\s*<\/div>\s*$(?![\s\S]*<\/div>)/gm,
    to: '$1</div>\n$1</section>'
  },
  // Fix buttons with inconsistent padding
  {
    from: /className="([^"]*)?px-8 py-4([^"]*)"/g,
    to: 'className="btn btn-lg$1$2"'
  },
  {
    from: /className="([^"]*)?px-6 py-3([^"]*)"/g,
    to: 'className="btn btn-md$1$2"'
  },
  {
    from: /className="([^"]*)?px-4 py-2([^"]*)"/g,
    to: 'className="btn btn-sm$1$2"'
  }
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    replacements.forEach(({ from, to }) => {
      const newContent = content.replace(from, to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    // Also ensure semantic section tags
    if (!content.includes('<section')) {
      // Wrap main content areas in section tags
      content = content.replace(
        /(<div className="min-h-screen[^>]*>[\s\S]*?)(<div className="relative z-10)/g,
        '$1<section className="section">$2'
      );
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing UI consistency issues...\n');

let fixedCount = 0;
pagesToFix.forEach(page => {
  if (fixFile(page)) {
    fixedCount++;
  }
});

console.log(`\n✨ Fixed ${fixedCount} files!`);
console.log('\nNext steps:');
console.log('1. Review the changes in each file');
console.log('2. Test the application to ensure everything works');
console.log('3. Run the UI analysis again to verify consistency');