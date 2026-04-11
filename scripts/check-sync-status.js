
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function checkStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.useDb('film');
    const collection = db.collection('articles');
    
    const aiCount = await collection.countDocuments({ isAIContent: true });
    const totalCount = await collection.countDocuments({ contentType: "movie" });
    
    console.log(`📊 Total Movies: ${totalCount}`);
    console.log(`🤖 AI-Generated: ${aiCount}`);
    
    if (aiCount > 0) {
      const samples = await collection.find({ isAIContent: true }).limit(5).sort({ createdAt: -1 }).toArray();
      console.log("\n🆕 Newest AI Movies:");
      samples.forEach(s => console.log(` - ${s.movieTitle || s.title} (${s.category})`));
    }
    
  } catch (err) {
    console.error("❌ Status check failed:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkStatus();
