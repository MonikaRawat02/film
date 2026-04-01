/**
 * Broken Link Checker Script
 * Scans all articles and discovery pages for broken internal and external links
 * 
 * Usage: node scripts/check-broken-links.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fetch = require('node-fetch');

const MONGODB_URI = process.env.MONGODB_URI;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Results storage
const brokenLinks = [];
const checkedUrls = new Map(); // Cache for already checked URLs
const stats = {
  totalLinksChecked: 0,
  internalLinks: 0,
  externalLinks: 0,
  brokenInternalLinks: 0,
  brokenExternalLinks: 0,
  articlesScanned: 0,
};

/**
 * Check if a URL is accessible
 */
async function checkUrl(url, retries = 2) {
  // Return cached result if already checked
  if (checkedUrls.has(url)) {
    return checkedUrls.get(url);
  }

  const result = {
    url,
    isAccessible: false,
    statusCode: null,
    error: null,
  };

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, {
        method: 'HEAD', // Use HEAD to avoid downloading content
        signal: controller.signal,
        headers: {
          'User-Agent': 'FilmyFire-LinkChecker/1.0',
        },
        redirect: 'follow',
      });

      clearTimeout(timeout);

      result.statusCode = response.status;
      result.isAccessible = response.ok;

      if (response.ok) {
        break; // Success, no need to retry
      }
    } catch (error) {
      result.error = error.message;
      
      // Wait before retry
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Cache the result
  checkedUrls.set(url, result);
  return result;
}

/**
 * Extract links from content
 */
function extractLinks(content) {
  if (!content || typeof content !== 'string') return [];

  const links = [];

  // Match href attributes
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    links.push(match[1]);
  }

  // Match src attributes (images)
  const srcRegex = /src=["']([^"']+)["']/gi;
  while ((match = srcRegex.exec(content)) !== null) {
    if (match[1].startsWith('http') || match[1].startsWith('/')) {
      links.push(match[1]);
    }
  }

  return [...new Set(links)]; // Remove duplicates
}

/**
 * Extract links from sections array
 */
function extractLinksFromSections(sections) {
  if (!sections || !Array.isArray(sections)) return [];

  const links = [];
  for (const section of sections) {
    if (section.content) {
      links.push(...extractLinks(section.content));
    }
  }
  return [...new Set(links)];
}

/**
 * Normalize URL
 */
