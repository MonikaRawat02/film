# 🚀 Quick Start Guide - Internal Linking Engine

## ⚡ Immediate Setup (5 Minutes)

### Step 1: Restart Your Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 2: Run Initial Recommendation Calculation
```bash
node scripts/calculate-all-recommendations.js
```

**Expected Output:**
```
🚀 Starting recommendation calculation for ALL movies...
📊 Found X movies to process
Calculating recommendations for Movie 1 (1/X)
...
✅ Batch processing complete!
   Success: X
   Errors: 0

✨ All recommendations calculated successfully!
```

### Step 3: Test the Features

#### Test Related Movies:
1. Open browser: `http://localhost:3000`
2. Navigate to any movie page (e.g., `/movie/animal-2023`)
3. Look at the **right sidebar**
4. You should see "Related Intelligence" section with movie cards

#### Test OTT Platform Linking:
1. On the same movie page
2. Look for "Stream Now" section below related movies
3. Click the platform badge (e.g., "Netflix")
4. Should navigate to `/ott/netflix` platform page

#### Test Platform Pages:
1. Visit: `http://localhost:3000/ott/netflix`
2. Should see all Netflix movies in a grid
3. Click any movie to view details

---

## 🎯 What You'll See

### Related Movies Section:
```
┌─────────────────────────────────────┐
│ ⚡ RELATED INTELLIGENCE             │
├─────────────────────────────────────┤
│ [Thumbnail] Kabir Singh (2019)     │
│               85% Match             │
│               Excellent Match       │
├─────────────────────────────────────┤
│ [Thumbnail] Arjun Reddy (2017)     │
│               78% Match             │
│               Very Similar          │
└─────────────────────────────────────┘
```

### OTT Platform Badge:
```
┌─────────────────────────────────────┐
│ 📺 STREAM NOW                       │
├─────────────────────────────────────┤
│ Available On         →              │
│ NETFLIX                             │
│                                     │
│ Streaming since Jan 15, 2024        │
└─────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Issue: No Related Movies Showing

**Solution:**
```bash
# Re-run the calculation
node scripts/calculate-all-recommendations.js

# Or trigger via API
curl -X POST http://localhost:3000/api/admin/batch-calculate-recommendations
```

### Issue: Redis Connection Error

**Solution:**
The system works without Redis too! It just won't cache.
To enable Redis:

1. Install Redis (if not installed)
2. Add to `.env`:
   ```
   REDIS_URL=redis://localhost:6379
   ```
3. Restart server

### Issue: OTT Platform Page Not Found

**Check:**
1. Movie has OTT platform data in database
2. Platform name matches exactly (case-sensitive)
3. Try different platforms: `/ott/amazon-prime`, `/ott/netflix`

---

## 📊 Admin Dashboard Integration

### Add This Button to Your Admin Panel:

```jsx
// In your admin dashboard component
const handleCalculateRecommendations = async () => {
  try {
    const res = await fetch('/api/admin/batch-calculate-recommendations', {
      method: 'POST'
    });
    const data = await res.json();
    alert(`✅ Processed ${data.data.processed} movies!`);
  } catch (err) {
    alert('❌ Error: ' + err.message);
  }
};

return (
  <div>
    <h3>Internal Linking Engine</h3>
    <button onClick={handleCalculateRecommendations}>
      🔄 Recalculate All Recommendations
    </button>
  </div>
);
```

---

## 🎨 Customization Options

### Change Match Thresholds

Edit `/lib/recommendation-engine.js`:

```javascript
function getMatchLevel(score) {
  if (score >= 0.7) return 'Excellent Match'; // Was 0.8
  if (score >= 0.5) return 'Very Similar';    // Was 0.6
  if (score >= 0.3) return 'Somewhat Similar'; // Was 0.4
  return 'Slightly Similar';
}
```

### Adjust Weights

Edit `/lib/recommendation-engine.js`:

```javascript
// Current weights (must add up to 1.0)
totalScore += genreScore * 0.40;   // 40% genre
totalScore += castScore * 0.30;    // 30% cast
totalScore += directorScore * 0.20; // 20% director
totalScore += yearScore * 0.10;    // 10% year
```

### Change Number of Recommendations

In API calls or function calls, change `limit` parameter:

```javascript
findSimilarMovies(allMovies, targetMovie, 10); // Show 10 instead of 5
```

---

## 📈 Monitor Performance

### Check Redis Cache (If Enabled):

```javascript
// Add this to monitor cache hit rate
redis.info((err, info) => {
  console.log('Cache Stats:', info.keyspace_hits, info.keyspace_misses);
});
```

### Track User Engagement:

Add analytics to your tracking:

```javascript
// When user clicks related movie
analytics.track('Related Movie Click', {
  sourceMovie: article.slug,
  targetMovie: movie.slug,
  matchScore: movie.similarityScore
});
```

---

## ✅ Testing Checklist

Before going to production:

- [ ] Run batch calculation successfully
- [ ] Visit 5+ movie pages
- [ ] Verify related movies appear
- [ ] Click 3+ related movie links
- [ ] Test OTT platform badge clicks
- [ ] Visit 2+ platform pages
- [ ] Test on mobile device
- [ ] Check page load speed
- [ ] Verify no console errors
- [ ] Test with Redis enabled/disabled

---

## 🎉 Success Indicators

You'll know it's working when:

✅ Related movies appear in sidebar
✅ Match percentages display correctly
✅ OTT badges are clickable
✅ Platform pages show movie grids
✅ No errors in console
✅ Pages load quickly (<2 seconds)

---

## 📞 Need Help?

### Common Questions:

**Q: How often should I recalculate?**
A: Weekly is recommended. Add to cron scheduler.

**Q: Can I exclude certain movies?**
A: Yes, filter by status or custom criteria.

**Q: What if I have <10 movies?**
A: Algorithm still works but results may be less accurate.

**Q: Does this work with Hollywood movies?**
A: Yes! Works with any movie that has metadata.

---

## 🚀 Next Steps

After confirming everything works:

1. **Add to Cron Scheduler** (see docs/INTERNAL_LINKING_ENGINE.md)
2. **Monitor User Engagement** (track clicks, time on site)
3. **Consider Actor Linking** (future enhancement)
4. **Optimize Based on Data** (adjust weights if needed)

---

**Ready to go! 🎉**

If you see related movies and OTT badges, you're all set!
