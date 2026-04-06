// Scalable pSEO Sub-Page Schema
// Supports unlimited dynamic page types without hardcoding
// model/pSEOPage.js

import mongoose from "mongoose";

const ContentSectionSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const SEOMetadataSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    keywords: [
      {
        type: String,
        trim: true,
      }
    ],
    faq: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
      }
    ],
  },
  { _id: false }
);

const pSEOPageSchema = new mongoose.Schema(
  {
    // Link to Article
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },

    // Page Slug (e.g., "ending-explained", "box-office", "cast-analysis")
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // Page Type for categorization and future extensibility
    pageType: {
      type: String,
      enum: [
        "overview",
        "ending-explained",
        "box-office",
        "budget-analysis",
        "cast-analysis",
        "ott-release",
        "review-analysis",
        "hit-or-flop",
        "custom", // Allow custom page types
      ],
      required: true,
    },

    // Custom Type Name (if pageType is "custom")
    customPageType: {
      type: String,
      trim: true,
    },

    // Main Content - Array of sections
    content: {
      type: [ContentSectionSchema],
      default: [],
      validate: {
        validator: (v) => v.length > 0,
        message: "At least one content section is required",
      },
    },

    // SEO Metadata
    seo: {
      type: SEOMetadataSchema,
      required: true,
    },

    // JSON-LD Schema Markup (optional, for rich snippets)
    schemaMarkup: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Page Statistics
    stats: {
      views: {
        type: Number,
        default: 0,
      },
      uniqueVisitors: {
        type: Number,
        default: 0,
      },
      avgTimeOnPage: {
        type: Number,
        default: 0,
      },
      bounceRate: {
        type: Number,
        default: 0,
      },
      keywords: [String],
      topKeyword: String,
      ctr: {
        type: Number,
        default: 0,
      },
    },

    // Content Metadata
    wordCount: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: String,
      default: "",
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },

    // Status
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    // Version tracking for updates
    version: {
      type: Number,
      default: 1,
    },

    // Last updated by
    lastModifiedBy: {
      type: String,
      trim: true,
    },

    // Publishing info
    publishedAt: Date,
  },
  {
    timestamps: true,
    // Compound index for preventing duplicates: same article + slug combination
    indexes: [
      { articleId: 1, slug: 1 }, // Primary index for queries
      { pageType: 1 }, // For filtering by page type
      { status: 1 }, // For published/draft queries
      { publishedAt: 1 }, // For sorting by date
      { "stats.views": -1 }, // For popularity queries
    ],
  }
);

// Compound unique index to prevent duplicate pages within same movie
pSEOPageSchema.index(
  { articleId: 1, slug: 1 },
  {
    unique: true,
    sparse: true,
    name: "unique_article_slug",
  }
);

// Static method to create or update a pSEO page
pSEOPageSchema.statics.createOrUpdatePage = async function (
  articleId,
  pageData
) {
  return await this.findOneAndUpdate(
    { articleId, slug: pageData.slug },
    {
      ...pageData,
      version: pageData.version || 1,
    },
    {
      upsert: true,
      new: true,
      returnDocument: "after",
      runValidators: true,
    }
  );
};

// Static method to fetch by article and slug
pSEOPageSchema.statics.getByArticleSlug = async function (articleId, slug) {
  return await this.findOne({ articleId, slug, status: "published" });
};

// Static method to fetch all pages for an article
pSEOPageSchema.statics.getByArticle = async function (articleId, status = null) {
  const query = { articleId };
  if (status) query.status = status;
  return await this.find(query).sort({ pageType: 1 });
};

// Static method to fetch all published pages of a specific type
pSEOPageSchema.statics.getByPageType = async function (pageType, limit = 20) {
  return await this.find({ pageType, status: "published" })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Instance method to calculate read time
pSEOPageSchema.methods.calculateReadTime = function () {
  const totalWords = this.content.reduce(
    (sum, section) => sum + (section.content.split(/\s+/).length || 0),
    0
  );
  this.wordCount = totalWords;
  const minutes = Math.ceil(totalWords / 200); // Assuming 200 words per minute
  this.readTime = `${minutes} min read`;
  return this.readTime;
};

// Instance method to publish
pSEOPageSchema.methods.publish = function () {
  this.status = "published";
  this.publishedAt = new Date();
  this.version += 1;
  return this.save();
};

// Instance method to archive
pSEOPageSchema.methods.archive = function () {
  this.status = "archived";
  this.version += 1;
  return this.save();
};

// Pre-save hook to calculate read time
pSEOPageSchema.pre("save", function (next) {
  if (this.content.length > 0) {
    this.calculateReadTime();
  }
  next();
});

export default mongoose.models.pSEOPage ||
  mongoose.model("pSEOPage", pSEOPageSchema);
