import dbConnect from "../../../lib/mongodb";
import Celebrity from "../../../model/celebrity";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const celebrities = await Celebrity.find({})
      .select("heroSection.name heroSection.profileImage heroSection.slug heroSection.profession profession")
      .limit(10)
      .sort({ createdAt: -1 })
      .lean();

    // Transform data to flat structure for easier consumption
    const transformedData = celebrities.map(celeb => ({
      _id: celeb._id,
      name: celeb.heroSection?.name || celeb.name,
      profileImage: celeb.heroSection?.profileImage || celeb.profileImage,
      slug: celeb.heroSection?.slug || celeb.slug,
      profession: celeb.heroSection?.profession || celeb.profession || ["Entertainment Professional"]
    }));

    return res.status(200).json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error("Error fetching celebrities for hub:", error);
    return res.status(500).json({ message: error.message });
  }
}
