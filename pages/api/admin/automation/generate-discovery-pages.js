import dbConnect from "../../../../lib/mongodb";
import { generateAllDiscoveryPages, generateMoviesLikePages } from "../../../../lib/discovery-generator";

export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET || 'filmyfire_automation_secret_2026';
  
  // Allow both POST and GET for flexibility
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify cron secret for automation
  const authHeader = req.headers['x-cron-secret'];
  if (authHeader !== cronSecret && req.method === 'POST') {
    // For manual testing, allow without secret
    console.log('⚠️ Running without cron secret verification');
  }

  try {
    await dbConnect();

    const { type = 'all' } = req.query;

    console.log('🚀 Starting Discovery Page Generation...\n');

    let results = {};

    if (type === 'all' || type === 'templates') {
      // Generate all template-based discovery pages
      console.log('📋 Generating template-based discovery pages...');
      const templateResults = await generateAllDiscoveryPages();
      results.templates = templateResults;
    }

    if (type === 'all' || type === 'similar') {
      // Generate "Movies Like X" pages
      console.log('\n🎬 Generating "Movies Like X" pages...');
      const similarResults = await generateMoviesLikePages(30);
      results.moviesLike = similarResults;
    }

    const totalSuccess = (results.templates?.successCount || 0) + (results.moviesLike?.successCount || 0);
    const totalFailed = (results.templates?.errorCount || 0);

    console.log('\n✅ Discovery page generation complete!');
    console.log(`   Total pages generated: ${totalSuccess}`);

    return res.status(200).json({
      success: true,
      message: `Generated ${totalSuccess} discovery pages`,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Discovery Page Generation Error:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
}
