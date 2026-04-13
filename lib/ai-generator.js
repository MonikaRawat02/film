// import OpenAI from "openai";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

// const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// function clean(text) {
//   if (!text) return "";
//   return text.replace(/\r/g, "").replace(/^```(?:markdown|md)?/i, "").replace(/```$/i, "").trim();
// }

// function splitByH2(content) {
//   const lines = content.split("\n");
//   const sections = [];
//   let current = null;
//   for (const raw of lines) {
//     const line = raw.trimEnd();
//     if (/^##\s+/.test(line)) {
//       if (current) sections.push({ heading: current.heading.trim(), content: current.content.trim() });
//       current = { heading: line.replace(/^##\s+/, ""), content: "" };
//     } else if (current) {
//       current.content += (current.content ? "\n" : "") + line;
//     }
//   }
//   if (current) sections.push({ heading: current.heading.trim(), content: current.content.trim() });
//   return sections;
// }

// function extractFaqs(content) {
//   const sections = splitByH2(content);
//   const faq = sections.find((s) => /faq/i.test(s.heading));
//   if (!faq) return [];
//   const lines = faq.content.split("\n").map((l) => l.trim()).filter(Boolean);
//   const faqs = [];
//   let q = null;
//   for (const line of lines) {
//     const qm = line.match(/^Q\s*:?\s*(.+)/i);
//     const am = line.match(/^A\s*:?\s*(.+)/i);
//     if (qm) {
//       if (q && q.answer) faqs.push(q);
//       q = { question: qm[1].trim(), answer: "" };
//     } else if (am) {
//       if (!q) q = { question: "", answer: "" };
//       q.answer = (q.answer ? q.answer + " " : "") + am[1].trim();
//     } else if (q) {
//       q.answer = (q.answer ? q.answer + " " : "") + line;
//     }
//   }
//   if (q && q.answer) faqs.push(q);
//   return faqs;
// }

// function wc(text) {
//   return text.split(/\s+/).filter(Boolean).length;
// }

// function buildMeta(title, year, type, content) {
//   const baseTitle = `${title} ${year ? `(${year})` : ""} ${type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`;
//   const description = content.split("\n").find((l) => l.trim().length > 100) || content.substring(0, 150);
//   return {
//     title: baseTitle,
//     description: description.substring(0, 150) + "..."
//   };
// }

// const overview = `H1: {movie_name} Movie (Year) – Full Analysis

// Introduction (150–200 words)

// H2: Movie Overview
// H2: Plot Summary
// H2: Ending Explained
// H2: Box Office Collection
// H2: Budget & Profit
// H2: OTT Release Details
// H2: Cast & Characters
// H2: Audience Reaction

// FAQ Section (3–5 Q&A)`;

// const ending = `H1: {movie_name} Ending Explained – Deep Analysis & Hidden Meanings

// Introduction (150–200 words)

// H2: The Final Sequence Breakdown
// H2: Themes and Symbolism
// H2: Character Resolutions
// H2: Unanswered Questions

// FAQ Section (3–5 Q&A)`;

// const boxOffice = `H1: {movie_name} Box Office Collection – Worldwide Revenue & Verdict

// Introduction (150–200 words)

// H2: Theatrical Run Timeline
// H2: Domestic vs International Performance
// H2: Budget vs Collection Analysis
// H2: Final Verdict (Hit/Flop)

// FAQ Section (3–5 Q&A)`;

// const budget = `H1: {movie_name} Movie Budget – Production Costs & Profit Analysis

// Introduction (150–200 words)

// H2: Production Cost Breakdown
// H2: Cast & Crew Salaries
// H2: Marketing & Distribution Costs
// H2: Profitability Analysis

// FAQ Section (3–5 Q&A)`;

// const ottSec = `H1: {movie_name} OTT Release Date – Streaming Platform & Rights

// Introduction (150–200 words)

// H2: Digital Rights and Platform
// H2: Theatrical to OTT Window
// H2: Satellite Rights Details
// H2: Audience Response on OTT

// FAQ Section (3–5 Q&A)`;

// const castSec = `H1: {movie_name} Cast & Characters – Performance Analysis

// Introduction (150–200 words)

// H2: Lead Performances Breakdown
// H2: Supporting Cast Highlights
// H2: Character Arc Analysis
// H2: Casting Decisions and Impact

// FAQ Section (3–5 Q&A)`;

// const review = `H1: {movie_name} Review Analysis – Critical Response & Audience Reaction

// Introduction (150–200 words)

// H2: Critical Consensus
// H2: Audience Reception
// H2: Technical Aspects (Direction, Cinematography)
// H2: Final Score & Recommendation

// FAQ Section (3–5 Q&A)`;

// const verdict = `H1: {movie_name} Hit or Flop – Final Verdict & Performance Analysis

// Introduction (150–200 words)

// H2: Commercial Expectations
// H2: Box Office vs Budget Comparison
// H2: Recovery and Profit Analysis
// H2: Final Industry Verdict

// FAQ Section (3–5 Q&A)`;

// const map = {
//   overview,
//   "ending-explained": ending,
//   "box-office": boxOffice,
//   budget,
//   "ott-release": ottSec,
//   cast: castSec,
//   "review-analysis": review,
//   "hit-or-flop": verdict
// };

// function promptFor(movieData, type) {
//   const { movieTitle, releaseYear, genres = [], director = [] } = movieData;
//   const yearStr = releaseYear ? `(${releaseYear})` : "";
//   const base = map[type]
//     .replace(/{movie_name}/g, movieTitle || movieData.title)
//     .replace(/{year}/g, yearStr);

