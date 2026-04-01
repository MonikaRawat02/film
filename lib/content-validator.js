/**
 * Content Quality Validator - Dynamic Page Generation
 * Validates AI-generated content for quality, SEO, and uniqueness
 */

/**
 * Calculate word count from content sections
 */
export function calculateWordCount(sections) {
  if (!sections || !Array.isArray(sections)) return 0;
  
  return sections.reduce((total, section) => {
    const headingWords = section.heading?.split(' ').length || 0;
    const contentWords = section.content?.split(' ').length || 0;
    return total + headingWords + contentWords;
  }, 0);
}

/**
 * Validate minimum word count (1200-2000 words required)
 */
export function validateWordCount(sections, minWords = 1200, maxWords = 2500) {
  const wordCount = calculateWordCount(sections);
  
  return {
    isValid: wordCount >= minWords,
    wordCount,
    isUnder: wordCount < minWords,
    isOver: wordCount > maxWords,
    message: wordCount < minWords 
      ? `Content too short: ${wordCount} words (minimum ${minWords})`
      : wordCount > maxWords
        ? `Content too long: ${wordCount} words (maximum ${maxWords})`
        : `Word count OK: ${wordCount} words`
  };
}

/**
 * Validate heading structure (H1 → H2 → H3 hierarchy)
 */
export function validateHeadingStructure(sections) {
  const issues = [];
  let hasH1 = false;
  let h2Count = 0;
  let h3Count = 0;
  
  sections.forEach((section, index) => {
    const heading = section.heading || '';
    
    // Check for H1 (should be first/main heading)
    if (index === 0 && !heading.includes('#')) {
      // First section should be introduction/H1
      hasH1 = true;
    }
    
    // Count heading levels
    if (heading.startsWith('## ')) h2Count++;
    if (heading.startsWith('### ')) h3Count++;
    
    // Check for empty headings
    if (!heading.trim()) {
      issues.push({
        type: 'empty_heading',
        section: index,
        message: `Section ${index + 1} has empty heading`
      });
    }
    
    // Check for heading-only sections (no content)
    if (heading && (!section.content || section.content.trim().length === 0)) {
      issues.push({
        type: 'heading_only',
        section: index,
        message: `Heading "${heading}" has no content`
      });
    }
  });
  
  return {
    isValid: issues.length === 0 && hasH1 && h2Count >= 2,
    hasH1,
    h2Count,
    h3Count,
    issues,
    message: issues.length === 0 
      ? 'Heading structure valid' 
      : `${issues.length} heading issues found`
  };
}

/**
 * Analyze keyword density for SEO
 */
export function analyzeKeywordDensity(sections, targetKeywords = []) {
  if (!sections || sections.length === 0) {
    return { isValid: false, message: 'No content to analyze' };
  }
  
  const fullText = sections
    .map(s => `${s.heading} ${s.content}`)
    .join(' ')
    .toLowerCase();
  
  const totalWords = fullText.split(/\s+/).filter(w => w.length > 0).length;
  const keywordAnalysis = [];
  
  targetKeywords.forEach(keyword => {
    // Ensure keyword is a string and not empty
    if (!keyword || typeof keyword !== 'string') return;
    
    const keywordLower = keyword.toLowerCase().trim();
    
    // Skip if keyword is too short or empty after trim
    if (keywordLower.length < 2) return;
    
    const regex = new RegExp(`\\b${keywordLower}\\b`, 'g');
    const matches = fullText.match(regex) || [];
    const count = matches.length;
    const density = totalWords > 0 ? (count / totalWords) * 100 : 0;
    
    keywordAnalysis.push({
      keyword,
      count,
      density: density.toFixed(2),
      isOptimal: density >= 0.5 && density <= 2.5,
      recommendation: density < 0.5 
        ? `Increase usage of "${keyword}" (currently ${density.toFixed(2)}%)`
        : density > 2.5
          ? `Reduce usage of "${keyword}" (currently ${density.toFixed(2)}%)`
          : null
    });
  });
  
  const optimalCount = keywordAnalysis.filter(k => k.isOptimal).length;
  
  return {
    isValid: optimalCount >= targetKeywords.length * 0.5,
    totalWords,
    keywords: keywordAnalysis,
    optimalCount,
    message: `${optimalCount}/${targetKeywords.length} keywords optimally dense`
  };
}

