import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google Gemini (PRIMARY - PAID)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate long-form SEO content for a movie article
 */
export async function generateMovieContent(movieData, pageType = "overview") {
  const { movieTitle, releaseYear, summary, cast, director, genres, boxOffice, budget, ott } = movieData;

  const prompts = {
    overview: `Generate a comprehensive, SEO-optimized article of 1800-2200 words for the movie "${movieTitle}" (${releaseYear}). This is the main pillar page and must be exceptionally detailed.

      **Core Instructions:**
      - **Word Count:** Strictly adhere to 1800-2200 words.
      - **Tone:** Authoritative, engaging, and analytical, like a professional film critic and industry analyst.
      - **Formatting:** Use Markdown with H2 for main sections and H3 for sub-sections. Paragraphs must be well-developed (at least 150-200 words each).

      **Article Structure:**

      # ${movieTitle} Movie (${releaseYear}) – Full Analysis, Box Office & OTT Details

      ## Introduction (200-250 words)
      Craft a compelling introduction that hooks the reader. Naturally integrate the keywords: "${movieTitle}", "Box Office", "OTT Release", and "Ending Explained".

      ## ${movieTitle}: A Deep-Dive into the Cinematic Experience (300-400 words)
      Provide a detailed overview of the film's premise, its place within the ${genres?.join("/")} genre, and its overall impact. Discuss the direction by ${director?.join(", ")} and the film's unique selling points.

      ## Plot Synopsis & Key Narrative Arcs (400-500 words)
      - **H3: The Setup:** Detail the first act and the establishment of the main characters and conflict.
      - **H3: The Confrontation:** Describe the rising action and the core challenges faced by the protagonists.
      - **H3: The Resolution:** Explain the climax and how the central conflict is resolved.

      ## ${movieTitle} Ending Explained (300-400 words)
      Analyze the final scenes in detail. Discuss any ambiguity, thematic conclusions, and the ultimate fate of the characters. What is the core message the ending delivers?

      ## Box Office Performance & Financial Analysis (300-400 words)
      - **H3: Budget vs. Worldwide Collection:** Analyze the film's budget of ${budget || 'N/A'} against its worldwide collection of ${boxOffice?.worldwide || 'N/A'}. Calculate the ROI and discuss its profitability.
      - **H3: Domestic and International Breakdown:** Discuss its performance in key markets.

      ## OTT Release and Digital Rights (200-300 words)
      Provide details on its official OTT platform, release date, and the significance of its digital streaming rights deal.

      ## Cast, Characters, and Performances (400-500 words)
      - **H3: Lead Cast Analysis:** Dedicate a paragraph to each of the main actors: ${cast?.slice(0, 3).map(c => c.name).join(", ")}. Discuss their portrayal, character arc, and impact on the film.
      - **H3: Supporting Roles & Noteworthy Performances:** Highlight key supporting actors and their contributions.

      ## Critical & Audience Reception (200-300 words)
      Summarize the general consensus from both professional critics and the general audience. Mention any major awards or nominations.

      ## FAQ Section
      Create and answer 4-5 relevant frequently asked questions about the movie. Each answer should be 75-100 words.`,
      
    "ending-explained": `Generate a deep-dive "Ending Explained" article of 1200-1500 words for "${movieTitle}" (${releaseYear}). The focus is on analysis, symbolism, and thematic interpretation.

      **Core Instructions:**
      - **Word Count:** Strictly adhere to 1200-1500 words.
      - **Tone:** Scholarly, analytical, and insightful.
      - **Formatting:** Use Markdown with H2 for main sections and H3 for sub-sections. Paragraphs must be detailed and well-supported (at least 150 words each).

      **Article Structure:**

      # ${movieTitle} Ending Explained – Deep Analysis, Theories & Hidden Meanings

      ## Introduction (200-250 words)
      Introduce the film's complex ending and state the article's purpose: to dissect its meaning. Use the keyword "${movieTitle} Ending Explained" naturally.

      ## The Final Sequence: A Moment-by-Moment Breakdown (400-500 words)
      Provide a detailed, chronological account of the final 15-20 minutes of the film. Describe the events as they unfold, setting the stage for analysis.

      ## Deconstructing the Climax: Core Themes and Resolutions (300-400 words)
      - **H3: Thematic Conclusion:** What are the central themes (e.g., redemption, sacrifice, justice) and how does the ending resolve them?
      - **H3: Character Fates:** Analyze the final state of the main characters. Did they achieve their goals? What does their end represent?

      ## Symbolism and Hidden Meanings (300-400 words)
      Uncover and analyze any symbols, motifs, or visual cues in the final scenes. What deeper meanings are embedded in the cinematography and dialogue?

      ## Unanswered Questions & Fan Theories (250-350 words)
      Discuss any ambiguities or unresolved plot points. Explore 2-3 popular fan theories and evaluate their validity based on the evidence in the film.

      ## FAQ Section
      Create and answer 4-5 in-depth questions specifically about the ending. Each answer should be 75-100 words.`,

    "box-office": `Generate a detailed financial analysis of 1200-1500 words for "${movieTitle}" (${releaseYear}). The article must be data-driven and analytical.

      **Core Instructions:**
      - **Word Count:** Strictly adhere to 1200-1500 words.
      - **Tone:** Analytical, professional, and data-oriented.
      - **Formatting:** Use Markdown with H2 for main sections and H3 for sub-sections. Paragraphs must be well-developed (at least 150 words each).

      **Article Structure:**

      # ${movieTitle} Box Office Collection – Worldwide Revenue & Financial Verdict

      ## Introduction (200-250 words)
      Introduce the film's theatrical release and its overall commercial expectations. Use the keyword "${movieTitle} Box Office Collection" naturally.

      ## Theatrical Run: A Comprehensive Timeline (400-500 words)
      Analyze the film's performance from its opening day to its lifetime collection. Discuss daily collections, weekend growth, and weekday holds.

      ## Territory-Wise Performance Analysis (300-400 words)
      - **H3: Domestic Market (India/US):** Detailed breakdown of how it performed in its home territory.
      - **H3: International Markets:** Analysis of key overseas territories and the film's global appeal.

      ## Commercial Verdict and ROI Analysis (300-400 words)
      Compare the final worldwide collection (${boxOffice?.worldwide || 'N/A'}) against the estimated budget (${budget || 'N/A'}). Calculate the return on investment and provide the final industry verdict (Blockbuster, Hit, etc.).

      ## FAQ Section
      Create and answer 4-5 financial questions about the movie. Each answer should be 75-100 words.`,

    "budget": `Generate a detailed production and budget analysis of 1200-1500 words for "${movieTitle}" (${releaseYear}).

      **Core Instructions:**
      - **Word Count:** Strictly adhere to 1200-1500 words.
      - **Tone:** Investigative, analytical, and industry-focused.
      - **Formatting:** Use Markdown with H2 for main sections and H3 for sub-sections. Paragraphs must be well-developed (at least 150 words each).

      **Article Structure:**

      # ${movieTitle} Movie Budget – Production Costs, Salaries & Marketing Analysis

      ## Introduction (200-250 words)
      Introduce the scale of the production and the initial investment. Use the keyword "${movieTitle} Budget" naturally.

      ## Production Cost Breakdown (400-500 words)
      Analyze where the money was spent. Discuss principal photography, locations, and technical expenses.

      ## Cast Remuneration & Key Personnel Salaries (300-400 words)
      Estimate the salaries of the lead actors and the director ${director?.join(", ")}. Discuss how these costs impacted the overall budget.

      ## Marketing, Promotion & Distribution Expenses (300-400 words)
      Analyze the film's promotional strategy and the costs associated with its global release.

      ## Recovery Model & Financial Risk Analysis
      Discuss how the producers planned to recover the ${budget || 'N/A'} investment through theatrical and non-theatrical avenues.

      ## FAQ Section
      Create and answer 4-5 questions about the film's production costs. Each answer should be 75-100 words.`,

    "ott-release": `Generate a comprehensive "OTT Release" and streaming intelligence article of 1200-1500 words for "${movieTitle}" (${releaseYear}).

      **Core Instructions:**
      - **Word Count:** Strictly adhere to 1200-1500 words.
      - **Tone:** Informative, strategic, and analytical.
      - **Formatting:** Use Markdown with H2 for main sections and H3 for sub-sections. Paragraphs must be well-developed (at least 150 words each).

      **Article Structure:**

      # ${movieTitle} OTT Release Date – Streaming Platform, Rights & Digital Premiere

      ## Introduction (200-250 words)
      Introduce the film's digital journey. Use the keyword "${movieTitle} OTT Release Date" naturally.

      ## Digital Rights & Platform Intelligence (400-500 words)
      Analyze the streaming deal with ${ott?.platform || 'TBA'}. Discuss the estimated value of the digital rights and the platform's content strategy.

      ## Theatrical-to-Digital Window Analysis (300-400 words)
      Discuss the timing of the digital premiere in relation to its theatrical release. How does this window reflect current industry trends?

      ## Satellite and Other Non-Theatrical Rights (300-400 words)
      Provide details on television premiere rights and other distribution deals that contributed to the film's digital ecosystem.

      ## Audience Reception on Streaming Platforms
      Discuss how the film was received by the digital audience compared to its theatrical run.

      ## FAQ Section
      Create and answer 4-5 questions about the film's digital and satellite release. Each answer should be 75-100 words.`,

    "cast": `Generate a deep dive into the cast and characters of "${movieTitle}" (${releaseYear}). The article must be 1200-1500 words.

      **Core Instructions:**
      - **Word Count:** Strictly adhere to 1200-1500 words.
      - **Tone:** Engaging, analytical, and performance-focused.
      - **Formatting:** Use Markdown with H2 for main sections and H3 for sub-sections. Paragraphs must be well-developed (at least 150 words each).

      **Article Structure:**

      # ${movieTitle} Cast & Characters – Lead Actors and Role Analysis

      ## Introduction (200-250 words)
      Introduce the ensemble cast and their importance to the film's success. Use the keyword "${movieTitle} Cast".

      ## Lead Actors and Their Character Arcs (500-600 words)
      Dedicate a detailed H3 section to each of the main actors (${cast?.slice(0, 3).map(c => c.name).join(", ")}). Analyze their performance, character development, and standout scenes.

      ## Supporting Cast Performances (300-400 words)
      Highlight the crucial supporting roles. How did they elevate the narrative and complement the lead actors?

      ## Casting Choices and Behind-the-Scenes Stories (250-350 words)
      Discuss the casting process. Were there other actors considered for the roles? Share any interesting anecdotes from the set regarding the actors' preparation.

      ## Director ${director?.join(", ")}'s Vision for the Characters
      Analyze how the director guided the performances to fit the film's overall tone and message.

      ## FAQ Section
      Create and answer 4-5 questions about the cast, cameos, and character details. Each answer should be 75-100 words.`,

    "review-analysis": `Generate a comprehensive review analysis of 1200-1500 words for "${movieTitle}" (${releaseYear}).

      **Core Instructions:**
      - **Word Count:** Strictly adhere to 1200-1500 words.
      - **Tone:** Objective, critical, and balanced.
      - **Formatting:** Use Markdown with H2 for main sections and H3 for sub-sections. Paragraphs must be well-developed (at least 150 words each).

      **Article Structure:**

      # ${movieTitle} Movie Review – Critical Consensus and Audience Reaction

      ## Introduction (200-250 words)
      Introduce the film and state the purpose of the review analysis. Use the keyword "${movieTitle} Review".

      ## Critical Consensus and Major Reviews (400-500 words)
      Summarize the opinions of major film critics. What were the common praises and criticisms? Discuss the film's aggregate scores (e.g., Rotten Tomatoes, Metacritic) if applicable.

      ## Audience Reaction and Word-of-Mouth (300-400 words)
      Analyze the general audience's response. How did it differ from the critics? Discuss social media trends and exit polls.

      ## Technical Analysis (300-400 words)
      - **H3: Direction and Screenplay:** Evaluate the pacing, dialogue, and overall execution by ${director?.join(", ")}.
      - **H3: Cinematography and Score:** Discuss the visual style and musical composition.

      ## Final Rating and Recommendation
      Provide a balanced final verdict. Who is this movie for? Is it worth watching in theaters or waiting for OTT?

      ## FAQ Section
      Create and answer 4-5 questions regarding the film's quality, age rating, and content warnings. Each answer should be 75-100 words.`,

    "hit-or-flop": `Generate a definitive "Hit or Flop" verdict article of 1000-1200 words for "${movieTitle}" (${releaseYear}).

      **Core Instructions:**
      - **Word Count:** Strictly adhere to 1000-1200 words.
      - **Tone:** Definitive, analytical, and industry-focused.
      - **Formatting:** Use Markdown with H2 for main sections and H3 for sub-sections. Paragraphs must be well-developed (at least 150 words each).

      **Article Structure:**

      # ${movieTitle} Hit or Flop – Box Office Verdict and Profit Analysis

      ## Introduction (200-250 words)
      Introduce the film's commercial journey. Use the keyword "${movieTitle} Hit or Flop".

      ## Final Box Office Numbers vs Budget (400-500 words)
      Compare the final worldwide collection (${boxOffice?.worldwide || 'N/A'}) against the estimated budget (${budget || 'N/A'}).

      ## Theatrical Run and Footfall Analysis (300-400 words)
      Analyze the film's longevity in theaters. Did it have strong legs, or did it drop off quickly after the opening weekend?

      ## OTT and Satellite Rights Recovery (250-350 words)
      Discuss how non-theatrical revenues (digital, satellite, music) contributed to the film's overall profitability and risk mitigation.

      ## Final Commercial Verdict
      Provide the definitive verdict (Blockbuster, Super Hit, Hit, Average, or Flop). Explain the criteria used to reach this conclusion based on the financial data.

      ## FAQ Section
      Create and answer 4-5 questions specifically addressing the film's commercial success or failure. Each answer should be 75-100 words.`, 

    "genre-analysis": `Analyze the genre and cinematic style of "${movieTitle}" (${releaseYear}). 
      Provide a concise, 2-3 sentence structured analysis that explains exactly what type of movie it is.
      Focus on blending genres (e.g., "A supernatural horror comedy that balances genuine scares with sharp social satire").
      Output ONLY the analysis text, no headings or formatting.`,
  };

  const prompt = prompts[pageType] || prompts.overview;

  try {
    let content = "";
    let isAI = false;

    // 1. Try Google Gemini (PAID) - High-performance intelligence engine
    if (genAI) {
      try {
        console.log(`🚀 Using Google Gemini (PAID) for ${movieTitle} (${pageType})...`);
        // Using Gemini 2.0 Flash as seen in your AI Studio dashboard
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompts[pageType] || prompts.overview);
        const response = await result.response;
        content = response.text();
        isAI = true;
      } catch (geminiErr) {
        console.error(`❌ Google Gemini failed: ${geminiErr.message}`);
        // If it's a 429, we skip retrying in API context to avoid timeouts
      }
    }

    // 2. Final Fallback: Template-based content if all AI models fail
    if (!isAI) {
      console.log(`⚠️ AI provider failed. Falling back to template-based content for ${movieTitle}.`);
      return { sections: generateFallbackContent(movieData, pageType), isAI: false };
    }

    // Return raw content for short analyses like genre
    if (pageType === "genre-analysis") {
      return { content: content.trim(), isAI: true };
    }

    // Structure content into sections for the database
    const sections = [];
    const lines = content.split('\n');
    let currentHeading = "";
    let currentContent = "";

    for (const line of lines) {
      if (line.startsWith('## ') || line.startsWith('### ')) {
        if (currentHeading || currentContent) {
          sections.push({ heading: currentHeading || "Introduction", content: currentContent.trim() });
        }
        currentHeading = line.replace(/#+\s*/, '').trim();
        currentContent = "";
      } else {
        currentContent += line + "\n";
      }
    }
    
    if (currentHeading || currentContent) {
      sections.push({ heading: currentHeading || "Conclusion", content: currentContent.trim() });
    }

    return { sections, isAI: true };
  } catch (error) {
    console.error(`CRITICAL AI Content Generation Error for ${movieTitle}:`, error.message);
    return { sections: generateFallbackContent(movieData, pageType), isAI: false };
  }
}