//   const target = type === "overview" ? "1500-2000" : "800-1400";
//   const head = `Movie: ${movieTitle} ${yearStr}
// Genres: ${genres.join("/") || "Drama"}
// Director: ${director.join(", ") || "Director"}
// Target: ${target} words`;
//   return `${base}\n\n${head}\n\n${map[type] || overview}`;
// }

// async function callOpenAI(prompt, maxTokens, retries = 3) {
//   let last = null;
//   for (let i = 0; i < retries; i++) {
//     try {
//       const res = await openai.chat.completions.create({
//         model: MODEL,
//         messages: [{ role: "user", content: prompt }],
//         max_tokens: maxTokens
//       });
//       const text = res?.choices?.[0]?.message?.content || "";
//       if (text && text.trim()) return clean(text);
//     } catch (e) {
//       last = e;
//       const s = e?.status || e?.response?.status;
//       const d = s === 429 ? 1800 * (i + 1) : 900 * (i + 1);
//       await sleep(d);
//     }
//   }
//   if (last) throw last;
//   return "";
// }

// export async function generateMovieContent(movieData, type = "overview") {
//   const t = type || "overview";
//   const prompt = promptFor(movieData, t);
//   const maxTokens = t === "overview" ? 2200 : 1600;
//   const raw = await callOpenAI(prompt, maxTokens, 3);
//   if (!raw) return null;
//   const content = clean(raw);
//   const sections = splitByH2(content);
//   const faqs = extractFaqs(content);
//   const meta = buildMeta(movieData.movieTitle || movieData.title || "Movie", movieData.releaseYear, t, content);
//   return {
//     content,
//     sections,
//     faqs,
//     meta,
//     wordCount: wc(content),
//     createdAt: new Date().toISOString()
//   };
// }

// export async function generateCelebrityData(celebName, industry = "Bollywood") {
//   const prompt = `Generate a comprehensive, high-quality JSON object for the celebrity "${celebName}" in the ${industry} industry. 
//   The data MUST follow this exact JSON structure:
//   {
//     "heroSection": {
//       "profession": ["Actor", "Producer"],
//       "careerStage": "Rising" | "Peak" | "Transition" | "Active" | "Retired",
//       "nationality": "Indian",
//       "height": "5'10\"",
//       "awardsCount": 15,
//       "growthPercentage": 12
//     },
//     "netWorth": {
//       "title": "${celebName} Net Worth 2025",
//       "year": 2025,
//       "description": "Detailed summary of their wealth...",
//       "netWorthINR": { "min": 500, "max": 600, "display": "₹500Cr - ₹600Cr" },
//       "netWorthUSD": { "min": 60, "max": 75, "display": "$60M - $75M" },
//       "analysisSummary": "AI-generated summary of financial growth..."
//     },
//     "quickFacts": {
//       "activeSince": 2010,
//       "brandEndorsements": 12
//     },
//     "netWorthCalculation": {
//       "incomeSources": [
//         { "sourceName": "Movie Remuneration", "percentage": 70, "description": "Primary source of income..." },
//         { "sourceName": "Brand Endorsements", "percentage": 20, "description": "Significant contributor..." }
//       ]
//     },
//     "netWorthTimeline": {
//       "timeline": [
//         { "year": 2020, "netWorth": "$40M" },
//         { "year": 2025, "netWorth": "$75M" }
//       ],
//       "keyMilestones": [
//         { "year": 2012, "milestone": "Breakout role..." }
//       ]
//     },
//     "biographyTimeline": [
//       { "period": "Early Life", "title": "Born in...", "description": "Detailed childhood info..." },
//       { "period": "Career Start", "title": "First film...", "description": "Entry into the industry..." }
//     ],
//     "assets": [
//       { "name": "Luxury Penthouse", "location": "Mumbai", "value": "₹20Cr", "description": "A sea-facing property..." }
//     ]
//   }
  
//   CRITICAL INSTRUCTIONS:
//   - Output ONLY valid JSON - no markdown, no code blocks, no explanatory text
//   - Escape all quotes and special characters properly
//   - No trailing commas after the last array/object element
//   - Use real-world public data or highly realistic estimates for 2025
//   - All string values must be in double quotes
//   - Ensure the JSON is 100% valid and parseable`;

//   try {
//     console.log(`🤖 Generating celebrity intelligence for ${celebName} (${industry})...`);
//     const content = await callOpenAI(prompt, 2000, 3); // Max tokens for JSON output

//     if (content) {
//       let cleanedJson = content.trim();
//       cleanedJson = cleanedJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      
//       const firstBrace = cleanedJson.indexOf('{');
//       const lastBrace = cleanedJson.lastIndexOf('}');
      
//       if (firstBrace !== -1 && lastBrace !== -1) {
//         cleanedJson = cleanedJson.substring(firstBrace, lastBrace + 1);
//         try {
//           return JSON.parse(cleanedJson);
//         } catch (e) {
//           console.error(`❌ JSON Parse Error for ${celebName}:`, e.message);
//         }
//       }
//     }
//     return null;
//   } catch (error) {
//     console.error(`❌ Celebrity Generation Error:`, error.message);
//     return null;
//   }
// }

// export default { generateMovieContent, generateCelebrityData };
// import OpenAI from "openai";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

// const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// function clean(text) {
//   if (!text) return "";
//   return text.replace(/\r/g, "").replace(/^```(?:markdown|md)?/i, "").replace(/```$/i, "").trim();
// }

