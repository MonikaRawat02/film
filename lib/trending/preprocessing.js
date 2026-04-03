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

const ENTITY_KEYWORDS = {
  movie: ["movie", "film", "trailer", "cinema", "box office", "release", "premiere", "blockbuster", "teaser"],
  actor: ["actor", "actress", "star", "celebrity", "hero", "heroine", "director", "producer"],
  topic: ["trending", "viral", "news", "update", "announcement", "launch", "event", "controversy"]
};

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/**
 * Clean and normalize text (User's requirement #2)
 */
export function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // Remove special characters
    .replace(/\s+/g, " ")     // Normalize whitespace
    .trim();
}

/**
 * Extract keywords from text (User's requirement #2)
 */
export function extractKeywords(text) {
  const cleaned = cleanText(text);
  const words = cleaned.split(" ");
  
  return words
    .filter(word => word.length > 2 && !STOP_WORDS.has(word))
    .map(word => word.trim());
}

/**
 * Detect entity type using keyword matching (User's requirement #3)
 */
export function detectEntityType(title, keywords) {
  const titleLower = title.toLowerCase();
  
  // Score each category
  let scores = {
    movie: 0,
    actor: 0,
    topic: 0
  };

  // Check title against entity keywords
  ENTITY_KEYWORDS.movie.forEach(keyword => {
    if (titleLower.includes(keyword)) scores.movie += 2;
  });

  ENTITY_KEYWORDS.actor.forEach(keyword => {
    if (titleLower.includes(keyword)) scores.actor += 2;
  });

  ENTITY_KEYWORDS.topic.forEach(keyword => {
    if (titleLower.includes(keyword)) scores.topic += 1;
  });

  // Check extracted keywords
  keywords.forEach(keyword => {
    if (ENTITY_KEYWORDS.movie.includes(keyword)) scores.movie += 1;
    if (ENTITY_KEYWORDS.actor.includes(keyword)) scores.actor += 1;
    if (ENTITY_KEYWORDS.topic.includes(keyword)) scores.topic += 1;
  });

  // Return highest scoring category
  const maxScore = Math.max(scores.movie, scores.actor, scores.topic);
  
  if (maxScore === 0) return "topic"; // Default to topic
  
  return Object.keys(scores).find(key => scores[key] === maxScore);
}

/**
 * Use AI to classify trend entity (User's requirement #3 - NLP/AI model)
 */
export async function classifyTrendWithAI(trend) {
  if (!genAI) {
    // Fallback to keyword-based classification
    const keywords = extractKeywords(trend.title);
    const entityType = detectEntityType(trend.title, keywords);
    
    return {
      entityType,
      keywords,
      confidence: 0.6
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Analyze this trending topic and classify it for a movie news platform:

**Trend Title:** ${trend.title}
**Source:** ${trend.source}

**Task:**
1. Extract 3-5 relevant keywords
2. Classify the entity type as one of:
   - "movie" (films, trailers, box office)
   - "actor" (celebrities, directors, producers)
   - "topic" (general entertainment news, viral topics)

Respond ONLY with JSON:
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
  } catch (error) {
    console.error("AI classification error:", error.message);
    const keywords = extractKeywords(trend.title);
    return {
      entityType: detectEntityType(trend.title, keywords),
      keywords,
      confidence: 0.6
    };
  }
}

/**
 * Preprocess trend: clean, extract keywords, classify
 */
export async function preprocessTrend(trend) {
  const keywords = extractKeywords(trend.title);
  
  // Use AI for better accuracy if title is substantial
  let classification = null;
  if (trend.title.split(' ').length >= 3) {
    classification = await classifyTrendWithAI(trend);
  } else {
    classification = {
      entityType: detectEntityType(trend.title, keywords),
      keywords,
      confidence: 0.7
    };
  }

  return {
    ...trend,
    keywords: classification.keywords,
    entityType: classification.entityType,
    classificationConfidence: classification.confidence,
    processedAt: new Date().toISOString()
  };
}

export default {
  cleanText,
  extractKeywords,
  detectEntityType,
  classifyTrendWithAI,
  preprocessTrend
};
