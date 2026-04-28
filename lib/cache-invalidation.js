/**
 * Cache Invalidation Helpers for Admin Operations
 * Import and use these in admin API routes to invalidate cache after CRUD operations
 */

import { invalidateCache, invalidateAllCache } from '../cache-utils.js';

/**
 * Invalidate cache after article operations (create/update/delete)
 */
export async function invalidateArticleCache() {
  await invalidateCache([
    'articles:list:*',
    'movie:*',
    'public:homepage-unified',
    'public:unified-content:*',
    'public:category-counts',
    'public:recent-guides',
    'discover:*'
  ]);
}

/**
 * Invalidate cache after celebrity operations
 */
export async function invalidateCelebrityCache() {
  await invalidateCache([
    'celebrity:profile:*',
    'celebrities:list:*',
    'celebrities:top-10-richest',
    'public:homepage-unified',
    'public:celebrities',
    'public:category-counts'
  ]);
}

/**
 * Invalidate cache after trending data sync
 */
export async function invalidateTrendingCache() {
  await invalidateCache('trending:*');
}

/**
 * Invalidate cache after OTT data updates
 */
export async function invalidateOTTCache() {
  await invalidateCache([
    'ott:*',
    'public:unified-content:*'
  ]);
}

/**
 * Invalidate cache after box office updates
 */
export async function invalidateBoxOfficeCache() {
  await invalidateCache([
    'public:box-office:*',
    'public:homepage-unified',
    'public:unified-content:*'
  ]);
}

/**
 * Invalidate cache after discovery page generation
 */
export async function invalidateDiscoveryCache() {
  await invalidateCache('discover:*');
}

/**
 * Invalidate ALL cache (use sparingly - only for major updates)
 */
export { invalidateAllCache };

/**
 * Comprehensive invalidation for daily sync operations
 */
export async function invalidateDailySyncCache() {
  await invalidateCache([
    'articles:list:*',
    'movie:*',
    'celebrity:*',
    'celebrities:*',
    'trending:*',
    'ott:*',
    'public:*',
    'discover:*',
    'admin:stats'
  ]);
}

export default {
  invalidateArticleCache,
  invalidateCelebrityCache,
  invalidateTrendingCache,
  invalidateOTTCache,
  invalidateBoxOfficeCache,
  invalidateDiscoveryCache,
  invalidateAllCache,
  invalidateDailySyncCache
};