// function splitByH2(content) {
//   const lines = content.split("\n");
//   const sections = [];
//   let current = null;
//   for (const raw of lines) {
//     const line = raw.trimEnd();
//     if (/^##\s+/.test(line)) {
//       if (current) sections.push({ heading: current.heading.trim(), content: current.content.trim() });
//       current = { heading: line.replace(/^##\s+/, ""), content: "" };
//     } else if (current) {
//       current.content += (current.content ? "\n" : "") + line;
//     }
//   }
//   if (current) sections.push({ heading: current.heading.trim(), content: current.content.trim() });
//   return sections;
// }

// function extractFaqs(content) {
//   const sections = splitByH2(content);
//   const faq = sections.find((s) => /faq/i.test(s.heading));
//   if (!faq) return [];
//   const lines = faq.content.split("\n").map((l) => l.trim()).filter(Boolean);
//   const faqs = [];
//   let q = null;
//   for (const line of lines) {
//     const qm = line.match(/^Q\s*:?\s*(.+)/i);
//     const am = line.match(/^A\s*:?\s*(.+)/i);
//     if (qm) {
//       if (q && q.answer) faqs.push(q);
//       q = { question: qm[1].trim(), answer: "" };
//     } else if (am) {
//       if (!q) q = { question: "", answer: "" };
//       q.answer = (q.answer ? q.answer + " " : "") + am[1].trim();
//     } else if (q) {
//       q.answer = (q.answer ? q.answer + " " : "") + line;
//     }
//   }
//   if (q && q.answer) faqs.push(q);
//   return faqs;
// }

// function wc(text) {
//   return text.split(/\s+/).filter(Boolean).length;
// }

// function buildMeta(title, year, type, content) {
//   const baseTitle = `${title} ${year ? `(${year})` : ""} ${type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`;
//   const description = content.split("\n").find((l) => l.trim().length > 100) || content.substring(0, 150);
//   return {
//     title: baseTitle,
//     description: description.substring(0, 150) + "..."
//   };
// }

// // Word count targets: Main page = 1200-2000, Sub pages = 800-1500
// const WORD_TARGETS = {
//   overview: { min: 1200, max: 2000, isMain: true },
//   "ending-explained": { min: 800, max: 1500, isMain: false },
//   "box-office": { min: 800, max: 1500, isMain: false },
//   budget: { min: 800, max: 1500, isMain: false },
//   "ott-release": { min: 800, max: 1500, isMain: false },
//   cast: { min: 800, max: 1500, isMain: false },
//   "review-analysis": { min: 800, max: 1500, isMain: false },
//   "hit-or-flop": { min: 800, max: 1500, isMain: false }
// };

// const overview = `H1: {movie_name} Movie (Year) – Full Analysis

// Introduction (200-250 words - Write a comprehensive introduction covering the movie's significance, director's vision, and what makes it notable)

// H2: Movie Overview (200-300 words - Detailed overview including genre, production background, and key facts)
// H2: Plot Summary (800-1500 words - Thorough but spoiler-conscious plot description)
// H2: Ending Explained (800-1500 words - Complete breakdown of the ending and its implications)
// H2: Box Office Collection (800-1500 words - Detailed box office numbers and analysis)
// H2: Budget & Profit (800-1500 words - Comprehensive budget breakdown and profitability analysis)
// H2: OTT Release Details (800-1500 words - Complete streaming and digital rights information)
// H2: Cast & Characters (800-1500 words - Detailed cast analysis and character descriptions)
// H2: Audience Reaction (800-1500 words - Comprehensive audience response analysis)

// FAQ Section (3-5 Q&A with detailed answers)`;

// const ending = `H1: {movie_name} Ending Explained – Deep Analysis & Hidden Meanings

// Introduction (200-250 words - Comprehensive introduction to the ending analysis)

// H2: The Final Sequence Breakdown (200-300 words - Scene-by-scene breakdown of the final sequence)
// H2: Themes and Symbolism (200-300 words - Deep dive into themes and symbolic elements)
// H2: Character Resolutions (150-250 words - Detailed analysis of each character's ending)
// H2: Unanswered Questions (150-200 words - Exploration of lingering questions and interpretations)

// FAQ Section (3-5 Q&A with detailed answers)`;

// const boxOffice = `H1: {movie_name} Box Office Collection – Worldwide Revenue & Verdict

// Introduction (200-250 words - Comprehensive box office overview)

// H2: Theatrical Run Timeline (200-300 words - Detailed day-by-day/week-by-week theatrical performance)
// H2: Domestic vs International Performance (200-300 words - Complete breakdown of domestic and international markets)
// H2: Budget vs Collection Analysis (200-250 words - Detailed ROI and financial analysis)
// H2: Final Verdict (Hit/Flop) (150-200 words - Comprehensive verdict with industry context)

// FAQ Section (3-5 Q&A with detailed answers)`;

// const budget = `H1: {movie_name} Movie Budget – Production Costs & Profit Analysis

// Introduction (200-250 words - Comprehensive budget overview)

// H2: Production Cost Breakdown (200-300 words - Detailed production expense breakdown)
// H2: Cast & Crew Salaries (150-250 words - Complete salary and remuneration analysis)
// H2: Marketing & Distribution Costs (150-250 words - Detailed P&A and distribution expenses)
// H2: Profitability Analysis (200-250 words - Comprehensive profit margin analysis)

// FAQ Section (3-5 Q&A with detailed answers)`;

// const ottSec = `H1: {movie_name} OTT Release Date – Streaming Platform & Rights

// Introduction (200-250 words - Comprehensive OTT release overview)

