import dbConnect from "@/lib/mongodb";
import Celebrity from "@/model/celebrity";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ success: false, message: "Slug is required" });
  }

  try {
    await dbConnect();

    // Find the celebrity and select netWorthCalculation.incomeSources
    const celebrity = await Celebrity.findOne({ "heroSection.slug": slug })
      .select("netWorthCalculation.incomeSources heroSection.name");

    if (!celebrity) {
      return res.status(404).json({ success: false, message: "Celebrity not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        name: celebrity.heroSection?.name,
        incomeSources: celebrity.netWorthCalculation?.incomeSources || []
      }
    });
  } catch (error) {
    console.error("Error fetching income sources data:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
