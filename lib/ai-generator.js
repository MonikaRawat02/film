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

const overview = `H1: {movie_name} Movie (Year) – Full Analysis

Introduction (150–200 words)

H2: Movie Overview
H2: Plot Summary
H2: Ending Explained
H2: Box Office Collection
H2: Budget & Profit
H2: OTT Release Details
H2: Cast & Characters
H2: Audience Reaction

FAQ Section (3–5 Q&A)`;

const ending = `H1: {movie_name} Ending Explained – Deep Analysis & Hidden Meanings

Introduction (150–200 words)

H2: The Final Sequence Breakdown
H2: Themes and Symbolism
H2: Character Resolutions
H2: Unanswered Questions

FAQ Section (3–5 Q&A)`;

const boxOffice = `H1: {movie_name} Box Office Collection – Worldwide Revenue & Verdict

Introduction (150–200 words)

H2: Theatrical Run Timeline
H2: Domestic vs International Performance
H2: Budget vs Collection Analysis
H2: Final Verdict (Hit/Flop)

FAQ Section (3–5 Q&A)`;

const budget = `H1: {movie_name} Movie Budget – Production Costs & Profit Analysis

Introduction (150–200 words)

H2: Production Cost Breakdown
H2: Cast & Crew Salaries
H2: Marketing & Distribution Costs
H2: Profitability Analysis

FAQ Section (3–5 Q&A)`;

const ottSec = `H1: {movie_name} OTT Release Date – Streaming Platform & Rights

Introduction (150–200 words)

H2: Digital Rights and Platform
H2: Theatrical to OTT Window
H2: Satellite Rights Details
H2: Audience Response on OTT

FAQ Section (3–5 Q&A)`;

const castSec = `H1: {movie_name} Cast & Characters – Performance Analysis

Introduction (150–200 words)

H2: Lead Performances Breakdown
H2: Supporting Cast Highlights
H2: Character Arc Analysis
H2: Casting Decisions and Impact

FAQ Section (3–5 Q&A)`;

const review = `H1: {movie_name} Review Analysis – Critical Response & Audience Reaction

Introduction (150–200 words)

H2: Critical Consensus
H2: Audience Reception
H2: Technical Aspects (Direction, Cinematography)
H2: Final Score & Recommendation

FAQ Section (3–5 Q&A)`;

const verdict = `H1: {movie_name} Hit or Flop – Final Verdict & Performance Analysis

Introduction (150–200 words)

H2: Commercial Expectations
H2: Box Office vs Budget Comparison
H2: Recovery and Profit Analysis
H2: Final Industry Verdict

FAQ Section (3–5 Q&A)`;

const genreAnalysisPrompt = `Analyze the genre and cinematic style of {movie_name} ({year}). 
Provide a concise, 2-3 sentence structured analysis that explains exactly what type of movie it is.
Genres: {genres}`;

const map = {
  overview,
  "ending-explained": ending,
  "box-office": boxOffice,
  budget,
  "ott-release": ottSec,
  cast: castSec,
  "review-analysis": review,
  "hit-or-flop": verdict,
  "genre-analysis": genreAnalysisPrompt
};

function promptFor(movieData, type) {
  const { movieTitle, releaseYear, genres = [], director = [] } = movieData;
  const yearStr = releaseYear ? `${releaseYear}` : "";
  const name = movieTitle || movieData.title || "Movie";
  
  const base = (map[type] || overview)
    .replace(/{movie_name}/g, name)
    .replace(/{year}/g, yearStr)
    .replace(/{genres}/g, Array.isArray(genres) ? genres.join(", ") : genres);

  if (type === "genre-analysis") return base;

  const target = type === "overview" ? "1500-2000" : "800-1400";
  const head = `Movie: ${name} ${yearStr ? `(${yearStr})` : ""}
Genres: ${Array.isArray(genres) ? genres.join("/") : "Drama"}
Director: ${Array.isArray(director) ? director.join(", ") : "Director"}
Target: ${target} words`;
  return `${base}\n\n${head}`;
}

async function callOpenAI(prompt, maxTokens, retries = 3) {
  let last = null;
  const isReasoningModel = MODEL.startsWith('o1');
  
  for (let i = 0; i < retries; i++) {
    try {
      const completionOptions = {
        model: MODEL,
        messages: [{ role: "user", content: prompt }]
      };

      if (isReasoningModel) {
        completionOptions.max_completion_tokens = maxTokens;
      } else {
        completionOptions.max_tokens = maxTokens;
      }

      const res = await openai.chat.completions.create(completionOptions);
      const text = res?.choices?.[0]?.message?.content || "";
      if (text && text.trim()) return clean(text);
    } catch (e) {
      last = e;
      const s = e?.status || e?.response?.status;
      const d = s === 429 ? 1800 * (i + 1) : 900 * (i + 1);
      await sleep(d);
    }
  }
  if (last) throw last;
  return "";
}

export async function generateMovieContent(movieData, type = "overview") {
  const t = type || "overview";
  const prompt = promptFor(movieData, t);
  const maxTokens = t === "overview" ? 2200 : 1600;
  const raw = await callOpenAI(prompt, maxTokens, 3);
  if (!raw) return null;
  const content = clean(raw);
  const sections = splitByH2(content);
  const faqs = extractFaqs(content);
  const meta = buildMeta(movieData.movieTitle || movieData.title || "Movie", movieData.releaseYear, t, content);
  return {
    content,
    sections,
    faqs,
    meta,
    isAI: true, // Explicitly set isAI to true for successful generations
    wordCount: wc(content),
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
    const content = await callOpenAI(prompt, 2000, 3); // Max tokens for JSON output

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