function normalizeUrl(url, baseUrl = BASE_URL) {
  if (!url) return null;

  // Skip mailto, tel, javascript links
  if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('javascript:')) {
    return null;
  }

  // Skip anchor links
  if (url.startsWith('#')) {
    return null;
  }

  // Convert relative URLs to absolute
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`;
  }

  // Return absolute URLs as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return null;
}

/**
 * Check if URL is internal
 */
function isInternalUrl(url) {
  try {
    const urlObj = new URL(url);
    const baseObj = new URL(BASE_URL);
    return urlObj.hostname === baseObj.hostname;
  } catch {
    return false;
  }
}

/**
 * Scan an article for broken links
 */
async function scanArticle(article) {
  const links = [];

  // Extract links from content
  if (article.sections) {
    links.push(...extractLinksFromSections(article.sections));
  }

  // Extract links from pSEO content
  const pSEOFields = [
    'pSEO_Content_ending_explained',
    'pSEO_Content_box_office',
    'pSEO_Content_budget',
    'pSEO_Content_ott_release',
    'pSEO_Content_cast',
    'pSEO_Content_review_analysis',
    'pSEO_Content_hit_or_flop',
    'pSEO_Content_overview',
  ];

  for (const field of pSEOFields) {
    if (article[field]) {
      links.push(...extractLinksFromSections(article[field]));
    }
  }

  // Check related movies links
  if (article.relatedMovies) {
    for (const movie of article.relatedMovies) {
      if (movie.slug) {
        links.push(`/category/${article.category?.toLowerCase() || 'hollywood'}/${movie.slug}`);
      }
    }
  }

  // Check each link
  for (const rawUrl of links) {
    const url = normalizeUrl(rawUrl);
    if (!url) continue;

    stats.totalLinksChecked++;
    const isInternal = isInternalUrl(url);

    if (isInternal) {
      stats.internalLinks++;
    } else {
      stats.externalLinks++;
    }

    const result = await checkUrl(url);

    if (!result.isAccessible) {
      const brokenLink = {
        sourceType: 'article',
        sourceSlug: article.slug,
        sourceTitle: article.movieTitle || article.title,
        url,
        isInternal,
        statusCode: result.statusCode,
        error: result.error,
      };

      brokenLinks.push(brokenLink);

      if (isInternal) {
        stats.brokenInternalLinks++;
      } else {
        stats.brokenExternalLinks++;
      }

      console.log(`  ❌ Broken: ${url} (${result.statusCode || result.error})`);
    }
  }
}

/**
 * Main function
 */
async function checkBrokenLinks() {
  console.log('🔍 FilmyFire Broken Link Checker');
  console.log('='.repeat(50));
  console.log(`Base URL: ${BASE_URL}\n`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Scan articles
    console.log('📚 Scanning ARTICLES collection...');
    const articles = await db.collection('articles')
      .find({ status: 'published' })
      .project({
        slug: 1,
        movieTitle: 1,
        title: 1,
        category: 1,
        sections: 1,
        relatedMovies: 1,
        pSEO_Content_ending_explained: 1,
        pSEO_Content_box_office: 1,
        pSEO_Content_budget: 1,
        pSEO_Content_ott_release: 1,
        pSEO_Content_cast: 1,
        pSEO_Content_review_analysis: 1,
        pSEO_Content_hit_or_flop: 1,
        pSEO_Content_overview: 1,
      })
      .toArray();

    console.log(`Found ${articles.length} published articles\n`);

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      stats.articlesScanned++;

      if (i % 10 === 0) {
        console.log(`Progress: ${i + 1}/${articles.length} articles scanned...`);
      }

      await scanArticle(article);

      // Add delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Scan discovery pages
    console.log('\n🔍 Scanning DISCOVERY PAGES...');
    const discoveryPages = await db.collection('discoverypages')
      .find({ status: 'published' })
      .project({ slug: 1, title: 1, sections: 1, movies: 1 })
      .toArray();

    console.log(`Found ${discoveryPages.length} discovery pages\n`);

    for (const page of discoveryPages) {
      // Check movie links in discovery pages
      if (page.movies) {
        for (const movie of page.movies) {
          if (movie.slug) {
            const url = normalizeUrl(`/category/hollywood/${movie.slug}`);
            if (url) {
              stats.totalLinksChecked++;
              stats.internalLinks++;

              const result = await checkUrl(url);
              if (!result.isAccessible) {
                brokenLinks.push({
                  sourceType: 'discovery',
                  sourceSlug: page.slug,
                  sourceTitle: page.title,
                  url,
                  isInternal: true,
                  statusCode: result.statusCode,
                  error: result.error,
                });
                stats.brokenInternalLinks++;
              }
            }
          }
        }
      }
    }

    // Print results
    console.log('\n' + '='.repeat(50));
    console.log('📊 LINK CHECK RESULTS');
    console.log('='.repeat(50));
    console.log(`\nArticles Scanned: ${stats.articlesScanned}`);
    console.log(`Total Links Checked: ${stats.totalLinksChecked}`);
    console.log(`  - Internal Links: ${stats.internalLinks}`);
    console.log(`  - External Links: ${stats.externalLinks}`);
    console.log(`\n🔴 BROKEN LINKS:`);
    console.log(`  - Internal: ${stats.brokenInternalLinks}`);
    console.log(`  - External: ${stats.brokenExternalLinks}`);
    console.log(`  - Total: ${brokenLinks.length}`);

    if (brokenLinks.length > 0) {
      console.log('\n📋 BROKEN LINKS DETAILS:');
      console.log('-'.repeat(50));

      // Group by source
      const groupedBySource = {};
      for (const link of brokenLinks) {
        const key = `${link.sourceType}:${link.sourceSlug}`;
        if (!groupedBySource[key]) {
          groupedBySource[key] = {
            sourceType: link.sourceType,
            sourceSlug: link.sourceSlug,
            sourceTitle: link.sourceTitle,
            links: [],
          };
        }
        groupedBySource[key].links.push({
          url: link.url,
          isInternal: link.isInternal,
          statusCode: link.statusCode,
          error: link.error,
        });
      }

      for (const [key, data] of Object.entries(groupedBySource)) {
        console.log(`\n📄 ${data.sourceType.toUpperCase()}: ${data.sourceTitle || data.sourceSlug}`);
        for (const link of data.links) {
          const type = link.isInternal ? '🔗 Internal' : '🌐 External';
          const status = link.statusCode ? `Status: ${link.statusCode}` : link.error;
          console.log(`   ${type}: ${link.url}`);
          console.log(`      └─ ${status}`);
        }
      }

      // Save results to file
      const fs = require('fs');
      const reportPath = './broken-links-report.json';
      fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        stats,
        brokenLinks,
      }, null, 2));
      console.log(`\n📁 Full report saved to: ${reportPath}`);
    } else {
      console.log('\n✅ No broken links found! Your site is healthy.');
    }

    console.log('\n' + '='.repeat(50));

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
checkBrokenLinks();
