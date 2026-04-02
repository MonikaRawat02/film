// Test pSEO routes
const testMovie = 'border-2';
const pageTypes = [
  'overview',
  'ending-explained',
  'budget-box-office',
  'cast-analysis',
  'ott-release',
  'review-analysis',
  'hit-or-flop'
];

async function testRoutes() {
  console.log(`\n🎬 Testing pSEO routes for: ${testMovie}\n`);
  
  const baseUrl = 'http://localhost:3000';
  
  // Test API endpoint
  console.log('📡 Testing API endpoints...\n');
  
  for (const type of pageTypes) {
    try {
      const res = await fetch(`${baseUrl}/api/movie/get-movie-data?slug=${testMovie}&type=${type}`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        console.log(`✅ ${type.padEnd(20)} - Status: ${res.status} - Pages: ${data.data.contentSections?.length || 0} sections`);
      } else {
        console.log(`❌ ${type.padEnd(20)} - Status: ${res.status} - Error: ${data.message}`);
      }
    } catch (error) {
      console.log(`❌ ${type.padEnd(20)} - Error: ${error.message}`);
    }
  }
  
  console.log('\n🌐 Frontend routes to test manually:\n');
  pageTypes.forEach(type => {
    const url = type === 'overview' 
      ? `${baseUrl}/movie/${testMovie}`
      : `${baseUrl}/movie/${testMovie}/${type}`;
    console.log(`   ${url}`);
  });
  
  console.log('\n✅ Testing complete!\n');
}

testRoutes().catch(console.error);
