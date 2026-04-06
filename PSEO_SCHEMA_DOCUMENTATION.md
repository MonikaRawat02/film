# Scalable pSEO Schema Documentation

## Overview

This is a flexible, production-ready pSEO (Programmatic SEO) system that supports unlimited dynamic page types without hardcoding. Each movie can have 7-10+ dynamic sub-pages, each fully optimized for SEO.

---

## Schema Architecture

### 1. **pSEOPage Model** (New - Scalable)
Located in: `model/pSEOPage.js`

Features:
- ✅ No hardcoded fields - uses dynamic `slug` and `pageType`
- ✅ Supports unlimited custom page types
- ✅ Compound unique index prevents duplicate pages
- ✅ Full SEO metadata per page
- ✅ Built-in statistics tracking
- ✅ Version control for updates
- ✅ JSON-LD schema markup support

### 2. **Article Model** (Existing - Unchanged)
Located in: `model/article.js`

Current fields remain the same:
- Basic movie metadata (title, slug, releaseDate, etc.)
- Cast, crew, recommendations
- Main content sections
- Overall stats and metadata

**Note**: Old pSEO fields (`pSEO_Content_*`, `subPagesSEO`) are kept for backward compatibility but not used in the new system.

---

## Example Document Structure

### **pSEOPage Document**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "articleId": "507f1f77bcf86cd799439012",
  "slug": "ending-explained",
  "pageType": "ending-explained",
  "customPageType": null,
  "content": [
    {
      "heading": "The Ending Explained",
      "content": "In the climactic scene... detailed explanation...",
      "order": 0
    },
    {
      "heading": "What Does It Mean?",
      "content": "The ending symbolizes... analysis...",
      "order": 1
    },
    {
      "heading": "Hidden Details",
      "content": "Many viewers missed... easter eggs...",
      "order": 2
    }
  ],
  "seo": {
    "title": "Pathaan Movie Ending Explained - Full Breakdown",
    "description": "Complete breakdown of Pathaan's ending, symbolism, and hidden details explained",
    "keywords": ["pathaan ending", "explained", "spoilers", "movies"],
    "faq": [
      {
        "question": "What happens at the end of Pathaan?",
        "answer": "The ending shows... detailed answer..."
      },
      {
        "question": "Is there a post-credit scene?",
        "answer": "Yes, the post-credit scene reveals..."
      }
    ]
  },
  "schemaMarkup": {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Pathaan Movie Ending Explained",
    "description": "Complete breakdown...",
    "datePublished": "2023-02-01T00:00:00Z"
  },
  "stats": {
    "views": 15234,
    "uniqueVisitors": 8542,
    "avgTimeOnPage": 285,
    "bounceRate": 32,
    "keywords": ["pathaan", "ending", "explained", "spoilers"],
    "topKeyword": "pathaan ending explained",
    "ctr": 4.2
  },
  "wordCount": 1847,
  "readTime": "9 min read",
  "isAIGenerated": true,
  "status": "published",
  "version": 2,
  "lastModifiedBy": "admin@filmyfire.com",
  "publishedAt": "2023-02-01T10:30:00Z",
  "createdAt": "2023-02-01T09:00:00Z",
  "updatedAt": "2023-02-05T14:20:00Z"
}
```

---

## Supported Page Types

### **Built-in Page Types**
```javascript
enum: [
  "overview",           // 1200-2000 word main article
  "ending-explained",   // What happened at the end
  "box-office",         // Box office analysis
  "budget-analysis",    // Budget breakdown
  "cast-analysis",      // Cast and crew details
  "ott-release",        // OTT streaming info
  "review-analysis",    // Critical reviews
  "hit-or-flop",        // Success analysis
  "custom"              // Custom page type
]
```

### **Future-Proof Custom Pages**
You can add any custom page type using:
```javascript
{
  pageType: "custom",
  customPageType: "trivia-facts"  // Define your own type
}
```

---

## API Endpoints

### **1. Create/Update pSEO Page**
```bash
POST /api/pseo/pages
Content-Type: application/json

