import dbConnect from "@/lib/mongodb";
import PopularTopic from "@/model/popularTopic";

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  await dbConnect();

  switch (method) {
    case "PUT":
      try {
        const topic = await PopularTopic.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!topic) return res.status(404).json({ success: false, message: "Topic not found" });
        res.status(200).json({ success: true, data: topic });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    case "DELETE":
      try {
        const deletedTopic = await PopularTopic.deleteOne({ _id: id });
        if (!deletedTopic) return res.status(404).json({ success: false, message: "Topic not found" });
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
