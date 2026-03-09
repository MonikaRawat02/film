import mongoose from "mongoose";
import User from "../model/user.js";

const username = "arohigupta367_db_user";
const password = encodeURIComponent("3zyvqOvPwIFeSzzP");

const MONGODB_URI =
  `mongodb+srv://${username}:${password}@film.ngy8tx1.mongodb.net/film?retryWrites=true&w=majority`;

const ADMIN_DATA = {
  name: "Dilip",
  email: "diglip@gmail.com",
  password: "Admin@123", // plain password
  role: "admin",
};

async function createOrUpdateAdmin() {
  try {

    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");

    const admin = await User.findOne({ email: ADMIN_DATA.email });

    if (!admin) {
      const newAdmin = new User(ADMIN_DATA);
      await newAdmin.save(); // schema will hash password

      console.log("🎉 Admin created");
    } else {
      console.log("⚠️ Admin already exists");
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createOrUpdateAdmin();