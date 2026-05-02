import dbConnect from "../../../../../lib/mongodb";
import seedOTT from "../../../../../scripts/seed-ott";

export default async function handler(req, res) {
  try {
    await seedOTT();
    return res.status(200).json({ success: true, message: "OTT Data Seeded" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
