import dbConnect from "../../../lib/mongodb";
import Trending from "../../../model/trending";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();

    // Delete ALL trending records to start fresh
    const deletedCount = await Trending.deleteMany({});

    return res.status(200).json({
      success: true,
      message: `Cleaned up all ${deletedCount.deletedCount} trending records`,
      deletedCount
    });
  } catch (error) {
    console.error("Error cleaning up trending records:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