// H2: Digital Rights and Platform (200-300 words - Detailed digital rights acquisition and platform details)
// H2: Theatrical to OTT Window (150-250 words - Complete theatrical-to-streaming timeline analysis)
// H3: Satellite Rights Details (100-200 words - Television rights and broadcast information)
// H2: Audience Response on OTT (150-250 words - Detailed streaming performance analysis)

// FAQ Section (3-5 Q&A with detailed answers)`;

// const castSec = `H1: {movie_name} Cast & Characters – Performance Analysis

// Introduction (200-250 words - Comprehensive cast overview)

// H2: Lead Performances Breakdown (200-300 words - Detailed analysis of lead actors' performances)
// H2: Supporting Cast Highlights (150-250 words - Complete supporting cast analysis)
// H2: Character Arc Analysis (150-250 words - Detailed character development analysis)
// H2: Casting Decisions and Impact (150-200 words - Casting choices and their impact analysis)

// FAQ Section (3-5 Q&A with detailed answers)`;

// const review = `H1: {movie_name} Review Analysis – Critical Response & Audience Reaction

// Introduction (200-250 words - Comprehensive review overview)

// H2: Critical Consensus (200-300 words - Detailed critical reception analysis)
// H2: Audience Reception (200-300 words - Complete audience response breakdown)
// H2: Technical Aspects (Direction, Cinematography) (150-250 words - Detailed technical analysis)
// H2: Final Score & Recommendation (150-200 words - Comprehensive rating and recommendation)

// FAQ Section (3-5 Q&A with detailed answers)`;

// const verdict = `H1: {movie_name} Hit or Flop – Final Verdict & Performance Analysis

// Introduction (200-250 words - Comprehensive verdict overview)

// H2: Commercial Expectations (150-250 words - Pre-release expectations analysis)
// H2: Box Office vs Budget Comparison (200-300 words - Detailed financial comparison)
// H2: Recovery and Profit Analysis (200-250 words - Complete recovery and profit breakdown)
// H2: Final Industry Verdict (150-200 words - Comprehensive industry verdict)

// FAQ Section (3-5 Q&A with detailed answers)`;

// const map = {
//   overview,
//   "ending-explained": ending,
//   "box-office": boxOffice,
//   budget,
//   "ott-release": ottSec,
//   cast: castSec,
//   "review-analysis": review,
//   "hit-or-flop": verdict
// };

// function promptFor(movieData, type) {
//   const { movieTitle, releaseYear, genres = [], director = [] } = movieData;
//   const yearStr = releaseYear ? `(${releaseYear})` : "";
//   const target = WORD_TARGETS[type] || WORD_TARGETS.overview;
//   const wordRange = `${target.min}-${target.max}`;
  
//   const base = map[type]
//     .replace(/{movie_name}/g, movieTitle || movieData.title)
//     .replace(/{year}/g, yearStr);

//   const head = `Movie: ${movieTitle} ${yearStr}
// Genres: ${genres.join("/") || "Drama"}
// Director: ${director.join(", ") || "Director"}

// STRICT REQUIREMENTS:
// - Total word count MUST be between ${wordRange} words (${target.min}-${target.max} words)
// - This is a ${target.isMain ? "MAIN PAGE" : "SUB PAGE"} - adhere strictly to the word count range
// - Do NOT write less than ${target.min} words or more than ${target.max} words
// - Provide comprehensive, detailed, and high-quality content
// - Use proper markdown formatting with H1 and H2 headers as specified
// - Include 3-5 detailed FAQ questions with substantial answers`;

//   return `${base}\n\n${head}`;
// }

// async function callOpenAI(prompt, maxTokens, retries = 3) {
//   let last = null;
//   for (let i = 0; i < retries; i++) {
//     try {
//       const res = await openai.chat.completions.create({
//         model: MODEL,
//         messages: [
//           {
//             role: "system",
//             content: "You are a professional movie content writer. You MUST strictly adhere to the specified word count ranges. Write comprehensive, detailed, and engaging content that meets the exact word count requirements."
//           },
//           {
//             role: "user",
//             content: prompt
//           }
//         ],
//         max_tokens: maxTokens,
//         temperature: 0.7
//       });
//       const text = res?.choices?.[0]?.message?.content || "";
//       if (text && text.trim()) return clean(text);
//     } catch (e) {
//       last = e;
//       const s = e?.status || e?.response?.status;
//       const d = s === 429 ? 2000 * (i + 1) : 1000 * (i + 1);
//       console.log(`⚠️ API error (attempt ${i + 1}/${retries}), retrying in ${d/1000}s...`);
//       await sleep(d);
//     }
//   }
//   if (last) throw last;
//   return "";
// }

// // Helper function to validate and potentially regenerate content
// async function generateWithWordCountValidation(prompt, target, retries = 2) {
//   const maxTokens = target.isMain ? 3500 : 2500; // Increased token limits to accommodate word count
  
//   for (let attempt = 0; attempt <= retries; attempt++) {
//     const raw = await callOpenAI(prompt, maxTokens, 3);
//     if (!raw) continue;
    
//     const content = clean(raw);
//     const wordCount = wc(content);
    
//     console.log(`📊 Generated ${wordCount} words (target: ${target.min}-${target.max})`);
    
//     // Check if word count is within target range
//     if (wordCount >= target.min && wordCount <= target.max) {
//       return content;
//     }
    
//     // If not within range and we have retries left, modify the prompt
//     if (attempt < retries) {
//       console.log(`⚠️ Word count (${wordCount}) outside target range, retrying...`);
      
