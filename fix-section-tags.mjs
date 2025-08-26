import fs from 'fs';

const files = [
  'src/pages/public/HomePage.tsx',
  'src/pages/public/FeaturesPage.tsx', 
  'src/pages/public/HelpPage.tsx',
  'src/pages/public/SignInPage.tsx',
  'src/pages/public/SignUpPage.tsx'
];

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix section tag mismatches
    // When we have <section className="section-hero...
    // The corresponding closing should be </section> not </div>
    
    // Count opening sections
    const sectionMatches = content.match(/<section\s+className="section-hero[^>]*>/g) || [];
    
    if (sectionMatches.length > 0) {
      // Replace the first </div> after section-hero with </section>
      content = content.replace(
        /(<section className="section-hero[^>]*>[\s\S]*?)(\s*)(<\/div>\s*{\s*\/\*\s*Featured Stories Section|\s*<\/div>\s*{\s*\/\*\s*Why Choose Section|\s*<\/div>\s*{\s*\/\*\s*FAQ Section|\s*<\/div>\s*$)/,
        '$1$2</section>$2$3'
      );
    }
    
    // Fix other section tags
    const otherSections = content.match(/<section\s+className="section-[^"]*"/g) || [];
    if (otherSections.length > 0) {
      // Count sections and divs to ensure proper closure
      let lines = content.split('\n');
      let sectionCount = 0;
      let divCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('<section className="section-')) {
          sectionCount++;
        }
        if (lines[i].trim() === '</div>' && sectionCount > 0) {
          // Check if this is likely the closing for the section
          let nextLines = lines.slice(i+1, i+5).join('\n');
          if (nextLines.includes('/* Featured') || nextLines.includes('/* Why Choose') || 
              nextLines.includes('/* FAQ') || i === lines.length - 3) {
            lines[i] = lines[i].replace('</div>', '</section>');
            sectionCount--;
          }
        }
      }
      
      content = lines.join('\n');
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
  } catch (err) {
    console.error(`❌ Error: ${file} - ${err.message}`);
  }
});

console.log('\n✨ Section tags fixed!');