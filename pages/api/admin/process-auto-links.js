import { processAutoLinking, processContentSections, getAutoLinkCacheStats } from "../../../lib/auto-linker";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { content, sections, options = {} } = req.body;

    // Process single content string
    if (content) {
      const processedContent = await processAutoLinking(content, options);
      return res.status(200).json({
        success: true,
        data: processedContent,
        cacheStats: getAutoLinkCacheStats()
      });
    }

    // Process array of sections
    if (sections && Array.isArray(sections)) {
      const processedSections = await processContentSections(sections, options);
      return res.status(200).json({
        success: true,
        data: processedSections,
        cacheStats: getAutoLinkCacheStats()
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Either "content" (string) or "sections" (array) is required'
    });

  } catch (error) {
    console.error('Auto-Link API Error:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
}