//       let adjustmentPrompt = prompt;
//       if (wordCount < target.min) {
//         adjustmentPrompt = `${prompt}\n\nCRITICAL: Previous response was too short (${wordCount} words). You MUST write at least ${target.min} words. Add more detail, examples, and analysis to reach the required length.`;
//       } else if (wordCount > target.max) {
//         adjustmentPrompt = `${prompt}\n\nCRITICAL: Previous response was too long (${wordCount} words). You MUST write no more than ${target.max} words. Be more concise while maintaining quality and key information.`;
//       }
      
//       prompt = adjustmentPrompt;
//     } else {
//       // Last attempt, return what we have
//       console.log(`⚠️ Final attempt: word count (${wordCount}) still outside range, but returning content`);
//       return content;
//     }
//   }
  
//   return null;
// }

// export async function generateMovieContent(movieData, type = "overview") {
//   const t = type || "overview";
//   const target = WORD_TARGETS[t] || WORD_TARGETS.overview;
  
//   console.log(`🎬 Generating ${t} content for "${movieData.movieTitle || movieData.title}"`);
//   console.log(`📏 Target word count: ${target.min}-${target.max} words (${target.isMain ? "Main Page" : "Sub Page"})`);
  
//   const prompt = promptFor(movieData, t);
//   const content = await generateWithWordCountValidation(prompt, target, 2);
  
//   if (!content) {
//     console.error(`❌ Failed to generate content for ${t}`);
//     return null;
//   }
  
//   const sections = splitByH2(content);
//   const faqs = extractFaqs(content);
//   const finalWordCount = wc(content);
//   const meta = buildMeta(movieData.movieTitle || movieData.title || "Movie", movieData.releaseYear, t, content);
  
//   console.log(`✅ Successfully generated ${t} content (${finalWordCount} words)`);
  
//   return {
//     content,
//     sections,
//     faqs,
//     meta,
//     wordCount: finalWordCount,
//     targetRange: target,
//     createdAt: new Date().toISOString()
//   };
// }

// export async function generateCelebrityData(celebName, industry = "Bollywood") {
//   const prompt = `Generate a comprehensive, high-quality JSON object for the celebrity "${celebName}" in the ${industry} industry. 
//   The data MUST follow this exact JSON structure:
//   {
//     "heroSection": {
//       "profession": ["Actor", "Producer"],
//       "careerStage": "Rising" | "Peak" | "Transition" | "Active" | "Retired",
//       "nationality": "Indian",
//       "height": "5'10\"",
//       "awardsCount": 15,
//       "growthPercentage": 12
//     },
//     "netWorth": {
//       "title": "${celebName} Net Worth 2025",
//       "year": 2025,
//       "description": "Detailed summary of their wealth...",
//       "netWorthINR": { "min": 500, "max": 600, "display": "₹500Cr - ₹600Cr" },
//       "netWorthUSD": { "min": 60, "max": 75, "display": "$60M - $75M" },
//       "analysisSummary": "AI-generated summary of financial growth..."
//     },
//     "quickFacts": {
//       "activeSince": 2010,
//       "brandEndorsements": 12
//     },
//     "netWorthCalculation": {
//       "incomeSources": [
//         { "sourceName": "Movie Remuneration", "percentage": 70, "description": "Primary source of income..." },
//         { "sourceName": "Brand Endorsements", "percentage": 20, "description": "Significant contributor..." }
//       ]
//     },
//     "netWorthTimeline": {
//       "timeline": [
//         { "year": 2020, "netWorth": "$40M" },
//         { "year": 2025, "netWorth": "$75M" }
//       ],
//       "keyMilestones": [
//         { "year": 2012, "milestone": "Breakout role..." }
//       ]
//     },
//     "biographyTimeline": [
//       { "period": "Early Life", "title": "Born in...", "description": "Detailed childhood info..." },
//       { "period": "Career Start", "title": "First film...", "description": "Entry into the industry..." }
//     ],
//     "assets": [
//       { "name": "Luxury Penthouse", "location": "Mumbai", "value": "₹20Cr", "description": "A sea-facing property..." }
//     ]
//   }
  
//   CRITICAL INSTRUCTIONS:
//   - Output ONLY valid JSON - no markdown, no code blocks, no explanatory text
//   - Escape all quotes and special characters properly
//   - No trailing commas after the last array/object element
//   - Use real-world public data or highly realistic estimates for 2025
//   - All string values must be in double quotes
//   - Ensure the JSON is 100% valid and parseable`;

//   try {
//     console.log(`🤖 Generating celebrity intelligence for ${celebName} (${industry})...`);
    
//     const response = await openai.chat.completions.create({
//       model: MODEL,
//       messages: [
//         {
//           role: "system",
//           content: "You are a JSON data generator. Output only valid JSON without any markdown formatting, code blocks, or explanatory text."
//         },
//         {
//           role: "user",
//           content: prompt
//         }
//       ],
//       max_tokens: 2000,
//       temperature: 0.5
//     });
    
//     const content = response?.choices?.[0]?.message?.content || "";
    
//     if (content) {
//       let cleanedJson = content.trim();
//       cleanedJson = cleanedJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      
//       const firstBrace = cleanedJson.indexOf('{');
//       const lastBrace = cleanedJson.lastIndexOf('}');
      
//       if (firstBrace !== -1 && lastBrace !== -1) {
//         cleanedJson = cleanedJson.substring(firstBrace, lastBrace + 1);
//         try {
//           return JSON.parse(cleanedJson);
//         } catch (e) {
//           console.error(`❌ JSON Parse Error for ${celebName}:`, e.message);
//         }
//       }
//     }
//     return null;
//   } catch (error) {
//     console.error(`❌ Celebrity Generation Error:`, error.message);
//     return null;
//   }
// }

