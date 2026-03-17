import dbConnect from "@/lib/mongodb";
import Celebrity from "@/model/celebrity";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const trendingCelebrities = await Celebrity.find({ 'heroSection.growthPercentage': { $exists: true } })
      .sort({ 'heroSection.growthPercentage': -1 })
      .limit(10);

    const formattedData = trendingCelebrities.map(c => ({
      title: c.heroSection?.name || 'Unknown Celebrity',
      description: c.heroSection?.occupation || 'No description available.',
      image: c.heroSection?.image || '/placeholder.jpg',
      category: 'Celebrity',
      rating: (c.heroSection?.growthPercentage / 10).toFixed(1),
      views: `${(c.heroSection?.growthPercentage * 1000).toLocaleString()} views`,
      readTime: '5 min read',
      slug: c.heroSection?.slug,
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}
