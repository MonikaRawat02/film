import dbConnect from "../../../lib/mongodb";
import IndustryInsight from "../../../model/industryInsight";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const insights = await IndustryInsight.find().lean();
    
    return res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error("Error fetching industry insights:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
}