/**
 * Verify FAQ section exists and is properly formatted
 */
export function verifyFAQSection(sections) {
  const faqSection = sections.find(s => 
    s.heading.toLowerCase().includes('faq') ||
    s.heading.toLowerCase().includes('frequently asked questions')
  );
  
  if (!faqSection) {
    return {
      isValid: false,
      hasFAQ: false,
      message: 'No FAQ section found'
    };
  }
  
  // Check for question patterns
  const content = faqSection.content || '';
  const questionPattern = /\?/g;
  const questions = content.match(questionPattern);
  const questionCount = questions ? questions.length : 0;
  
  return {
    isValid: questionCount >= 3,
    hasFAQ: true,
    questionCount,
    message: questionCount >= 3 
      ? `FAQ section valid with ${questionCount} questions`
      : `FAQ section has only ${questionCount} questions (minimum 3)`
  };
}

/**
 * Check for internal links in content
 */
export function verifyInternalLinks(sections, movieData) {
  const fullText = sections
    .map(s => `${s.heading} ${s.content}`)
    .join(' ');
  
  const internalLinkPatterns = [
    /\/movie\//g,
    /\/celebrity\//g,
    /\/category\//g,
    /\/discover\//g,
    /\/ott\//g
  ];
  
  let linkCount = 0;
  const foundLinks = [];
  
  internalLinkPatterns.forEach(pattern => {
    const matches = fullText.match(pattern) || [];
    linkCount += matches.length;
    foundLinks.push(...matches);
  });
  
  // Also check if cast members are mentioned (potential linking opportunities)
  const castMentions = movieData.cast?.filter(actor => 
    fullText.toLowerCase().includes(actor.name?.toLowerCase())
  ) || [];
  
  return {
    isValid: linkCount >= 2 || castMentions.length >= 1,
    linkCount,
    castMentions: castMentions.length,
    message: linkCount >= 2
      ? `Found ${linkCount} internal linking opportunities`
      : castMentions.length >= 1
        ? `Found ${castMentions.length} cast mentions (add links)`
        : 'No internal linking opportunities found'
  };
}

/**
 * Detect duplicate content by comparing with existing articles
 */
export async function detectDuplicateContent(newSections, existingArticles, similarityThreshold = 0.7) {
  if (!existingArticles || existingArticles.length === 0) {
    return { isDuplicate: false, similarArticles: [] };
  }
  
  const newText = newSections
    .map(s => s.content)
    .join(' ')
    .toLowerCase();
  
  const similarArticles = [];
  
  for (const article of existingArticles) {
    const existingText = (article.sections || [])
      .map(s => s.content)
      .join(' ')
      .toLowerCase();
    
    const similarity = calculateTextSimilarity(newText, existingText);
    
    if (similarity >= similarityThreshold) {
      similarArticles.push({
        slug: article.slug,
        title: article.movieTitle,
        similarity: (similarity * 100).toFixed(2),
        matchLevel: similarity >= 0.9 ? 'High' : similarity >= 0.8 ? 'Medium' : 'Low'
      });
    }
  }
  
  return {
    isDuplicate: similarArticles.length > 0,
    similarArticles,
    message: similarArticles.length > 0
      ? `Found ${similarArticles.length} potentially duplicate articles`
      : 'No duplicate content detected'
  };
}

/**
 * Simple text similarity using Jaccard Index
 */
function calculateTextSimilarity(text1, text2) {
  const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 3));
  
  const intersection = [...words1].filter(w => words2.has(w));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Validate canonical URL structure
 */
export function validateCanonicalURL(slug, pageType) {
  const baseSlug = slug.replace(/-ending-explained|-box-office|-budget|-ott-release|-cast|-review-analysis|-hit-or-flop$/, '');
  
  const expectedPatterns = [
    `/movie/${slug}`,
    `/movie/${baseSlug}/ending-explained`,
    `/movie/${baseSlug}/box-office`,
    `/movie/${baseSlug}/budget`,
    `/movie/${baseSlug}/ott-release`,
    `/movie/${baseSlug}/cast`,
    `/movie/${baseSlug}/review-analysis`,
    `/movie/${baseSlug}/hit-or-flop`
  ];
  
  const isValid = expectedPatterns.some(pattern => 
    pattern === `/movie/${slug}` || pattern.includes(pageType)
  );
  
  return {
    isValid,
    expectedURL: `/movie/${slug}`,
    message: isValid ? 'Canonical URL structure valid' : 'Invalid canonical URL structure'
  };
}

