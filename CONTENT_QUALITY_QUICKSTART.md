# 🚀 Quick Start - Content Quality & Validation

## ⚡ Setup (2 Minutes)

### Step 1: Restart Dev Server
```bash
npm run dev
```

### Step 2: Test Validation API
```bash
# In a new terminal
curl -X POST http://localhost:3000/api/admin/validate-content-quality \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "test-movie",
    "sections": [
      {"heading": "Introduction", "content": "Test content with sufficient words..."}
    ],
    "pageType": "overview"
  }'
```

---

## 🎯 How It Works

### Automatic Validation (During Generation)

When you generate AI content:

```javascript
// lib/ai-generator.js automatically validates
const result = await generateMovieContent(movieData, 'overview');

console.log(result.qualityReport);
// {
//   qualityScore: 85,
//   isValid: true,
//   wordCount: 2100,
//   issues: [],
//   recommendations: []
// }
```

**What happens:**
1. ✅ AI generates content
2. ✅ System validates word count (min 1800 for overview)
3. ✅ Checks heading structure
4. ✅ Verifies FAQ section
5. ✅ Detects internal links
6. ✅ Calculates quality score
7. ✅ Auto-regenerates if too short

---

## 📊 View Quality Metrics

### In Admin Dashboard

Add to your article edit page:

```jsx
import { QualityReportCard } from '@/components/admin/QualityMetrics';

// After generating content
<QualityReportCard report={qualityReport} />
```

### What You'll See

```
┌───────────────────────────────────────────┐
│ CONTENT QUALITY REPORT        ✓ 85/100   │
├───────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│ │Words │ │Checks│ │ FAQ  │ │Links │     │
│ │2,100 │ │ 5/5  │ │ Yes  │ │  5   │     │
│ └──────┘ └──────┘ └──────┘ └──────┘     │
│                                           │
│ Heading Structure: H1 ✓ | H2: 6 | H3: 4  │
│                                           │
│ ✅ No issues found                        │
│                                           │
│ 💡 Recommendations (0)                    │
└───────────────────────────────────────────┘
```

---

## 🔧 Manual Validation

### Validate Existing Content

```javascript
const response = await fetch('/api/admin/validate-content-quality', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    slug: 'animal-2023',
    sections: article.sections,
    pageType: 'overview'
  })
});

const report = await response.json();
console.log(report);
```

### Check for Duplicates

```javascript
const response = await fetch('/api/admin/check-duplicate-content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    slug: 'animal-2023',
    sections: article.sections
  })
});

const duplicateCheck = await response.json();
if (duplicateCheck.isDuplicate) {
  console.log('Similar articles:', duplicateCheck.similarArticles);
}
```

---

## ✅ Quality Standards

### Minimum Requirements:

**Overview Pages:**
- ✅ 1800+ words
- ✅ H1 heading
- ✅ 2+ H2 subheadings
- ✅ FAQ section (3+ questions)
- ✅ 2+ internal links

**Sub-Pages (Ending Explained, Box Office, etc.):**
- ✅ 1200+ words
- ✅ H1 heading
- ✅ 2+ H2 subheadings
- ✅ FAQ section (3+ questions)
- ✅ 2+ internal links

### Quality Score Thresholds:

```
80-100: Excellent ✅ (Green badge)
60-79:  Good ✅ (Blue badge)
50-59:  Fair ⚠️ (Yellow badge)
<50:    Poor ❌ (Red badge)
```

---

## 🔄 Auto-Regeneration

### When Content is Too Short:

**Scenario:** AI generates only 850 words (minimum is 1200)

**System Response:**
```
⚠️ Content too short: 850 words (minimum 1200)
🔄 Regenerating expanded content...
📊 New word count: 1650 words ✅
✅ Quality Score: 78/100 (PASSED)
```

**How it works:**
1. Detects insufficient word count
2. Sends expansion prompt to AI
3. AI adds more detail and examples
4. Re-validates expanded content
5. Returns improved version