{
  "articleId": "507f1f77bcf86cd799439012",
  "slug": "ending-explained",
  "pageType": "ending-explained",
  "customPageType": null,
  "content": [
    {
      "heading": "The Ending Explained",
      "content": "In the climactic scene...",
      "order": 0
    }
  ],
  "seo": {
    "title": "Pathaan Movie Ending Explained",
    "description": "Complete breakdown of Pathaan's ending...",
    "keywords": ["pathaan", "ending", "explained"],
    "faq": [
      {
        "question": "What happens at the end?",
        "answer": "The ending shows..."
      }
    ]
  },
  "schemaMarkup": { ... },
  "isAIGenerated": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "pSEO page created/updated successfully",
  "data": { ... page document ... }
}
```

### **2. Fetch Single pSEO Page**
```bash
GET /api/pseo/pages?articleId=507f1f77bcf86cd799439012&slug=ending-explained
```

**Response:**
```json
{
  "success": true,
  "data": { ... page document ... }
}
```

### **3. Fetch All pSEO Pages for Article**
```bash
GET /api/pseo/pages?articleId=507f1f77bcf86cd799439012
GET /api/pseo/pages?articleId=507f1f77bcf86cd799439012&status=published
```

**Response:**
```json
{
  "success": true,
  "count": 7,
  "data": [ ... array of pages ... ]
}
```

### **4. Publish a pSEO Page**
```bash
PUT /api/pseo/pages
Content-Type: application/json

{
  "articleId": "507f1f77bcf86cd799439012",
  "slug": "ending-explained"
}
```

**Response:**
```json
{
  "success": true,
  "message": "pSEO page published successfully",
  "data": { ... page document with status: "published" ... }
}
```

### **5. Delete a pSEO Page**
```bash
DELETE /api/pseo/pages
Content-Type: application/json

{
  "articleId": "507f1f77bcf86cd799439012",
  "slug": "ending-explained"
}
```

### **6. Public: Fetch Published Page**
```bash
GET /api/pseo/get-page?movieSlug=pathaan&pageSlug=ending-explained
```

**Response:**
```json
{
  "success": true,
  "data": {
    "page": { ... page document ... },
    "article": {
      "_id": "507f1f77bcf86cd799439012",
      "movieTitle": "Pathaan",
      "slug": "pathaan",
      "coverImage": "https://..."
    }
  }
}
```

---

## Database Indexes

```javascript
// Compound index - Prevent duplicate pages in same movie
{ articleId: 1, slug: 1 } → unique: true

// Single indexes - Performance optimization
{ pageType: 1 }        // For filtering by page type
{ status: 1 }          // For draft/published queries
{ publishedAt: 1 }     // For sorting by date
{ "stats.views": -1 }  // For popularity ranking
```

---

## Usage Examples

### **Example 1: Create "Ending Explained" Page**

```javascript
const response = await fetch("/api/pseo/pages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    articleId: movieId,
    slug: "ending-explained",
    pageType: "ending-explained",
    content: [
      {
        heading: "The Ending Explained",
        content: generateEndingExplanation(movieData),
        order: 0,
      },
      {
        heading: "Hidden Easter Eggs",
        content: findEasterEggs(movieData),
        order: 1,
      },
    ],
    seo: {
      title: `${movieTitle} Ending Explained - Full Breakdown`,
      description: `Complete explanation of ${movieTitle}'s ending...`,
      keywords: [
        `${movieTitle} ending`,
        "explained",
        "spoilers",
        "breakdown",
      ],
      faq: generateFAQs(movieData),
    },
    isAIGenerated: true,
  }),
});
```

### **Example 2: Publish Multiple Pages for a Movie**

```javascript
const pageTypes = [
  "overview",
  "ending-explained",
  "box-office",
  "cast-analysis",
];

