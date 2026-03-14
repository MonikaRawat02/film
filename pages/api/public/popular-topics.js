import dbConnect from "@/lib/mongodb";
import PopularTopic from "@/model/popularTopic";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await dbConnect();

  try {
    const topics = await PopularTopic.find({}).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: topics });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}
