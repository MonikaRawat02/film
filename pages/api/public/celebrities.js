import dbConnect from "../../../lib/mongodb";
import Celebrity from "../../../model/celebrity";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const celebrities = await Celebrity.find({})
      .select("heroSection.name heroSection.profileImage heroSection.slug")
      .limit(5)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: celebrities
    });
  } catch (error) {
    console.error("Error fetching celebrities for hub:", error);
    return res.status(500).json({ message: error.message });
  }
}
