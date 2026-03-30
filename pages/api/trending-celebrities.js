import dbConnect from "@/lib/mongodb";
import Celebrity from "@/model/celebrity";
import SearchAnalytics from "@/model/searchAnalytics";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    // Fetch top searched queries related to celebrities
    const topSearches = await SearchAnalytics.find({ category: "Celebrities" })
      .sort({ count: -1 })
      .limit(50)
      .lean();

    const topQueries = topSearches.map(s => s.query.toLowerCase());

    // Fetch all celebrities and manually sort by their rank in search analytics
    const allCelebrities = await Celebrity.find({}).lean();

    const trendingCelebrities = allCelebrities.map(c => {
      const name = c.heroSection?.name?.toLowerCase() || "";
      const searchMatch = topSearches.find(s => s.query.toLowerCase() === name || name.includes(s.query.toLowerCase()));
      return {
        ...c,
        searchCount: searchMatch ? searchMatch.count : 0
      };
    }).sort((a, b) => {
      if (b.searchCount !== a.searchCount) {
        return b.searchCount - a.searchCount;
      }
      return (b.heroSection?.growthPercentage || 0) - (a.heroSection?.growthPercentage || 0);
    }).slice(0, 10);

    const formattedData = trendingCelebrities.map(c => {
      // Calculate dynamic read time based on profile complexity
      const bioWords = c.biographyTimeline?.length * 50 || 150;
      const readTime = `${Math.max(4, Math.ceil(bioWords / 150) + 2)} min`;
      
      // Dynamic rating between 8.4 and 9.9
      const rating = (Math.random() * (9.9 - 8.4) + 8.4).toFixed(1);

      return {
        title: c.heroSection?.name || 'Unknown Celebrity',
        description: Array.isArray(c.heroSection?.profession) 
          ? c.heroSection.profession.join(", ") 
          : c.heroSection?.profession || 'Celebrity Intelligence Profile',
        image: c.heroSection?.profileImage || '/placeholder.jpg',
        category: 'Celebrity',
        rating: rating,
        views: `${(c.searchCount * 125 + 1200).toLocaleString()} views`,
        readTime: readTime,
        slug: c.heroSection?.slug,
      };
    });

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}
