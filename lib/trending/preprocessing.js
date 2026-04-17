// Trend Preprocessing & Entity Recognition Service
// Cleans, extracts keywords, and identifies entity types from trends
import { generateContent } from "../openai-helper";

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

/**
 * Entity recognition using AI
 */
async function identifyEntityWithAI(title, snippet) {
  try {
    const prompt = `Classify this trending topic from a movie news perspective:
    Title: ${title}
    Snippet: ${snippet || "N/A"}

    Identify:
    1. Entity Name (Movie title, Actor name, or Topic)
    2. Entity Type (Strictly one of: movie, actor, topic)
    3. Sentiment (Strictly one of: positive, negative, neutral)
    4. Keywords (3-5 comma-separated keywords)

    Respond ONLY with a valid JSON object in this format:
    {
      "name": "string",
      "type": "string",
      "sentiment": "string",
      "keywords": ["string"]
    }`;

    const text = await generateContent(prompt);
    if (text) {
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.warn("AI Entity recognition failed:", err.message);
  }
  return null;
}

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
  
  // Use Advanced AI for high-accuracy classification
  let entityType, confidence, finalKeywords, isRelevant, intent, cleanTitle;

  if (trend.title.split(' ').length >= 2) {
    try {
      const classification = await classifyTrendWithAdvancedAI(trend.title);
      
      // Map advanced classification to existing entityType structure
      // mapping: trending_movies -> movie, trending_actors -> actor, viral_topics -> topic
      const typeMapping = {
        "trending_movies": "movie",
        "trending_actors": "actor",
        "viral_topics": "topic",
        "irrelevant": "topic"
      };

      entityType = typeMapping[classification.type] || "topic";
      confidence = classification.confidence;
      isRelevant = classification.isRelevant;
      intent = classification.intent;
      cleanTitle = classification.cleanTitle;
      
      // Apply the strict confidence rule: if < 0.6 mark as irrelevant
      if (confidence < 0.6) {
        isRelevant = false;
        entityType = "topic";
      }

      // Extract final keywords from AI entities if available
      finalKeywords = [
        ...keywords,
        classification.entities.movie,
        classification.entities.actor
      ].filter(Boolean);

    } catch (err) {
      console.warn("Advanced AI Classification failed, falling back to heuristic:", err.message);
      entityType = detectEntityType(trend.title, keywords);
      confidence = calculateConfidence(trend.title, entityType, keywords);
      finalKeywords = keywords;
      isRelevant = confidence > 0.4;
    }
  } else {
    entityType = detectEntityType(trend.title, keywords);
    confidence = calculateConfidence(trend.title, entityType, keywords);
    finalKeywords = keywords;
    isRelevant = confidence > 0.4;
  }

  return {
    ...trend,
    coreTitle: cleanTitle || coreTitleWithAliases,
    keywords: [...new Set(finalKeywords)],
    entityType,
    classificationConfidence: confidence,
    isRelevant,
    intent: intent || "general",
    processedAt: new Date().toISOString()
  };
}

/**
 * Advanced AI Classification System (User's strict requirement)
 */
async function classifyTrendWithAdvancedAI(keyword) {
  const prompt = `You are an advanced movie trend intelligence system. 
 
 Your job is to analyze trending search keywords and classify them with HIGH accuracy. 
 
 --- 
 
 ## INPUT: 
 
 Keyword: "${keyword}" 
 
 --- 
 
 ## TASK: 
 
 1. Detect if the keyword is related to: 
 
    * Movies (films, box office, trailers, OTT releases) 
    * Actors / Celebrities (people from film industry) 
    * General entertainment topics 
    * OR completely unrelated (weather, politics, tech, etc.) 
 
 2. Convert non-English keywords (Hindi, Tamil, Telugu, Bengali, etc.) into English. 
 
 3. Extract entities: 
 
    * Movie name (if present) 
    * Actor name (if present) 
 
 4. Detect user intent: 
 
    * box_office 
    * trailer 
    * news 
    * general 
    * other 
 
 --- 
 
 ## STRICT CLASSIFICATION RULES: 
 
 * Only classify as "trending_movies" if: 
   → A specific movie is clearly identified 
 
 * Only classify as "trending_actors" if: 
   → A real actor/celebrity name is clearly identified 
 
 * Classify as "viral_topics" if: 
   → Related to entertainment BUT no exact movie/actor match 
 
 * Mark as "irrelevant" if: 
   → Not related to movies, actors, OTT, or entertainment 
 
 --- 
 
 ## IMPORTANT EDGE CASES: 
 
 * "Animal box office collection" 
   → trending_movies 
 
 * "Salman Khan news" 
   → trending_actors 
 
 * "best netflix movies 2026" 
   → viral_topics 
 
 * "pune temperature" 
   → irrelevant 
 
 * "एशा देओल" 
   → trending_actors (convert to English) 
 
 --- 
 
 ## CONFIDENCE RULE: 
 
 * Return confidence between 0 and 1 
 * If confidence < 0.6 → mark as irrelevant 
 
 --- 
 
 ## OUTPUT FORMAT (STRICT JSON ONLY): 
 
 { 
 "cleanTitle": "English version of the keyword", 
 "type": "trending_movies | trending_actors | viral_topics | irrelevant", 
 "isRelevant": true/false, 
 "confidence": 0-1, 
 "language": "detected language", 
 "entities": { 
 "movie": "extracted movie name or empty", 
 "actor": "extracted actor name or empty" 
 }, 
 "intent": "box_office | trailer | news | general | other" 
 } 
 
 --- 
 
 ## CRITICAL RULES: 
 
 * DO NOT guess unknown movies or actors 
 * DO NOT hallucinate 
 * If unsure → mark as irrelevant 
 * Be strict and accurate (not lenient) 
 * Always return valid JSON only 
 * No explanation, no extra text 
 
 --- 
 
 Now analyze the keyword.`;

  const text = await generateContent(prompt);
  if (!text) throw new Error("AI Content Generation failed");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in AI response");
  
  return JSON.parse(jsonMatch[0]);
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
