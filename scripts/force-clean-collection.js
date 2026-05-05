/**
 * Force clean any remaining 'collection' fields in BoxOffice
 * This ensures no reserved keyword warnings
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function forceCleanCollectionField() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('boxoffices');

    // Check for any remaining 'collection' fields
    const docsWithCollection = await collection.countDocuments({ 
      collection: { $exists: true } 
    });

    console.log('\n📊 Checking for legacy fields...');
    console.log(`   Documents with 'collection' field: ${docsWithCollection}`);

    if (docsWithCollection > 0) {
      console.log('\n🔄 Force removing legacy fields...');
      
      // Use aggregation pipeline to rename
      const result = await collection.updateMany(
        { collection: { $exists: true } },
        [
          {
            $set: {
              totalCollection: {
                $ifNull: ["$totalCollection", "$collection"]
              }
            }
          },
          {
            $unset: ["collection"]
          }
        ]
      );

      console.log(`\n✅ Cleaned: ${result.modifiedCount} documents`);
    } else {
      console.log('\n✅ No legacy fields found - database is clean!');
    }

    // Verify
    const afterCheck = await collection.countDocuments({ 
      collection: { $exists: true } 
    });
    console.log(`   Remaining 'collection' fields: ${afterCheck}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected');
  }
}

forceCleanCollectionField();
