// Trend Preprocessing & Entity Recognition Service
// Cleans, extracts keywords, and identifies entity types from trends
import { GoogleGenerativeAI } from "@google/generative-ai";

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "must", "shall", "can", "need",
  "dare", "ought", "used", "it", "its", "this", "that", "these", "those",
  "i", "you", "he", "she", "we", "they", "what", "which", "who", "whom",
  "whose", "where", "when", "why", "how", "all", "each", "every", "both",
  "few", "more", "most", "other", "some", "such", "no", "nor", "not",
  "only", "own", "same", "so", "than", "too", "very", "just", "also"
]);

const NOISE_WORDS = [
  "official trailer", "teaser", "full movie", "hd", "202[0-9]", "lyric video", 
  "video song", "lyrical", "trailer", "teaser", "promo", "exclusive", "first look",
  "review", "leaked", "climax", "scene", "song", "album", "music video"
];

const ALIAS_MAP = {
  "srk": "shah rukh khan",
  "salman": "salman khan",
  "rk": "ranbir kapoor",
  "akshay": "akshay kumar",
  "hrithik": "hrithik roshan",
  "aamir": "aamir khan",
  "ranveer": "ranveer singh",
  "alia": "alia bhatt",
  "deepika": "deepika padukone",
  "kiara": "kiara advani",
  "vicky": "vicky kaushal"
};

const ENTITY_MARKERS = {
  movie: ["movie", "film", "trailer", "cinema", "box office", "release", "premiere", "blockbuster", "teaser", "sequel", "prequel", "ott", "bollywood", "hollywood"],
  actor: ["actor", "actress", "star", "celebrity", "hero", "heroine", "director", "producer", "cast", "starrer", "khan", "kumar", "singh", "sharma", "verma", "patel", "nair"],
  topic: ["trending", "viral", "news", "update", "announcement", "launch", "event", "controversy", "wedding", "rumor", "breakup", "shorts", "comedy", "funny"]
};

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/**
 * Enhanced title cleaning for movie/actor matching
 */
export function getCoreTitle(title) {
  if (!title) return "";
  
  // 1. Initial cleanup: lowercase and normalize whitespace
  let clean = title.toLowerCase().replace(/\s+/g, ' ').trim();

  // 2. Remove noise words
  NOISE_WORDS.forEach(noise => {
    const regex = new RegExp(noise, 'gi');
    clean = clean.replace(regex, '');
  });
  
  // 3. Split by common separators and take the first part (usually the movie name)
  const separators = ['|', '-', ':', '–', '—'];
  for (const sep of separators) {
    if (clean.includes(sep)) {
      const parts = clean.split(sep);
      // Only take the first part if it's substantial (at least 3 chars)
      if (parts[0].trim().length >= 3) {
        clean = parts[0];
        break;
      }
    }
  }
  
  return clean.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Handle aliases for entity names
 */
export function handleAliases(text) {
  let processed = text.toLowerCase();
  Object.entries(ALIAS_MAP).forEach(([alias, fullName]) => {
    const regex = new RegExp(`\\b${alias}\\b`, 'gi');
    processed = processed.replace(regex, fullName);
  });
  return processed;
}

/**
 * Clean and normalize text
 */
export function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text) {
  const cleaned = cleanText(text);
  const words = cleaned.split(" ");
  
  return words
    .filter(word => word.length > 2 && !STOP_WORDS.has(word))
    .map(word => word.trim());
}

/**
 * Detect entity type using keyword matching and patterns
 */