for (const pageType of pageTypes) {
  // Create page
  const page = await createPSEOPage(movieId, pageType);

  // Publish it
  await fetch("/api/pseo/pages", {
    method: "PUT",
    body: JSON.stringify({
      articleId: movieId,
      slug: pageType.replace(/([A-Z])/g, "-$1").toLowerCase(),
    }),
  });
}
```

### **Example 3: Fetch All Published Pages**

```javascript
const response = await fetch(
  `/api/pseo/pages?articleId=${movieId}&status=published`
);
const { data: pages } = await response.json();

console.log(`Movie has ${pages.length} published pages:`);
pages.forEach((page) => {
  console.log(`- ${page.pageType}: ${page.stats.views} views`);
});
```

### **Example 4: Display Page on Frontend**

```javascript
// In Next.js dynamic route: /movie/[slug]/[pageSlug].jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function pSEOPage() {
  const router = useRouter();
  const { slug, pageSlug } = router.query;
  const [page, setPage] = useState(null);

  useEffect(() => {
    if (!slug || !pageSlug) return;

    fetch(`/api/pseo/get-page?movieSlug=${slug}&pageSlug=${pageSlug}`)
      .then((res) => res.json())
      .then(({ data }) => setPage(data));
  }, [slug, pageSlug]);

  if (!page) return <div>Loading...</div>;

  return (
    <article>
      <h1>{page.page.seo.title}</h1>
      <meta name="description" content={page.page.seo.description} />

      {page.page.content.map((section, i) => (
        <section key={i}>
          <h2>{section.heading}</h2>
          <p>{section.content}</p>
        </section>
      ))}

      <div dangerouslySetInnerHTML={{ __html: JSON.stringify(page.page.schemaMarkup) }} />
    </article>
  );
}
```

---

## Key Benefits

✅ **Scalability**: Support unlimited page types without schema changes
✅ **No Hardcoding**: Slugs and page types are dynamic
✅ **Duplicate Prevention**: Compound unique index ensures one page per slug
✅ **Performance**: Optimized indexes for fast queries
✅ **SEO-Ready**: Full metadata, FAQ, and schema markup per page
✅ **Version Control**: Track content updates with version numbers
✅ **Statistics**: Built-in views, CTR, keywords tracking
✅ **Future-Proof**: Support for custom page types
✅ **Clean Queries**: Simple, intuitive API for CRUD operations

---

## Migration from Old Schema

**Old fields (still available, but deprecated):**
- `pSEO_Content_ending_explained`
- `pSEO_Content_box_office`
- `pSEO_Content_budget`
- `pSEO_Content_ott_release`
- `pSEO_Content_cast`
- `pSEO_Content_review_analysis`
- `pSEO_Content_hit_or_flop`
- `subPagesSEO`

**New approach:**
- All content in `pSEOPage` collection
- Much more flexible and scalable
- Old fields can be migrated gradually

---

## Performance Tips

1. **Use specific queries**: Always include `articleId` and `slug` together
2. **Filter by status**: Use `status: "published"` for public queries
3. **Pagination**: Add pagination for large result sets
4. **Caching**: Cache published pages in Redis for 24 hours
5. **Batch operations**: Use MongoDB transactions for bulk updates

---

## Query Examples

```javascript
// Get all published pages for a movie
db.pseopages.find({ articleId: ObjectId("..."), status: "published" })

// Get pages by type
db.pseopages.find({ pageType: "ending-explained", status: "published" })

// Get top viewed pages
db.pseopages.find({ status: "published" }).sort({ "stats.views": -1 }).limit(10)

// Get pages created in last 7 days
db.pseopages.find({
  createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
})

// Get draft pages
db.pseopages.find({ status: "draft" })
```

---

This schema is production-ready, scalable, and requires zero modifications to existing Article schema functionality!
