// /api/celebrity/profile 
import dbConnect from "../../../lib/mongodb";
import Celebrity from "../../../model/celebrity";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    // Find a celebrity whose slug is either a case-insensitive match for the given slug
    // or a case-insensitive match for the slug with spaces instead of hyphens.
    const item = await Celebrity.findOne({
      $or: [
        { "heroSection.slug": new RegExp(`^${slug}$`, 'i') },
        { "heroSection.slug": new RegExp(`^${slug.replace(/-/g, ' ')}$`, 'i') },
      ]
    });

    if (!item) {
      return res.status(404).json({ message: "Celebrity not found" });
    }

    return res.status(200).json({ 
      success: true,
      data: item 
    });
  } catch (error) {
    console.error("Error fetching celebrity profile:", error);
    return res.status(500).json({ 
      success: false,
      message: error.message || "Internal server error" 
    });
  }
}
