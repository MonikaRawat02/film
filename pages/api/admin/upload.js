import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (payload.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { data, fileName } = req.body || {};
    if (!data) {
      return res.status(400).json({ message: "Missing file data" });
    }

    const matches = data.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ message: "Invalid data URL" });
    }
    const mime = matches[1];
    const base64 = matches[2];
    const ext = mime.split("/")[1] || "png";

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const namePart = (fileName || `img_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, "");
    const filePath = path.join(uploadsDir, `${namePart}.${ext}`);
    await fs.promises.writeFile(filePath, Buffer.from(base64, "base64"));

    const urlPath = `/uploads/${namePart}.${ext}`;
    return res.status(200).json({ url: urlPath });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
