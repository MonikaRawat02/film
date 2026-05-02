/**
 * Quick Fix for Celebrity Films/Awards Count
 * Updates celebrities with 0 films/awards by estimating based on their career
 * 
 * Usage: node scripts/quick-fix-celebrity-counts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Celebrity = require('../model/celebrity').default;

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function quickFixCelebrityCounts() {
  console.log('🚀 Starting quick fix for celebrity counts...\n');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find celebrities with 0 or missing films count
    const celebrities = await Celebrity.find({
      $or: [
        { 'heroSection.filmsCount': 0 },
        { 'heroSection.filmsCount': null },
        { 'heroSection.filmsCount': { $exists: false } }
      ]
    });

    console.log(`📊 Found ${celebrities.length} celebrities with 0/missing films count\n`);

    let updated = 0;
    let skipped = 0;

    for (let i = 0; i < celebrities.length; i++) {
      const celeb = celebrities[i];
      const name = celeb.heroSection?.name || 'Unknown';
      const industry = celeb.heroSection?.industry || 'Hollywood';
      const activeSince = celeb.heroSection?.activeSince || celeb.quickFacts?.activeSince;
      const birthDate = celeb.quickFacts?.birthDate;
      const currentFilms = celeb.heroSection?.filmsCount || 0;
      const currentAwards = celeb.heroSection?.awardsCount || 0;

      console.log(`[${i + 1}/${celebrities.length}] ${name}`);

      // Skip if already has films
      if (currentFilms > 0) {
        console.log(`   ⏭️  Already has ${currentFilms} films\n`);
        skipped++;
        continue;
      }

      let estimatedFilms = 0;
      let estimatedAwards = 0;

      // Calculate based on years active
      if (activeSince) {
        const yearsActive = new Date().getFullYear() - activeSince;
        
        // Industry averages:
        // Bollywood: ~2-3 films per year
        // Hollywood: ~1-2 films per year
        if (industry === 'Bollywood' || industry === 'Indian') {
          estimatedFilms = Math.floor(yearsActive * 2.5);
          estimatedAwards = Math.floor(estimatedFilms * 0.3); // ~30% chance of awards per film
        } else {
          estimatedFilms = Math.floor(yearsActive * 1.5);
          estimatedAwards = Math.floor(estimatedFilms * 0.2); // ~20% chance of awards per film
        }

        // Cap reasonable limits
        estimatedFilms = Math.min(estimatedFilms, 200); // Max 200 films
        estimatedAwards = Math.min(estimatedAwards, 100); // Max 100 awards

        console.log(`   📅 Years Active: ${yearsActive} (since ${activeSince})`);
        console.log(`   🎬 Estimated Films: ${estimatedFilms}`);
        console.log(`   🏆 Estimated Awards: ${estimatedAwards}`);
      } else if (birthDate) {
        // If we only have birth date, estimate age and career length
        const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
        const careerStart = Math.max(activeSince || 0, new Date(birthDate).getFullYear() + 20);
        const yearsActive = new Date().getFullYear() - careerStart;

        if (yearsActive > 0) {
          if (industry === 'Bollywood' || industry === 'Indian') {
            estimatedFilms = Math.floor(yearsActive * 2.5);
            estimatedAwards = Math.floor(estimatedFilms * 0.3);
          } else {
            estimatedFilms = Math.floor(yearsActive * 1.5);
            estimatedAwards = Math.floor(estimatedFilms * 0.2);
          }

          estimatedFilms = Math.min(estimatedFilms, 200);
          estimatedAwards = Math.min(estimatedAwards, 100);

          console.log(`   📅 Estimated Years Active: ${yearsActive}`);
          console.log(`   🎬 Estimated Films: ${estimatedFilms}`);
          console.log(`   🏆 Estimated Awards: ${estimatedAwards}`);
        }
      }

      // Set minimum values if estimation failed
      if (estimatedFilms === 0) {
        estimatedFilms = industry === 'Bollywood' ? 10 : 5;
        estimatedAwards = Math.floor(estimatedFilms * 0.2);
        console.log(`   ⚠️  Using default estimates`);
        console.log(`   🎬 Default Films: ${estimatedFilms}`);
        console.log(`   🏆 Default Awards: ${estimatedAwards}`);
      }

      // Update the celebrity
      await Celebrity.updateOne(
        { _id: celeb._id },
        {
          $set: {
            'heroSection.filmsCount': estimatedFilms,
            'heroSection.awardsCount': estimatedAwards
          }
        }
      );

      console.log(`   ✅ Updated\n`);
      updated++;
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 QUICK FIX SUMMARY:');
    console.log('='.repeat(50));
    console.log(`   Total Processed: ${celebrities.length}`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log('='.repeat(50));
    console.log('\n✅ Quick fix complete!');
    console.log('\n💡 Note: These are estimated values. For accurate data, run:');
    console.log('   node scripts/fix-celebrity-data.js');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
quickFixCelebrityCounts();
