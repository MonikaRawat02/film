import mongoose from "mongoose";

const TimelineEntrySchema = new mongoose.Schema({
  year: Number,
  netWorth: String
});

const MilestoneEntrySchema = new mongoose.Schema({
  year: Number,
  milestone: String
});

const CelebritySchema = new mongoose.Schema(
{

/* =====================================================
   SECTION 1 — CELEBRITY HERO
===================================================== */
heroSection: {

  name: String, // Shah Rukh Khan

  profession: [String], // ["Actor","Producer","Entrepreneur"]

  careerStage: {
    type: String,
    enum: ["Rising", "Peak", "Transition", "Active", "Retired"],
    default: "Peak"
  },

  profileImage: String,

  nationality: String,

industry: String,

  height: String,

  slug: {
    type: String,
    unique: true,
    required: true
  },

  tmdbId: Number,
  biography: String,
  birthday: String,
  placeOfBirth: String,
  isAutomated: { type: Boolean, default: false },

  filmsCount: {
    type: Number
  },

  awardsCount: {
    type: Number
  },

  growthPercentage: {
    type: Number // +42%
  },

  // --- NEW: Trending Intelligence ---
  trendingScore: { type: Number, default: 0 },
  lastTrendingSync: { type: Date }

},
/* =====================================================
   SECTION 2 — NET WORTH INTELLIGENCE
===================================================== */

netWorth: {

  title: String,

  year: Number,

  description: String,

  currencyToggle: {
    type: [String],
    default: ["USD", "INR"]
  },

  netWorthINR: {
    min: Number,
    max: Number,
    display: String
  },

  netWorthUSD: {
    min: Number,
    max: Number,
    display: String
  },

  lastUpdated: Date,

  estimationNote: String,

  analysisSummary: String
},

/* =====================================================
   SECTION 3 — NET WORTH ANALYSIS
===================================================== */

netWorthAnalysis: {

  estimatedRange: {
    min: Number,
    max: Number
  },

  displayRange: String, // "$770M - $780M"

  currency: String, // USD / INR

  lastUpdated: Date,

  description: String

},

/* =====================================================
   SECTION 4 — QUICK FACTS
===================================================== */

quickFacts: {

  age: Number,

  birthDate: Date,

  profession: [String],

  activeSince: Number,

  brandEndorsements: Number

},

/* =====================================================
   SECTION 5 — NET WORTH CALCULATION
===================================================== */

netWorthCalculation: {

  incomeSources: [
    {
      sourceName: String,
      percentage: Number,
      description: String
    }
  ],

},

/* =====================================================
   SECTION 6 — NET WORTH TIMELINE
===================================================== */

netWorthTimeline: {


  timeline: [TimelineEntrySchema],

  keyMilestones: [MilestoneEntrySchema]

},

/* =====================================================
   SECTION 7 — BIOGRAPHY TIMELINE
===================================================== */

biographyTimeline: [
  {
    period: String, // 1992-1995

    title: String,

    description: String,

    subDescription: String
  }
],

/* =====================================================
   SECTION 8 — ASSETS & LIFESTYLE
===================================================== */

assets: [
  {
    name: String,

    location: String,

    value: String,

    description: String,

    image: String,

  }
],

/* =====================================================
   SECTION 9 — CELEBRITY COMPARISONS
===================================================== */

celebrityComparisons: {

  comparisons: [
    {
      name: String,

      slug: String,

      image: String,

      netWorth: Number,

      netWorthDisplay: String,

      careerStage: {
        type: String,
        enum: ["Rising", "Peak", "Transition"]
      }
    }
  ],

},

/* =====================================================
   SECTION 10 — RELATED INTELLIGENCE
===================================================== */

relatedIntelligence: [
  {
    category: {
      type: String,
      required: true
    },

    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

   }
],

/* =====================================================
   SECTION 11 — FAQ
===================================================== */

faqs: [
  {
    question: {
      type: String,
      required: true
    },

    answer: {
      type: String,
      required: true
    }
  }
],

/* =====================================================
   SECTION 12 — NET WORTH DISCLAIMER
===================================================== */

netWorthDisclaimer: {

  title: String,

  description: String,

  highlights: [
    {
      title: String,
      description: String
    }
  ],

  additionalNote: String
},

/* =====================================================
   SECTION 13 — EDITORIAL / SOURCE INFO
===================================================== */

/* =====================================================
   SECTION 14 — PREMIUM CELEBRITY INTELLIGENCE CTA
===================================================== */

premiumIntelligence: {

  title: String,
  description: String,

  primaryCTA: {
    label: String,
    link: String
  },

  secondaryCTA: {
    label: String,
    link: String
  },

  subscribeCTA: {
    label: String,
    link: String
  },

  stats: {
    celebrityProfiles: Number,
    monthlyReaders: Number,
    accuracyRate: Number
  }

}
},
{ timestamps: true }
);

delete mongoose.models.Celebrity;
export default mongoose.models.Celebrity || mongoose.model("Celebrity", CelebritySchema);
