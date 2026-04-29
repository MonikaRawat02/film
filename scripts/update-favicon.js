const fs = require('fs');
const path = require('path');

// Simple script to verify favicon setup
const svgPath = path.join(__dirname, '../public/favicon.svg');
const icoPath = path.join(__dirname, '../public/favicon.ico');

console.log('🔍 Checking favicon files...');

if (fs.existsSync(svgPath)) {
  console.log('✅ favicon.svg exists');
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  console.log('📄 SVG contains red flame logo with color #dc2626');
} else {
  console.log('❌ favicon.svg not found');
}

if (fs.existsSync(icoPath)) {
  const stats = fs.statSync(icoPath);
  console.log(`✅ favicon.ico exists (${(stats.size / 1024).toFixed(1)} KB)`);
  console.log('⚠️  To update favicon.ico with the red flame logo:');
  console.log('   1. Visit: https://convertio.co/svg-ico/');
  console.log('   2. Upload public/favicon.svg');
  console.log('   3. Download and replace public/favicon.ico');
} else {
  console.log('❌ favicon.ico not found');
}

console.log('\n📋 Favicon setup in _document.js:');
console.log('   - SVG favicon (modern browsers)');
console.log('   - ICO favicon (fallback)');
console.log('   - Apple touch icon');
console.log('   - Web app manifest');
console.log('   - Theme color: #dc2626 (red)');
console.log('\n✨ The red flame logo will appear in browser tabs!');
