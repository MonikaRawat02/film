import dbConnect from "../../../lib/mongodb";
import BoxOffice from "../../../model/boxOffice";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const { industry, limit = 10 } = req.query;

    let query = {};
    // If we have industry info in the model, we should filter. 
    // Assuming BoxOffice model might have movieName which we can use to infer industry if needed,
    // or just return all for now if no industry field exists.

    const data = await BoxOffice.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Public Box Office API Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
