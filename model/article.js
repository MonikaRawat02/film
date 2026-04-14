import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Bollywood", "Hollywood", "WebSeries", "OTT", "BoxOffice", "Celebrities"],
    },
    contentType: {
      type: String,
      enum: ["movie", "webseries"],
    },
    movieTitle: String,
    tagline: String,
    certification: String,
    runtime: String,
    releaseDate: String,
    releaseYear: Number,
    author: {
      name: String,
      role: String,
    },
    summary: String,
    coverImage: String,
    backdropImage: String,
    sections: [
      {
        heading: String,
        content: String,
      },
    ],
    highlights: [String],
    verdict: String,
    tags: [String],

    // Scraped Data
    genres: [String],
    director: [String],
    producer: [String],
    writer: [String],
    criticalResponse: String,
    rating: String,

    // pSEO Fields
    budget: String,
    boxOffice: {
      openingWeekend: String,
      worldwide: String,
      india: String,
    },
    cast: [
      {
        name: String,
        role: String,
        profileImage: String,
        slug: String,
      }
    ],
    crew: [
      {
        name: String,
        job: String,
        department: String,
        profileImage: String,
        slug: String,
      }
    ],
    ott: {
      platform: String,
      releaseDate: Date,
      link: String,
    },
    subPages: {
      endingExplained: { type: Boolean, default: false },
      boxOffice: { type: Boolean, default: false },
      budget: { type: Boolean, default: false },
      ottRelease: { type: Boolean, default: false },
      cast: { type: Boolean, default: false },
      reviewAnalysis: { type: Boolean, default: false },
      hitOrFlop: { type: Boolean, default: false },
    },

    // Content for pSEO sub-pages
    pSEO_Content_ending_explained: [{ heading: String, content: String }],
    pSEO_Content_box_office: [{ heading: String, content: String }],
    pSEO_Content_budget: [{ heading: String, content: String }],
    pSEO_Content_ott_release: [{ heading: String, content: String }],
    pSEO_Content_cast: [{ heading: String, content: String }],
    pSEO_Content_review_analysis: [{ heading: String, content: String }],
    pSEO_Content_hit_or_flop: [{ heading: String, content: String }],
    pSEO_Content_overview: [{ heading: String, content: String }], // Added for 1200-2000 word main page

    // Detailed SEO fields per sub-page
    subPagesSEO: {
      endingExplained: { title: String, description: String, faq: [{ question: String, answer: String }] },
      boxOffice: { title: String, description: String, faq: [{ question: String, answer: String }] },
      budget: { title: String, description: String, faq: [{ question: String, answer: String }] },
      ottRelease: { title: String, description: String, faq: [{ question: String, answer: String }] },
      cast: { title: String, description: String, faq: [{ question: String, answer: String }] },
      reviewAnalysis: { title: String, description: String, faq: [{ question: String, answer: String }] },
      hitOrFlop: { title: String, description: String, faq: [{ question: String, answer: String }] },
    },

    meta: {
      title: String,
      description: String,
      canonical: String,
      faq: [
        {
          question: String,
          answer: String,
        }
      ],
    },
    stats: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      readTime: { type: String, default: "5 min read" },
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    isAIContent: {
      type: Boolean,
      default: false,
    },
    lastBackfillAttempt: Date,
    publishedAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Article || mongoose.model("Article", ArticleSchema);