export function detectEntityType(title, keywords) {
  const titleLower = title.toLowerCase();
  const coreTitle = getCoreTitle(title);
  
  let scores = { movie: 0, actor: 0, topic: 0 };

  // 1. Check title and coreTitle against markers
  Object.entries(ENTITY_MARKERS).forEach(([type, markers]) => {
    markers.forEach(marker => {
      if (titleLower.includes(marker)) scores[type] += 2;
      if (coreTitle.includes(marker)) scores[type] += 1;
    });
  });

  // 2. Check keywords
  keywords.forEach(keyword => {
    Object.entries(ENTITY_MARKERS).forEach(([type, markers]) => {
      if (markers.includes(keyword)) scores[type] += 1;
    });
  });

  // 3. Pattern detection (Requirement #2.D/E)
  if (/\d{4}/.test(title)) scores.movie += 1; // Year detection
  if (coreTitle.split(' ').length >= 2 && coreTitle.split(' ').length <= 4) {
    // Possible actor name pattern (2-3 words)
    scores.actor += 1;
  }

  const maxScore = Math.max(scores.movie, scores.actor, scores.topic);
  if (maxScore === 0) return "topic";
  
  return Object.keys(scores).find(key => scores[key] === maxScore);
}

/**
 * Calculate confidence score for the classification
 */
export function calculateConfidence(title, entityType, keywords) {
  const titleLower = title.toLowerCase();
  const coreTitle = getCoreTitle(title);
  let confidence = 0.5; // Base confidence

  // Boost based on marker matches
  const markers = ENTITY_MARKERS[entityType] || [];
  markers.forEach(marker => {
    if (titleLower.includes(marker)) confidence += 0.1;
  });

  // Boost based on core title length and cleanliness
  if (coreTitle.length > 5 && coreTitle.length < 30) confidence += 0.1;
  
  // Boost if keywords match entity type markers
  const keywordMatches = keywords.filter(k => markers.includes(k)).length;
  confidence += keywordMatches * 0.05;

  // Source-based boost
  if (titleLower.includes("official")) confidence += 0.1;

  return Math.min(confidence, 1.0);
}

/**
 * Preprocess trend: clean, extract keywords, classify
 */
export async function preprocessTrend(trend) {
  const coreTitle = getCoreTitle(trend.title);
  const coreTitleWithAliases = handleAliases(coreTitle);
  const keywords = extractKeywords(trend.title);
  
  // Use AI for better accuracy if title is substantial and we have GEMINI_API_KEY
  let entityType, confidence, finalKeywords;

  if (genAI && trend.title.split(' ').length >= 3) {
    try {
      const classification = await classifyTrendWithAI(trend);
      entityType = classification.entityType;
      confidence = classification.confidence;
      finalKeywords = classification.keywords;
    } catch (err) {
      console.warn("AI Classification failed, falling back to heuristic:", err.message);
      entityType = detectEntityType(trend.title, keywords);
      confidence = calculateConfidence(trend.title, entityType, keywords);
      finalKeywords = keywords;
    }
  } else {
    entityType = detectEntityType(trend.title, keywords);
    confidence = calculateConfidence(trend.title, entityType, keywords);
    finalKeywords = keywords;
  }

  return {
    ...trend,
    coreTitle: coreTitleWithAliases,
    keywords: finalKeywords,
    entityType,
    classificationConfidence: confidence,
    processedAt: new Date().toISOString()
  };
}

/**
 * Use AI to classify trend entity (User's requirement #3 - NLP/AI model)
 */
async function classifyTrendWithAI(trend) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Analyze this trending topic for an entertainment news platform:

**Trend Title:** ${trend.title}
**Source:** ${trend.source}

**Task:**
1. Extract 3-5 relevant keywords.
2. Identify if this is about a "movie", "actor", or a general entertainment "topic".
3. Return a confidence score between 0 and 1.

Respond ONLY with valid JSON:
{
  "keywords": ["keyword1", "keyword2"],
  "entityType": "movie|actor|topic",
  "confidence": 0.95
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found");
  const parsed = JSON.parse(jsonMatch[0]);
  
  return {
    entityType: parsed.entityType || "topic",
    keywords: parsed.keywords || [],
    confidence: parsed.confidence || 0.5
  };
}

export default {
  getCoreTitle,
  handleAliases,
  cleanText,
  extractKeywords,
  detectEntityType,
  calculateConfidence,
  preprocessTrend
};
