import dbConnect from "@/lib/mongodb";
import PopularTopic from "@/model/popularTopic";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const topics = await PopularTopic.find({}).sort({ order: 1, createdAt: -1 });
        res.status(200).json({ success: true, data: topics });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    case "POST":
      try {
        const topic = await PopularTopic.create(req.body);
        res.status(201).json({ success: true, data: topic });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