---

## 📈 Monitor Quality

### Track Average Quality Score

```javascript
// In admin dashboard
const avgQuality = articles.reduce((sum, a) => 
  sum + (a.qualityReport?.qualityScore || 0), 0) / articles.length;

console.log(`Average quality: ${avgQuality}/100`);
```

### Common Metrics to Watch:

- **Average Word Count**: Should be 1500+
- **FAQ Coverage**: Should be 90%+
- **Heading Structure**: Should be 95%+
- **Quality Score**: Should be 70+

---

## 🐛 Troubleshooting

### Issue: All Content Fails Validation

**Check:**
1. Is AI model working? (check API keys)
2. Are prompts clear enough?
3. Is minimum word count too high?

**Fix:**
```javascript
// Temporarily lower minimum
await validateContentQuality(sections, movieData, {
  minWords: 1000  // Instead of 1200
});
```

### Issue: Quality Score Always Low

**Common Causes:**
- Missing FAQ sections
- No internal links
- Poor heading structure

**Fix:**
```javascript
// Update AI prompts to include these elements
const prompt = `Generate comprehensive content with:
1. Clear H1/H2/H3 headings
2. FAQ section with 5 questions
3. Internal links to related content
...`;
```

---

## 🎨 Admin Integration

### Add Quality Badge to Article List

```jsx
import { QualityScoreBadge } from '@/components/admin/QualityMetrics';

// In article card
<QualityScoreBadge score={article.qualityReport?.qualityScore || 0} />
```

### Display Word Count

```jsx
import { WordCountDisplay } from '@/components/admin/QualityMetrics';

<WordCountDisplay wordCount={totalWordCount} minRequired={1200} />
```

---

## ✅ Testing Checklist

Test the system:

- [ ] Generate content for a test movie
- [ ] Verify word count is 1200+
- [ ] Check for FAQ section
- [ ] Confirm heading structure (H1, H2, H3)
- [ ] Look for internal links
- [ ] Check quality score in admin
- [ ] Test duplicate detection
- [ ] Verify auto-regeneration works
- [ ] No console errors

---

## 📊 Example Quality Report

```json
{
  "success": true,
  "isValid": true,
  "qualityScore": 85,
  "status": "approved",
  "report": {
    "wordCount": 2100,
    "passedChecks": 5,
    "totalChecks": 5,
    "issues": [],
    "recommendations": [],
    "headingStructure": {
      "hasH1": true,
      "h2Count": 6,
      "h3Count": 4
    },
    "hasFAQ": true,
    "internalLinks": 5
  },
  "actionRequired": "Content meets quality standards"
}
```

---

## 🎯 Success Indicators

You'll know validation is working when:

✅ All articles have 1200+ words
✅ 90%+ have FAQ sections
✅ Quality scores average 70+
✅ Proper heading hierarchy
✅ Multiple internal links per page
✅ No duplicate content issues

---

## 🚀 Next Steps

After confirming validation works:

1. **Monitor Trends**
   - Track average quality scores
   - Identify common issues
   - Adjust prompts accordingly

2. **Optimize AI Prompts**
   - Address recurring failures
   - Add specific instructions
   - Include quality examples

3. **Set Up Alerts**
   - Notify when quality drops below 60
   - Flag articles for manual review
   - Track regeneration frequency

---

## ✨ That's It!

You now have automatic content quality validation that:

✅ **Enforces standards** (word count, structure)
✅ **Auto-improves** (regenerates weak content)
✅ **Prevents duplicates** (SEO protection)
✅ **Provides feedback** (actionable recommendations)
✅ **Visualizes metrics** (admin dashboards)

**Ready to use!** 🎉

---

**Quick Reference:**

- **Validate API**: `/api/admin/validate-content-quality`
- **Duplicate Check**: `/api/admin/check-duplicate-content`
- **Quality Component**: `<QualityReportCard />`
- **Docs**: `/docs/CONTENT_QUALITY_VALIDATION.md`