// export default { generateMovieContent, generateCelebrityData };
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function clean(text) {
  if (!text) return "";
  return text.replace(/\r/g, "").replace(/^```(?:markdown|md)?/i, "").replace(/```$/i, "").trim();
}

function splitByH2(content) {
  const lines = content.split("\n");
  const sections = [];
  let current = null;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^##\s+/.test(line)) {
      if (current) sections.push({ heading: current.heading.trim(), content: current.content.trim() });
      current = { heading: line.replace(/^##\s+/, ""), content: "" };
    } else if (current) {
      current.content += (current.content ? "\n" : "") + line;
    }
  }
  if (current) sections.push({ heading: current.heading.trim(), content: current.content.trim() });
  return sections;
}

function extractFaqs(content) {
  const sections = splitByH2(content);
  const faq = sections.find((s) => /faq/i.test(s.heading));
  if (!faq) return [];
  const lines = faq.content.split("\n").map((l) => l.trim()).filter(Boolean);
  const faqs = [];
  let q = null;
  for (const line of lines) {
    const qm = line.match(/^Q\s*:?\s*(.+)/i);
    const am = line.match(/^A\s*:?\s*(.+)/i);
    if (qm) {
      if (q && q.answer) faqs.push(q);
      q = { question: qm[1].trim(), answer: "" };
    } else if (am) {
      if (!q) q = { question: "", answer: "" };
      q.answer = (q.answer ? q.answer + " " : "") + am[1].trim();
    } else if (q) {
      q.answer = (q.answer ? q.answer + " " : "") + line;
    }
  }
  if (q && q.answer) faqs.push(q);
  return faqs;
}

