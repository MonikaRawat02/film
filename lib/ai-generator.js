import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate long-form SEO content for a movie article
 */
export async function generateMovieContent(movieData, pageType = "overview") {
  const { movieTitle, releaseYear: rawReleaseYear, summary, cast, director, genres, boxOffice, budget, ott } = movieData;
  const releaseYear = rawReleaseYear || "";
  const yearText = releaseYear ? ` (${releaseYear})` : "";

  const prompts = {
    overview: `Generate a comprehensive, SEO-optimized article of 1800-2200 words for the movie "${movieTitle}"${yearText}. This is the main pillar page and must be exceptionally detailed.

      **Core Instructions:**
      - **Word Count:** Strictly adhere to 1800-2200 words.
      - **Tone:** Authoritative, engaging, and analytical, like a professional film critic and industry analyst.
      - **Formatting:** Use Markdown with H2 for main sections and H3 for sub-sections. Paragraphs must be well-developed (at least 100-150 words each).

      **Article Structure:**

      # ${movieTitle} Movie${yearText} – Full Analysis, Box Office & OTT Details

      ## Introduction (150-200 words)
      Craft a compelling introduction that hooks the reader. Naturally integrate the keywords: "${movieTitle}", "Box Office", "OTT Release", and "Ending Explained".

      ## ${movieTitle}: A Deep-Dive into the Cinematic Experience
      Provide a detailed overview of the film's premise, its place within the ${genres?.join("/")} genre, and its overall impact. Discuss the direction by ${director?.join(", ")} and the film's unique selling points.

      ## Plot Synopsis & Key Narrative Arcs
      (This section should be 300-400 words)
      - **H3: The Setup:** Detail the first act and the establishment of the main characters and conflict.
      - **H3: The Confrontation:** Describe the rising action and the core challenges faced by the protagonists.
      - **H3: The Resolution:** Explain the climax and how the central conflict is resolved.

      ## ${movieTitle} Ending Explained
      (This section should be 250-350 words)
      Analyze the final scenes in detail. Discuss any ambiguity, thematic conclusions, and the ultimate fate of the characters. What is the core message the ending delivers?

      ## Box Office Performance & Financial Analysis
      - **H3: Budget vs. Worldwide Collection:** Analyze the film's budget of ${budget || 'N/A'} against its worldwide collection of ${boxOffice?.worldwide || 'N/A'}. Calculate the ROI and discuss its profitability.
      - **H3: Domestic and International Breakdown:** Discuss its performance in key markets.

      ## OTT Release and Digital Rights
      Provide details on its official OTT platform, release date, and the significance of its digital streaming rights deal.

      ## Cast, Characters, and Performances
      - **H3: Lead Cast Analysis:** Dedicate a paragraph to each of the main actors: ${cast?.slice(0, 3).map(c => c.name).join(", ")}. Discuss their portrayal, character arc, and impact on the film.
      - **H3: Supporting Roles & Noteworthy Performances:** Highlight key supporting actors and their contributions.

      ## Critical & Audience Reception
      Summarize the general consensus from both professional critics and the general audience. Mention any major awards or nominations.

      ## FAQ Section
      Create and answer 4-5 relevant frequently asked questions about the movie.`,
      
    "ending-explained": `Generate a deep-dive "Ending Explained" article of 1200-1500 words for "${movieTitle}"${yearText}. The focus is on analysis, symbolism, and thematic interpretation.

      **Core Instructions:**
      - **Word Count:** Strictly adhere to 1200-1500 words.
      - **Tone:** Scholarly, analytical, and insightful.
      - **Formatting:** Use Markdown with H2 for main sections and H3 for sub-sections. Paragraphs must be well-developed and well-supported.

      **Article Structure:**

      # ${movieTitle} Ending Explained – Deep Analysis, Theories & Hidden Meanings

      ## Introduction (150-200 words)
      Introduce the film's complex ending and state the article's purpose: to dissect its meaning. Use the keyword "${movieTitle} Ending Explained" naturally.

      ## The Final Sequence: A Moment-by-Moment Breakdown
      (This section should be 300-400 words)
      Provide a detailed, chronological account of the final 15-20 minutes of the film. Describe the events as they unfold, setting the stage for analysis.

      ## Deconstructing the Climax: Core Themes and Resolutions
      - **H3: Thematic Conclusion:** What are the central themes (e.g., redemption, sacrifice, justice) and how does the ending resolve them?
      - **H3: Character Fates:** Analyze the final state of the main characters. Did they achieve their goals? What does their end represent?

      ## Symbolism and Hidden Meanings
      (This section should be 250-350 words)
      Uncover and analyze any symbols, motifs, or visual cues in the final scenes. What deeper meanings are embedded in the cinematography and dialogue?

      ## Unanswered Questions & Fan Theories
      Discuss any ambiguities or unresolved plot points. Explore 2-3 popular fan theories and evaluate their validity based on the evidence in the film.

      ## FAQ Section
      Create and answer 4-5 in-depth questions specifically about the ending.`,

    "box-office": `Generate a detailed financial analysis of 1200-1500 words for "${movieTitle}"${yearText}. The article must be data-driven and analytical.

      **Core Instructions:**
      - **Word Count:** Strictly adhere to 1200-1500 words.
      - **Tone:** Financial analyst, data-centric, and authoritative.
      - **Formatting:** Use Markdown with H2 for main sections and H3 for sub-sections.

      **Article Structure:**

      # ${movieTitle} Box Office Collection – Budget, Profit, and ROI Analysis

      ## Introduction (150-200 words)
      Introduce the film's financial context. Use the keyword "${movieTitle} Box Office" and mention its budget (${budget || 'N/A'}) and worldwide collection (${boxOffice?.worldwide || 'N/A'}).

      ## Budget Breakdown: Where Was the Money Spent?
      Analyze the estimated budget of ${budget || 'N/A'}. Discuss typical allocations for a film of this scale (e.g., production, marketing, actor salaries).

      ## Domestic Box Office Performance
      - **H3: Opening Weekend & Theatrical Run:** Detail its opening weekend numbers and its week-over-week performance in the domestic market.
      - **H3: Market Analysis:** How did it perform against competitors? What factors influenced its domestic run?

      ## International Box Office Performance
      Analyze its performance in key overseas markets. Which territories contributed most to its success?

      ## Profitability and ROI Calculation
      (This section should be 250-350 words)
      Calculate the estimated profit and Return on Investment (ROI). Explain the formula (Worldwide Gross - Budget) and discuss the film's financial success relative to its cost.

      ## Final Verdict: Was It a Hit or a Flop?
      Based on the data, provide a definitive commercial verdict (e.g., Blockbuster, Super Hit, Hit, Average, Flop) and justify it.

      ## FAQ Section
      Create and answer 4-5 questions about the film's financial performance.`,
    "budget": `Generate a detailed breakdown of the budget for "${movieTitle}"${yearText}. The article must be 1000-1200 words.

      **Core Instructions:**
      - **Word Count:** Strictly adhere to 1000-1200 words.
      - **Tone:** Informative, industry-focused, and analytical.
      - **Formatting:** Use Markdown with H2 for main sections and H3 for sub-sections.

      **Article Structure:**

      # ${movieTitle} Movie Budget – Production Cost and Marketing Analysis

      ## Introduction (150-200 words)
      Introduce the film's scale and ambition. Use the keyword "${movieTitle} Budget" and state the estimated cost of ${budget || 'N/A'}.

      ## Estimated Production Cost Breakdown
      (This section should be 300-400 words)
      - **H3: Principal Photography & Locations:** Discuss the costs associated with filming, sets, and locations.
      - **H3: VFX and Post-Production:** Analyze the visual effects requirements and post-production expenses.

      ## Marketing and Promotional Expenses
      Detail the marketing strategy. How much was likely spent on P&A (Prints and Advertising)? Discuss trailers, press tours, and digital campaigns.

      ## Actor Fees and Major Production Costs
      Discuss the salaries of the lead cast (${cast?.slice(0, 3).map(c => c.name).join(", ")}) and the director (${director?.join(", ")}). How did talent costs impact the overall budget?

      ## Financial Risk and Recovery Analysis
      Evaluate the financial risk taken by the producers. What were the pre-release recovery avenues (e.g., satellite rights, music rights, OTT deals)?

      ## FAQ Section
      Create and answer 4-5 questions specifically about the film's budget and costs.`,

    "ott-release": `Generate a comprehensive guide about the OTT release of "${movieTitle}"${yearText}. The article must be 1000-1200 words.

      **Core Instructions:**
      - **Word Count:** Strictly adhere to 1000-1200 words.
      - **Tone:** Informative, consumer-focused, and up-to-date.
      - **Formatting:** Use Markdown with H2 for main sections and H3 for sub-sections.

      **Article Structure:**

      # ${movieTitle} OTT Release Date – Streaming Platform and Digital Rights

      ## Introduction (150-200 words)
      Introduce the film and its transition from theaters to digital. Use the keyword "${movieTitle} OTT Release".

      ## Streaming Platform Details
      (This section should be 250-350 words)
      Detail the official streaming platform (${ott?.platform || 'TBA'}). Discuss why this platform acquired the rights and what it means for subscribers.

      ## Digital Rights Acquisition & Deal Price
      Analyze the digital rights deal. If public, discuss the acquisition price. If not, estimate its value based on the film's scale and box office performance.

      ## Satellite and TV Premiere Details
      Discuss the television broadcast rights. Which network holds the rights, and when is the expected TV premiere?

      ## Global Streaming Availability
      - **H3: Regional Restrictions:** Are there different platforms for different countries?
      - **H3: Language and Subtitle Options:** Discuss the availability of dubbed versions and subtitles on the OTT platform.

      ## FAQ Section
      Create and answer 4-5 questions about where and how to stream the movie.`,

    "cast": `Generate a deep dive into the cast and characters of "${movieTitle}"${yearText}. The article must be 1200-1500 words.

      **Core Instructions:**
      - **Word Count:** Strictly adhere to 1200-1500 words.
      - **Tone:** Appreciative, analytical, and character-focused.
      - **Formatting:** Use Markdown with H2 for main sections and H3 for sub-sections.

      **Article Structure:**

      # ${movieTitle} Cast & Characters – Lead Actors and Role Analysis

      ## Introduction (150-200 words)
      Introduce the ensemble cast and their importance to the film's success. Use the keyword "${movieTitle} Cast".

      ## Lead Actors and Their Character Arcs
      (This section should be 400-500 words)
      Dedicate a detailed H3 section to each of the main actors (${cast?.slice(0, 3).map(c => c.name).join(", ")}). Analyze their performance, character development, and standout scenes.

      ## Supporting Cast Performances
      Highlight the crucial supporting roles. How did they elevate the narrative and complement the lead actors?

      ## Casting Choices and Behind-the-Scenes Stories
      Discuss the casting process. Were there other actors considered for the roles? Share any interesting anecdotes from the set regarding the actors' preparation.

      ## Director ${director?.join(", ")}'s Vision for the Characters
      Analyze how the director guided the performances to fit the film's overall tone and message.

      ## FAQ Section
      Create and answer 4-5 questions about the cast, cameos, and character details.`,

    "review-analysis": `Generate a comprehensive review analysis for "${movieTitle}" (${releaseYear}). The article must be 1200-1500 words.

      **Core Instructions:**
      - **Word Count:** Strictly adhere to 1200-1500 words.
      - **Tone:** Objective, critical, and balanced.
      - **Formatting:** Use Markdown with H2 for main sections and H3 for sub-sections.

      **Article Structure:**

      # ${movieTitle} Movie Review – Critical Consensus and Audience Reaction

      ## Introduction (150-200 words)
      Introduce the film and state the purpose of the review analysis. Use the keyword "${movieTitle} Review".

      ## Critical Consensus and Major Reviews
      (This section should be 300-400 words)
      Summarize the opinions of major film critics. What were the common praises and criticisms? Discuss the film's aggregate scores (e.g., Rotten Tomatoes, Metacritic) if applicable.

      ## Audience Reaction and Word-of-Mouth
      Analyze the general audience's response. How did it differ from the critics? Discuss social media trends and exit polls.

      ## Technical Analysis
      - **H3: Direction and Screenplay:** Evaluate the pacing, dialogue, and overall execution by ${director?.join(", ")}.
      - **H3: Cinematography and Score:** Discuss the visual style and musical composition.

      ## Final Rating and Recommendation
      Provide a balanced final verdict. Who is this movie for? Is it worth watching in theaters or waiting for OTT?

      ## FAQ Section
      Create and answer 4-5 questions regarding the film's quality, age rating, and content warnings.`,

    "hit-or-flop": `Generate a definitive "Hit or Flop" verdict article for "${movieTitle}" (${releaseYear}). The article must be 1000-1200 words.

      **Core Instructions:**
      - **Word Count:** Strictly adhere to 1000-1200 words.
      - **Tone:** Definitive, analytical, and industry-focused.
      - **Formatting:** Use Markdown with H2 for main sections and H3 for sub-sections.

      **Article Structure:**

      # ${movieTitle} Hit or Flop – Box Office Verdict and Profit Analysis

      ## Introduction (150-200 words)
      Introduce the film's commercial journey. Use the keyword "${movieTitle} Hit or Flop".

      ## Final Box Office Numbers vs Budget
      (This section should be 250-350 words)
      Compare the final worldwide collection (${boxOffice?.worldwide || 'N/A'}) against the estimated budget (${budget || 'N/A'}).

      ## Theatrical Run and Footfall Analysis
      Analyze the film's longevity in theaters. Did it have strong legs, or did it drop off quickly after the opening weekend?

      ## OTT and Satellite Rights Recovery
      Discuss how non-theatrical revenues (digital, satellite, music) contributed to the film's overall profitability and risk mitigation.

      ## Final Commercial Verdict
      Provide the definitive verdict (Blockbuster, Super Hit, Hit, Average, or Flop). Explain the criteria used to reach this conclusion based on the financial data.

      ## FAQ Section
      Create and answer 4-5 questions specifically addressing the film's commercial success or failure.`,

    "genre-analysis": `Analyze the genre and cinematic style of "${movieTitle}" (${releaseYear}). 
      Provide a concise, 2-3 sentence structured analysis that explains exactly what type of movie it is.
      Focus on blending genres (e.g., "A supernatural horror comedy that balances genuine scares with sharp social satire").
      Output ONLY the analysis text, no headings or formatting.`,
  };

  const prompt = prompts[pageType] || prompts.overview;

  try {
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini"; // Default to mini for cost/quota
    console.log(`🤖 Using model: ${model}`);
    
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: "You are a professional film critic and SEO content strategist for FilmyFire. Your goal is to write high-ranking, engaging, and authoritative movie intelligence content." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0].message.content;
    
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
    console.error(`AI Content Generation Error for ${movieTitle}:`, error.message);
    
    // If it's a quota error or any other failure, return fallback content instead of failing
    if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('billing')) {
      console.log(`⚠️ Falling back to template-based content for ${movieTitle} due to OpenAI quota limits.`);
      return { sections: generateFallbackContent(movieData, pageType), isAI: false };
    }
    
    throw error; // Re-throw other critical errors
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
 * Generate celebrity data using AI for enrichment
 */