/**
 * Comprehensive content quality report
 */
export function generateQualityReport(sections, movieData, options = {}) {
  const {
    minWords = 1200,
    maxWords = 2500,
    targetKeywords = [],
    requireFAQ = true,
    requireInternalLinks = true,
    checkDuplicates = false,
    existingArticles = null
  } = options;
  
  // Run all validations
  const wordCountValidation = validateWordCount(sections, minWords, maxWords);
  const headingValidation = validateHeadingStructure(sections);
  const keywordAnalysis = targetKeywords.length > 0 ? analyzeKeywordDensity(sections, targetKeywords) : null;
  const faqValidation = requireFAQ ? verifyFAQSection(sections) : null;
  const linksValidation = requireInternalLinks ? verifyInternalLinks(sections, movieData) : null;
  
  // Calculate overall quality score
  let passedChecks = 0;
  let totalChecks = 0;
  const issues = [];
  
  if (wordCountValidation.isValid) passedChecks++;
  else issues.push(wordCountValidation.message);
  totalChecks++;
  
  if (headingValidation.isValid) passedChecks++;
  else issues.push(...headingValidation.issues.map(i => i.message));
  totalChecks++;
  
  if (keywordAnalysis && keywordAnalysis.isValid) passedChecks++;
  else if (keywordAnalysis) issues.push(keywordAnalysis.message);
  if (keywordAnalysis) totalChecks++;
  
  if (faqValidation && faqValidation.isValid) passedChecks++;
  else if (faqValidation) issues.push(faqValidation.message);
  if (faqValidation) totalChecks++;
  
  if (linksValidation && linksValidation.isValid) passedChecks++;
  else if (linksValidation) issues.push(linksValidation.message);
  if (linksValidation) totalChecks++;
  
  const qualityScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
  
  return {
    isValid: qualityScore >= 70,
    qualityScore,
    passedChecks,
    totalChecks,
    issues,
    wordCount: wordCountValidation.wordCount,
    headingStructure: {
      hasH1: headingValidation.hasH1,
      h2Count: headingValidation.h2Count,
      h3Count: headingValidation.h3Count
    },
    keywordDensity: keywordAnalysis,
    hasFAQ: faqValidation?.hasFAQ || false,
    internalLinks: linksValidation?.linkCount || 0,
    recommendations: generateRecommendations(sections, movieData, {
      wordCount: wordCountValidation,
      heading: headingValidation,
      keywords: keywordAnalysis,
      faq: faqValidation,
      links: linksValidation
    })
  };
}

/**
 * Generate improvement recommendations
 */
function generateRecommendations(sections, movieData, validations) {
  const recommendations = [];
  
  if (validations.wordCount?.isUnder) {
    recommendations.push({
      priority: 'high',
      type: 'content',
      message: `Expand content by ${1200 - validations.wordCount.wordCount} words to meet minimum requirements`
    });
  }
  
  if (!validations.heading?.hasH1) {
    recommendations.push({
      priority: 'medium',
      type: 'structure',
      message: 'Add a clear main heading (H1) at the beginning'
    });
  }
  
  if (validations.heading?.h2Count < 2) {
    recommendations.push({
      priority: 'medium',
      type: 'structure',
      message: 'Add more H2 subheadings to improve content structure'
    });
  }
  
  if (validations.keywords && !validations.keywords.isValid) {
    recommendations.push({
      priority: 'low',
      type: 'seo',
      message: 'Optimize keyword density for better SEO'
    });
  }
  
  if (validations.faq && !validations.faq.isValid) {
    recommendations.push({
      priority: 'medium',
      type: 'seo',
      message: 'Add FAQ section with at least 3 questions'
    });
  }
  
  if (validations.links && !validations.links.isValid) {
    recommendations.push({
      priority: 'low',
      type: 'linking',
      message: 'Add more internal links to related content'
    });
  }
  
  return recommendations;
}

/**
 * Main validation function - use this in your API
 */
export async function validateContentQuality(sections, movieData, options = {}) {
  try {
    const report = generateQualityReport(sections, movieData, options);
    
    return {
      success: true,
      ...report,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Content validation error:', error);
    return {
      success: false,
      error: error.message,
      isValid: false
    };
  }
}
