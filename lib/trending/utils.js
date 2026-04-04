/**
 * Trending Ranking Engine Utilities
 */

/**
 * Calculates a 0-100 score based on traffic, views, and recency
 * (User's requirement #6)
 */
export const calculateTrendScore = (data) => {
  let baseScore = 0;

  // 1. Popularity score (Google Trends / Traffic)
  if (data.traffic > 1000000) baseScore += 40;
  else if (data.traffic > 500000) baseScore += 30;
  else if (data.traffic > 100000) baseScore += 20;
  else if (data.traffic > 50000) baseScore += 10;

  // 2. YouTube views
  if (data.viewCount > 10000000) baseScore += 30;
  else if (data.viewCount > 5000000) baseScore += 20;
  else if (data.viewCount > 1000000) baseScore += 10;

  // 3. Recency
  const hoursSinceTrend = (Date.now() - new Date(data.trendTimestamp || Date.now()).getTime()) / (1000 * 60 * 60);
  if (hoursSinceTrend < 6) baseScore += 30;
  else if (hoursSinceTrend < 24) baseScore += 20;
  else if (hoursSinceTrend < 48) baseScore += 10;

  return Math.min(baseScore, 100);
};
