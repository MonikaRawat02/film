// Category Pages Schema - /hollywood/movies, /bollywood/action-movies, etc.
// model/CategoryPage.js

import mongoose from "mongoose";

const CategoryPageSchema = new mongoose.Schema(
  {
    // URL slug (e.g., "hollywood", "bollywood-action-movies", "movies-2024")
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 60,
    },

    // Parent category (base structure)
    parentCategory: {
      type: String,
      enum: [
        "hollywood",
        "bollywood",
        "web-series",
        "ott",
        "box-office",
        "celebrities",
      ],
      required: true,
    },

    // Sub-category (e.g., "action-movies", "movies-2024", "top-rated")
    subCategory: {
      type: String,
      trim: true,
    },

    // SEO Information
    title: {
      type: String,
      required: true,
      maxlength: 160,
    },
    description: {
      type: String,
      required: true,
      maxlength: 160,
    },
    keywords: [String],

    // Page Content
    intro: {
      type: String,
      required: true, // 150-200 words intro with keyword
    },

    content: [
      {
        heading: String,
        content: String,
        order: Number,
      },
    ],

    // Movies/Items in this category
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
      },
    ],

    itemCount: {
      type: Number,
      default: 0,
    },

    // SEO Metadata
    seo: {
      title: String,
      description: String,
      canonical: String,
      faq: [
        {
          question: String,
          answer: String,
        },
      ],
    },

    // Schema Markup
    schemaMarkup: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Word Count (CRITICAL)
    wordCount: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v) {
          return v === 0 || (v >= 1200 && v <= 2000);
        },
        message: "Word count must be between 1200-2000 (or 0 if not yet generated)",
      },
    },
    readTime: {
      type: String,
      default: "",
    },

    // Filter criteria
    filterCriteria: {
      genres: [String],
      ratings: {
        min: Number,
        max: Number,
      },
      releaseYears: {
        min: Number,
        max: Number,
      },
      language: [String],
      type: {
        type: String,
        enum: ["movie", "web-series", "all"],
      },
    },

    // Sorting
    sortBy: {
      type: String,
      enum: ["rating", "release-date", "views", "popularity"],
      default: "rating",
    },

    // Pagination
    itemsPerPage: {
      type: Number,
      default: 12,
    },

    // Status
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    version: {
      type: Number,
      default: 1,
    },

    isAIGenerated: {
      type: Boolean,
      default: false,
    },

    lastModifiedBy: String,
    publishedAt: Date,

    // Statistics
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
      ctr: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    indexes: [
      { slug: 1 },
      { parentCategory: 1 },
      { status: 1 },
      { publishedAt: -1 },
      { "stats.views": -1 },
    ],
  }
);

// Calculate word count and read time
CategoryPageSchema.methods.calculateWordCount = function () {
  let totalWords = 0;

  if (this.intro) {
    totalWords += this.intro.split(/\s+/).length;
  }

  if (this.content && Array.isArray(this.content)) {
    this.content.forEach((section) => {
      if (section.content) {
        totalWords += section.content.split(/\s+/).length;
      }
    });
  }

  this.wordCount = totalWords;
  const minutes = Math.ceil(totalWords / 200);
  this.readTime = `${minutes} min read`;

  return { wordCount: totalWords, readTime: this.readTime };
};

// Publish method
CategoryPageSchema.methods.publish = function () {
  this.status = "published";
  this.publishedAt = new Date();
  this.version += 1;
  return this.save();
};

// Pre-save hook
CategoryPageSchema.pre("save", function (next) {
  this.calculateWordCount();
  this.itemCount = this.items ? this.items.length : 0;
  next();
});

// Static methods
CategoryPageSchema.statics.getBySlug = async function (slug) {
  return await this.findOne({ slug, status: "published" }).populate(
    "items",
    "movieTitle slug coverImage releaseYear rating stats"
  );
};

CategoryPageSchema.statics.getByParentCategory = async function (
  parentCategory,
  limit = 20
) {
  return await this.find({ parentCategory, status: "published" })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

CategoryPageSchema.statics.getTopCategories = async function (
  parentCategory,
  limit = 5
) {
  return await this.find({ parentCategory, status: "published" })
    .sort({ "stats.views": -1 })
    .limit(limit);
};

export default mongoose.models.CategoryPage ||
  mongoose.model("CategoryPage", CategoryPageSchema);