function wc(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function buildMeta(title, year, type, content) {
  const baseTitle = `${title} ${year ? `(${year})` : ""} ${type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`;
  const description = content.split("\n").find((l) => l.trim().length > 100) || content.substring(0, 150);
  return {
    title: baseTitle,
    description: description.substring(0, 150) + "..."
  };
}

// Word count targets: Main page = 1200-2000, Sub pages = 800-1500
const WORD_TARGETS = {
  overview: { min: 1200, max: 2000, isMain: true },
  "ending-explained": { min: 800, max: 1500, isMain: false },
  "box-office": { min: 800, max: 1500, isMain: false },
  budget: { min: 800, max: 1500, isMain: false },
  "ott-release": { min: 800, max: 1500, isMain: false },
  cast: { min: 800, max: 1500, isMain: false },
  "review-analysis": { min: 800, max: 1500, isMain: false },
  "hit-or-flop": { min: 800, max: 1500, isMain: false }
};

const overview = `H1: {movie_name} Movie (Year) – Full Analysis

Write a comprehensive introduction covering the movie's significance, director's vision, and what makes it notable.

H2: Movie Overview
Provide detailed overview including genre, production background, key facts, and the film's place in cinema.

H2: Plot Summary
Deliver a thorough but spoiler-conscious plot description covering major story beats and character journeys.

H2: Ending Explained
Break down the ending completely, including its implications, symbolism, and narrative significance.

H2: Box Office Collection
Present detailed box office numbers with analysis of domestic and international performance.

H2: Budget & Profit
Provide comprehensive budget breakdown and profitability analysis with financial insights.

H2: OTT Release Details
Detail complete streaming and digital rights information including platform details.

H2: Cast & Characters
Offer detailed cast analysis and character descriptions highlighting performances.

H2: Audience Reaction
Analyze comprehensive audience response including reviews and social media sentiment.

FAQ Section
Provide 3-5 detailed Q&A covering common questions about the movie.`;

const ending = `H1: {movie_name} Ending Explained – Deep Analysis & Hidden Meanings

Write a comprehensive introduction to the ending analysis, setting up the key questions to be explored.

H2: The Final Sequence Breakdown
Provide a scene-by-scene breakdown of the final sequence with detailed analysis.

H2: Themes and Symbolism
Dive deep into themes and symbolic elements present throughout the ending.

H2: Character Resolutions
Analyze each character's ending arc and what their resolution means.

H2: Unanswered Questions
Explore lingering questions and possible interpretations left by the ending.

FAQ Section
Provide 3-5 detailed Q&A covering common questions about the movie's ending.`;

const boxOffice = `H1: {movie_name} Box Office Collection – Worldwide Revenue & Verdict

Write a comprehensive box office overview setting up the film's commercial journey.

H2: Theatrical Run Timeline
Detail the day-by-day and week-by-week theatrical performance with specific numbers.

H2: Domestic vs International Performance
Break down complete domestic and international market performance with comparisons.

H2: Budget vs Collection Analysis
Provide detailed ROI and financial analysis comparing costs to revenue.

H2: Final Verdict (Hit/Flop)
Offer comprehensive verdict with industry context and commercial assessment.

FAQ Section
Provide 3-5 detailed Q&A covering common questions about the movie's box office.`;

const budget = `H1: {movie_name} Movie Budget – Production Costs & Profit Analysis

Write a comprehensive budget overview introducing the film's financial scope.

H2: Production Cost Breakdown
Detail production expenses including sets, locations, equipment, and crew costs.

H2: Cast & Crew Salaries
Provide complete salary and remuneration analysis for key cast and crew members.

H2: Marketing & Distribution Costs
Detail promotional expenses including P&A and distribution costs across markets.

H2: Profitability Analysis
Provide comprehensive profit margin analysis with return on investment calculations.

FAQ Section
Provide 3-5 detailed Q&A covering common questions about the movie's budget.`;

const ottSec = `H1: {movie_name} OTT Release Date – Streaming Platform & Rights

Write a comprehensive OTT release overview introducing the digital premiere.

H2: Digital Rights and Platform
Detail digital rights acquisition including platform selection and deal value.

H2: Theatrical to OTT Window
Provide complete theatrical-to-streaming timeline analysis with industry context.

H2: Satellite Rights Details
Detail television rights including broadcast channels and telecast schedule.

H2: Audience Response on OTT
Analyze streaming performance including viewership numbers and reception.

FAQ Section
Provide 3-5 detailed Q&A covering common questions about the OTT release.`;

const castSec = `H1: {movie_name} Cast & Characters – Performance Analysis

Write a comprehensive cast overview introducing the ensemble and key players.

H2: Lead Performances Breakdown
Analyze lead actors' performances in detail with character study.

H2: Supporting Cast Highlights
Provide complete supporting cast analysis highlighting standout performers.

H2: Character Arc Analysis
Detail character development throughout the narrative with arc analysis.

H2: Casting Decisions and Impact
Analyze casting choices and their impact on the film's success.

FAQ Section
Provide 3-5 detailed Q&A covering common questions about the movie's cast.`;

const review = `H1: {movie_name} Review Analysis – Critical Response & Audience Reaction

Write a comprehensive review overview introducing critical and audience reception.

H2: Critical Consensus
Analyze detailed critical reception including major reviews and critic scores.

H2: Audience Reception
Break down complete audience response including ratings and word-of-mouth.

H2: Technical Aspects (Direction, Cinematography)
Provide detailed technical analysis of direction, cinematography, and other crafts.

H2: Final Score & Recommendation
Offer comprehensive rating and viewing recommendation with justification.

FAQ Section
Provide 3-5 detailed Q&A covering common questions about the movie's reviews.`;

const verdict = `H1: {movie_name} Hit or Flop – Final Verdict & Performance Analysis

Write a comprehensive verdict overview introducing the commercial assessment.

H2: Commercial Expectations
Analyze pre-release expectations including trade predictions and buzz.

H2: Box Office vs Budget Comparison
Provide detailed financial comparison with actual numbers and analysis.

H2: Recovery and Profit Analysis
Break down complete recovery metrics and profit distribution analysis.

H2: Final Industry Verdict
Offer comprehensive industry verdict with market impact assessment.

FAQ Section
Provide 3-5 detailed Q&A covering common questions about the movie's verdict.`;

const map = {
  overview,
  "ending-explained": ending,
  "box-office": boxOffice,
  budget,
  "ott-release": ottSec,
  cast: castSec,
  "review-analysis": review,
  "hit-or-flop": verdict
};

function promptFor(movieData, type) {
  const { movieTitle, releaseYear, genres = [], director = [] } = movieData;
  const yearStr = releaseYear ? `(${releaseYear})` : "";
  const target = WORD_TARGETS[type] || WORD_TARGETS.overview;
  const wordRange = `${target.min}-${target.max}`;
  
  const base = map[type]
    .replace(/{movie_name}/g, movieTitle || movieData.title)
    .replace(/{year}/g, yearStr);

  const head = `Movie Information:
- Title: ${movieTitle} ${yearStr}
- Genres: ${genres.join("/") || "Drama"}
- Director: ${director.join(", ") || "Director"}

STRICT REQUIREMENTS:
- TOTAL word count MUST be between ${wordRange} words (exactly ${target.min} to ${target.max} words)
- This is a ${target.isMain ? "MAIN PAGE" : "SUB PAGE"} - adhere strictly to this word count range
- Do NOT write less than ${target.min} words under any circumstances
- Do NOT write more than ${target.max} words under any circumstances
- Provide comprehensive, detailed, and high-quality content
- Use proper markdown formatting with H1 and H2 headers as specified
- Include 3-5 detailed FAQ questions with substantial answers
- Each section should contribute appropriately to the total word count`;

  return `${base}\n\n${head}`;
}

async function callOpenAI(prompt, maxTokens, retries = 3) {
  let last = null;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are a professional movie content writer. You MUST strictly adhere to the specified word count ranges. Write comprehensive, detailed, and engaging content that meets the exact word count requirements. Count your words carefully and ensure the final output is within the specified range."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      });
      const text = res?.choices?.[0]?.message?.content || "";
      if (text && text.trim()) return clean(text);
    } catch (e) {
      last = e;
      const s = e?.status || e?.response?.status;
      const d = s === 429 ? 2000 * (i + 1) : 1000 * (i + 1);
      console.log(`⚠️ API error (attempt ${i + 1}/${retries}), retrying in ${d/1000}s...`);
      await sleep(d);
    }
  }
  if (last) throw last;
  return "";
}

