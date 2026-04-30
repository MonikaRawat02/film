import dbConnect from "../../../lib/mongodb";
import OTTPlatform from "../../../model/OTTPlatform";
import { cacheManager } from "../../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const cacheKey = `ott:platforms:list`;
    
    const result = await cacheManager(cacheKey, 1800, async () => {
      await dbConnect();
      const platforms = await OTTPlatform.find({}).sort({ rank: 1 });
      return platforms;
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("OTT API Error:", error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
}
