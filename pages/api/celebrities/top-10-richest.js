import dbConnect from "../../../lib/mongodb";
import Celebrity from "../../../model/celebrity";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const celebrities = await Celebrity.find({})
      .sort({ "netWorth.netWorthUSD.max": -1 })
      .limit(10);

    res.status(200).json({ success: true, data: celebrities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