export async function generateCelebrityData(name, industry = "Bollywood") {
  try {
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    console.log(`🤖 Generating AI data for ${name} using ${model}...`);
    
    const prompt = `Generate comprehensive celebrity data for ${name} from the ${industry} industry.

**Required Data Structure:**
{
  "heroSection": {
    "birthday": "YYYY-MM-DD",
    "placeOfBirth": "City, Country",
    "filmsCount": number,
    "awardsCount": number,
    "height": "X'Y\" (cm)"
  },
  "quickFacts": {
    "age": number,
    "birthDate": "YYYY-MM-DD",
    "notableMovies": ["Movie1", "Movie2", "Movie3"]
  },
  "netWorth": {
    "netWorthUSD": {
      "amount": number,
      "display": "$X million"
    },
    "primaryIncome": "Acting/Directing/Producing",
    "currency": "USD"
  },
  "netWorthCalculation": {
    "methodology": "Based on film fees, endorsements, and business ventures",
    "lastUpdated": "${new Date().toISOString().split('T')[0]}"
  },
  "netWorthTimeline": [
    {"year": 2020, "amount": 10000000, "display": "$10M"},
    {"year": 2022, "amount": 15000000, "display": "$15M"},
    {"year": 2024, "amount": 25000000, "display": "$25M"}
  ],
  "assets": [
    {"type": "Real Estate", "value": 5000000, "description": "Luxury apartment in Mumbai"},
    {"type": "Cars", "value": 300000, "description": "Luxury car collection"}
  ]
}

**Instructions:**
- Return ONLY valid JSON, no additional text
- Ensure all dates are in YYYY-MM-DD format
- Use realistic numbers based on ${industry} industry standards
- Include 3-5 notable movies
- Net worth should be realistic for ${name}'s career stage
- Timeline should show reasonable growth
- Assets should be typical for successful ${industry} celebrities`;

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: "You are a celebrity data analyst specializing in entertainment industry research. Generate accurate, realistic celebrity data in strict JSON format." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3, // Lower temperature for more factual responses
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    
    // Parse the JSON response
    const aiData = JSON.parse(content.trim());
    
    console.log(`✅ Successfully generated AI data for ${name}`);
    return aiData;
    
  } catch (error) {
    console.error(`AI Celebrity Data Generation Error for ${name}:`, error.message);
    
    // Return fallback data if AI fails
    return {
      heroSection: {
        birthday: null,
        placeOfBirth: null,
        filmsCount: 0,
        awardsCount: 0,
        height: null
      },
      quickFacts: {
        age: null,
        birthDate: null,
        notableMovies: []
      },
      netWorth: {
        netWorthUSD: {
          amount: 0,
          display: "$0"
        },
        primaryIncome: "Acting",
        currency: "USD"
      },
      netWorthCalculation: {
        methodology: "Estimation based on industry standards",
        lastUpdated: new Date().toISOString().split('T')[0]
      },
      netWorthTimeline: [],
      assets: []
    };
  }
}
