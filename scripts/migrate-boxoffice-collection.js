/**
 * Migrate BoxOffice collection field to totalCollection
 * Fixes Mongoose reserved keyword warning
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function migrateBoxOfficeCollection() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('boxoffices');

    // Check if there are any documents with 'collection' field
    const docsWithCollection = await collection.countDocuments({ collection: { $exists: true } });
    const docsWithTotalCollection = await collection.countDocuments({ totalCollection: { $exists: true } });

    console.log('\n📊 Current Status:');
    console.log(`   - Documents with 'collection' field: ${docsWithCollection}`);
    console.log(`   - Documents with 'totalCollection' field: ${docsWithTotalCollection}`);

    if (docsWithCollection === 0) {
      console.log('\n✅ Migration already complete! No action needed.');
      await mongoose.disconnect();
      return;
    }

    console.log(`\n🔄 Migrating ${docsWithCollection} documents...`);

    // Update all documents: rename 'collection' to 'totalCollection'
    const result = await collection.updateMany(
      { collection: { $exists: true } },
      [
        {
          $set: {
            totalCollection: "$collection"
          }
        },
        {
          $unset: ["collection"]
        }
      ]
    );

    console.log('\n✅ Migration Complete!');
    console.log(`   - Updated: ${result.modifiedCount} documents`);
    console.log(`   - Matched: ${result.matchedCount} documents`);

    // Verify migration
    const afterMigrationWithCollection = await collection.countDocuments({ collection: { $exists: true } });
    const afterMigrationWithTotalCollection = await collection.countDocuments({ totalCollection: { $exists: true } });

    console.log('\n📊 After Migration:');
    console.log(`   - Documents with 'collection' field: ${afterMigrationWithCollection}`);
    console.log(`   - Documents with 'totalCollection' field: ${afterMigrationWithTotalCollection}`);

    if (afterMigrationWithCollection === 0 && afterMigrationWithTotalCollection > 0) {
      console.log('\n🎉 Migration successful! All documents migrated.');
    } else {
      console.log('\n️  Migration may have issues. Please verify manually.');
    }

  } catch (error) {
    console.error('❌ Migration Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

migrateBoxOfficeCollection();