async function generateWithWordCountValidation(prompt, target, retries = 3) {
  const maxTokens = target.isMain ? 4000 : 3000;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const raw = await callOpenAI(prompt, maxTokens, 3);
    if (!raw) continue;
    
    const content = clean(raw);
    const wordCount = wc(content);
    
    console.log(`📊 Generated ${wordCount} words (target: ${target.min}-${target.max})`);
    
    if (wordCount >= target.min && wordCount <= target.max) {
      console.log(`✅ Word count within target range!`);
      return content;
    }
    
    if (attempt < retries) {
      console.log(`⚠️ Word count (${wordCount}) outside target range, retrying (${attempt + 1}/${retries})...`);
      
      let adjustmentPrompt = prompt;
      if (wordCount < target.min) {
        const deficit = target.min - wordCount;
        adjustmentPrompt = `${prompt}\n\nCRITICAL CORRECTION REQUIRED: Your previous response was too short (${wordCount} words). You MUST add approximately ${deficit} more words to reach the minimum of ${target.min} words. Expand each section with more detail, analysis, examples, and insights. Do not be brief - be comprehensive and thorough.`;
      } else if (wordCount > target.max) {
        const excess = wordCount - target.max;
        adjustmentPrompt = `${prompt}\n\nCRITICAL CORRECTION REQUIRED: Your previous response was too long (${wordCount} words). You MUST reduce by approximately ${excess} words to stay under the maximum of ${target.max} words. Be more concise and focused while maintaining key information and quality. Remove redundancy and tighten your writing.`;
      }
      
      prompt = adjustmentPrompt;
    } else {
      console.log(`⚠️ Final attempt: word count (${wordCount}) still outside range, but returning content`);
      return content;
    }
  }
  
  return null;
}

export async function generateMovieContent(movieData, type = "overview") {
  const t = type || "overview";
  const target = WORD_TARGETS[t] || WORD_TARGETS.overview;
  
  console.log(`\n🎬 Generating ${t} content for "${movieData.movieTitle || movieData.title}"`);
  console.log(`📏 Target word count: ${target.min}-${target.max} words (${target.isMain ? "Main Page" : "Sub Page"})`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  const prompt = promptFor(movieData, t);
  const content = await generateWithWordCountValidation(prompt, target, 3);
  
  if (!content) {
    console.error(`❌ Failed to generate content for ${t}`);
    return null;
  }
  
  const sections = splitByH2(content);
  const faqs = extractFaqs(content);
  const finalWordCount = wc(content);
  const meta = buildMeta(movieData.movieTitle || movieData.title || "Movie", movieData.releaseYear, t, content);
  
  const inRange = finalWordCount >= target.min && finalWordCount <= target.max;
  console.log(`\n${inRange ? '✅' : '⚠️'} Generated ${t} content: ${finalWordCount} words ${inRange ? '✓' : '(outside ' + target.min + '-' + target.max + ' range)'}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  return {
    content,
    sections,
    faqs,
    meta,
    wordCount: finalWordCount,
    targetRange: target,
    inRange,
    createdAt: new Date().toISOString()
  };
}

export async function generateCelebrityData(celebName, industry = "Bollywood") {
  const prompt = `Generate a comprehensive, high-quality JSON object for the celebrity "${celebName}" in the ${industry} industry. 
  The data MUST follow this exact JSON structure:
  {
    "heroSection": {
      "profession": ["Actor", "Producer"],
      "careerStage": "Rising" | "Peak" | "Transition" | "Active" | "Retired",
      "nationality": "Indian",
      "height": "5'10\"",
      "awardsCount": 15,
      "growthPercentage": 12
    },
    "netWorth": {
      "title": "${celebName} Net Worth 2025",
      "year": 2025,
      "description": "Detailed summary of their wealth...",
      "netWorthINR": { "min": 500, "max": 600, "display": "₹500Cr - ₹600Cr" },
      "netWorthUSD": { "min": 60, "max": 75, "display": "$60M - $75M" },
      "analysisSummary": "AI-generated summary of financial growth..."
    },
    "quickFacts": {
      "activeSince": 2010,
      "brandEndorsements": 12
    },
    "netWorthCalculation": {
      "incomeSources": [
        { "sourceName": "Movie Remuneration", "percentage": 70, "description": "Primary source of income..." },
        { "sourceName": "Brand Endorsements", "percentage": 20, "description": "Significant contributor..." }
      ]
    },
    "netWorthTimeline": {
      "timeline": [
        { "year": 2020, "netWorth": "$40M" },
        { "year": 2025, "netWorth": "$75M" }
      ],
      "keyMilestones": [
        { "year": 2012, "milestone": "Breakout role..." }
      ]
    },
    "biographyTimeline": [
      { "period": "Early Life", "title": "Born in...", "description": "Detailed childhood info..." },
      { "period": "Career Start", "title": "First film...", "description": "Entry into the industry..." }
    ],
    "assets": [
      { "name": "Luxury Penthouse", "location": "Mumbai", "value": "₹20Cr", "description": "A sea-facing property..." }
    ]
  }
  
  CRITICAL INSTRUCTIONS:
  - Output ONLY valid JSON - no markdown, no code blocks, no explanatory text
  - Escape all quotes and special characters properly
  - No trailing commas after the last array/object element
  - Use real-world public data or highly realistic estimates for 2025
  - All string values must be in double quotes
  - Ensure the JSON is 100% valid and parseable`;

  try {
    console.log(`🤖 Generating celebrity intelligence for ${celebName} (${industry})...`);
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a JSON data generator. Output only valid JSON without any markdown formatting, code blocks, or explanatory text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.5
    });
    
    const content = response?.choices?.[0]?.message?.content || "";
    
    if (content) {
      let cleanedJson = content.trim();
      cleanedJson = cleanedJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      
      const firstBrace = cleanedJson.indexOf('{');
      const lastBrace = cleanedJson.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanedJson = cleanedJson.substring(firstBrace, lastBrace + 1);
        try {
          return JSON.parse(cleanedJson);
        } catch (e) {
          console.error(`❌ JSON Parse Error for ${celebName}:`, e.message);
        }
      }
    }
    return null;
  } catch (error) {
    console.error(`❌ Celebrity Generation Error:`, error.message);
    return null;
  }
}

export default { generateMovieContent, generateCelebrityData };