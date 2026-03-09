import dbConnect from "../../../lib/mongodb";
import User from "../../../model/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    console.log("➡️ API HIT");

    await dbConnect();
    console.log("✅ MongoDB connected");

    const { email, password } = req.body;

    console.log("📨 Request Email:", email);
    console.log("🔑 Request Password:", password);

    if (!email || !password) {
      console.log("❌ Email or password missing");
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");

    console.log("👤 User Found:", user ? true : false);

    if (!user) {
      console.log("❌ User not found in DB");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("📧 DB Email:", user.email);
    console.log("🔐 DB Hashed Password:", user.password);

    if (user.role !== "admin") {
      console.log("❌ User is not admin");
      return res.status(403).json({ message: "Admin access only" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("🧪 Password Match Result:", isMatch);

    if (!isMatch) {
      console.log("❌ Password comparison failed");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("✅ Password matched");

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("🎟️ Token generated");

    return res.status(200).json({
      message: "Admin login successful",
      token,
    });

  } catch (error) {
    console.error("❌ API ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
}