/**
 * Generates a high-quality template-based fallback if AI is unavailable.
 */
function generateFallbackContent(movieData, pageType) {
  const { movieTitle, releaseYear, summary, cast, director, genres, boxOffice, budget } = movieData;
  const sections = [];

  if (pageType === "overview") {
    sections.push({
      heading: `Introduction to ${movieTitle}`,
      content: `${movieTitle}, released in ${releaseYear}, is a significant entry in the ${genres?.join("/")} genre. Directed by ${director?.join(", ")}, the film has garnered attention for its unique storytelling and production scale.`
    });
    sections.push({
      heading: "Plot Summary",
      content: summary || "The film follows a compelling narrative that explores complex themes through its characters and setting. (AI-generated analysis pending...)"
    });
    sections.push({
      heading: "Cast & Performances",
      content: `The movie features a talented cast including ${cast?.slice(0, 3).map(c => c.name).join(", ")}, and others. Each performer brings a distinct energy to the screen, contributing to the overall impact of the production.`
    });
    sections.push({
      heading: "Technical Craft",
      content: `Under the direction of ${director?.join(", ")}, the film showcases impressive technical elements from cinematography to sound design, characteristic of high-quality ${genres?.[0] || 'cinema'} productions.`
    });
    sections.push({
      heading: "Final Verdict",
      content: `While a deeper AI-driven analysis is being processed, ${movieTitle} remains a must-watch for fans of ${genres?.[0] || 'the genre'}. It stands as a testament to the creative vision of its makers.`
    });
  } else if (pageType === "box-office") {
    sections.push({
      heading: "Financial Overview",
      content: `The financial performance of ${movieTitle} reflects its market reception. With a reported budget of ${budget || 'N/A'}, the film's global reach is a key indicator of its commercial success.`
    });
    sections.push({
      heading: "Box Office Performance",
      content: `Globally, the film has collected approximately ${boxOffice?.worldwide || 'N/A'}. This performance highlights the film's appeal across different territories and demographics.`
    });
  } else {
    sections.push({
      heading: "Content Analysis Pending",
      content: `A detailed ${pageType.replace("-", " ")} for ${movieTitle} is currently being prepared. Our AI engine will provide a deep-dive analysis shortly.`
    });
  }

  return sections;
}

/**
 * Generate structured celebrity intelligence data (Net Worth, Biography, etc.)
 */
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
  
  IMPORTANT: Use real-world public data or highly realistic estimates for 2025. Ensure the JSON is valid. Output ONLY the JSON object, no other text. Do not use markdown code blocks.`;

  try {
    let content = "";
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      content = response.text();
    }

    if (content) {
      // Clean up potential markdown formatting if AI ignored the "ONLY JSON" instruction
      const cleanedJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedJson);
    }
    return null;
  } catch (error) {
    console.error(`AI Celebrity Data Generation Error for ${celebName}:`, error.message);
    return null;
  }
}
