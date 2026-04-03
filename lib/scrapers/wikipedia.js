import axios from "axios";
import * as cheerio from "cheerio";
import { slugify } from "../slugify.js";
import { getUsdToInrRate } from "../api-clients/currency.js";

// Configuration constants
const CONFIG = {
  USER_AGENT: "FilmyFireBot/1.0 (https://filmyfire.com; contact@filmyfire.com) axios/1.13.6",
  USD_TO_INR_RATE: 83.0, // Fallback rate
  MIN_CONTENT_LENGTH: 50,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 15000, // Increased timeout for potentially large pages
};

let LIVE_USD_TO_INR_RATE = CONFIG.USD_TO_INR_RATE;

// AI Extraction Helper Function
async function extractCelebrityDataWithAI(celebrityData) {
  try {
    const protocol = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await axios.post(
      `${protocol}/api/celebrity/extract-details`,
      {
        slug: celebrityData.heroSection.slug,
        refresh: true
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    if (response.data.success) {
      console.log(`✅ AI extraction completed for ${celebrityData.heroSection.name}`);
    }
  } catch (error) {
    console.error(`❌ AI extraction error for ${celebrityData.heroSection.name}:`, error.message);
    throw error;
  }
}

// Fetch the live rate once when the module is loaded
(async () => {
  try {
    const rate = await getUsdToInrRate();
    if (rate) {
      LIVE_USD_TO_INR_RATE = rate;
    }
  } catch (error) {
    console.error("Failed to fetch live currency rate:", error.message);
  }
})();

// Utility function for retry logic
async function fetchWithRetry(url, retries = CONFIG.MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await axios.get(url, {
        headers: { "User-Agent": CONFIG.USER_AGENT },
        timeout: CONFIG.TIMEOUT,
      });
      return data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * (i + 1)));
    }
  }
}

// Utility function to clean text
function cleanText(text) {
  return text
    .replace(/\[\d+\]/g, "") // Remove citation numbers
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

// Utility function to extract year from date string
function extractYear(dateString) {
  const match = dateString.match(/\d{4}/);
  return match ? parseInt(match[0]) : null;
}

// Utility function to parse list items from Wikipedia data
function parseListItems($, element, selector = "a") {
  const items = [];
  $(element).find(selector).each((_, item) => {
    const name = $(item).text().trim();
    if (name && !/^\[.*\]$/.test(name)) {
      items.push({ name, slug: slugify(name) });
    }
  });
  return items;
}

// Utility function to extract net worth from text
function extractNetWorth(text, industry = "Hollywood") {
  const patterns = {
    usd: /(?:US\$|USD)\s*(\d+(?:\.\d+)?(?:–\d+(?:\.\d+)?)?)\s*(million|billion|M|B)/i,
    inr: /₹\s*(\d+(?:\.\d+)?(?:–\d+(?:\.\d+)?)?)\s*(crore|Cr|billion|B)/i,
    generic: /net\s*worth\s*(?:of|is|estimated\s*at)?\s*(?:US\$)?\s*(\d+(?:\.\d+)?(?:–\d+(?:\.\d+)?)?)\s*(million|billion|M|B)/i
  };

  let usdValue = null, inrValue = null;

  for (const pattern of Object.values(patterns)) {
    const match = text.match(pattern);
    if (match) {
      const range = match[1].split(/[–-]/);
      const minVal = parseFloat(range[0]);
      const maxVal = range[1] ? parseFloat(range[1]) : minVal;
      const unit = match[2].toLowerCase();
      const multiplier = unit.startsWith('b') ? 1000 : 1;

      if (pattern === patterns.inr) {
        inrValue = { min: minVal * multiplier, max: maxVal * multiplier };
      } else {
        usdValue = { min: minVal * multiplier, max: maxVal * multiplier };
      }
      break;
    }
  }

  // Convert between currencies if only one is found
  if (usdValue && !inrValue) {
    inrValue = {
      min: Math.round(usdValue.min * LIVE_USD_TO_INR_RATE),
      max: Math.round(usdValue.max * LIVE_USD_TO_INR_RATE)
    };
  } else if (inrValue && !usdValue) {
    usdValue = {
      min: parseFloat((inrValue.min / LIVE_USD_TO_INR_RATE).toFixed(1)),
      max: parseFloat((inrValue.max / LIVE_USD_TO_INR_RATE).toFixed(1))
    };
  }

  return { usdValue, inrValue };
}

// Improved movie/content scraper
export async function scrapeWikipediaMovie(movieUrl) {
  try {
    const data = await fetchWithRetry(movieUrl);
    const $ = cheerio.load(data);
    
    const infoBox = $(".infobox.vevent, .infobox.itv, .infobox");
    if (!infoBox.length) return null;

    // Clean up DOM
    $("style, script, .reference, .mw-empty-elt").remove();

    const rawTitle = $(".infobox-title").text().trim() || 
                     $(".infobox-above").text().trim() ||
                     $("h1#firstHeading").text().replace(/ \(.*?\)/, "").trim();
    
    if (rawTitle.toLowerCase().includes("citation needed") || rawTitle.length < 2) {
      return null;
    }

    const movieData = {
      title: rawTitle,
      poster: "",
      releaseYear: null,
      budget: "N/A",
      boxOffice: { worldwide: "N/A" },
      cast: [],
      director: [],
      producer: [],
      writer: [],
      genres: [],
      summary: cleanText($(".mw-parser-output > p").not(".mw-empty-elt").first().text()),
      criticalResponse: "",
      sections: [],
      scrapedAt: new Date().toISOString(),
    };

    // Extract poster
    const posterEl = infoBox.find("img").first();
    if (posterEl.length) {
      let src = posterEl.attr("src");
      if (src) {
        src = src.startsWith("http") ? src : `https:${src}`;
        // Get high-res version by removing thumbnail scaling
        if (src.includes("/thumb/")) {
          const parts = src.split("/");
          parts.pop();
          parts.splice(parts.indexOf("thumb"), 1);
          src = parts.join("/");
        }
        movieData.poster = src;
      }
    }

    // Extract sections and map to pSEO fields
    const headings = $(".mw-parser-output .mw-heading2, .mw-parser-output h2, .mw-parser-output h3, .mw-parser-output .mw-heading3");
    const skipSections = ["references", "external links", "further reading", "see also", "notes", "contents"];
    
    headings.each((_, el) => {
      const $el = $(el);
      const heading = cleanText($el.text().replace(/\[edit\]/g, ""));
      const lowerHeading = heading.toLowerCase();
      
      if (skipSections.some(s => lowerHeading.includes(s))) return;

      let content = "";
      let curr = $el.next();
      
      while (curr.length && !curr.is(".mw-heading2, h2, .mw-heading3, h3")) {
        if (curr.is("p, ul, ol")) {
          const text = cleanText(curr.text());
          if (text.length > CONFIG.MIN_CONTENT_LENGTH) {
            content += text + "\n\n";
          }
        }
        curr = curr.next();
      }

      if (content.trim().length > CONFIG.MIN_CONTENT_LENGTH) {
        const section = { heading, content: content.trim() };
        movieData.sections.push(section);

        // Map to pSEO fields based on heading keywords
        if (lowerHeading.includes("cast") || lowerHeading.includes("starring")) {
          movieData.pSEO_Content_cast = movieData.pSEO_Content_cast || [];
          movieData.pSEO_Content_cast.push(section);
        } else if (lowerHeading.includes("plot") || lowerHeading.includes("synopsis") || lowerHeading.includes("story")) {
          movieData.pSEO_Content_overview = movieData.pSEO_Content_overview || [];
          movieData.pSEO_Content_overview.push(section);
        } else if (lowerHeading.includes("box office")) {
          movieData.pSEO_Content_box_office = movieData.pSEO_Content_box_office || [];
          movieData.pSEO_Content_box_office.push(section);
        } else if (lowerHeading.includes("production") || lowerHeading.includes("budget")) {
          movieData.pSEO_Content_budget = movieData.pSEO_Content_budget || [];
          movieData.pSEO_Content_budget.push(section);
        } else if (lowerHeading.includes("reception") || lowerHeading.includes("critical") || lowerHeading.includes("review")) {
          movieData.pSEO_Content_review_analysis = movieData.pSEO_Content_review_analysis || [];
          movieData.pSEO_Content_review_analysis.push(section);
        } else if (lowerHeading.includes("release") || lowerHeading.includes("distribution")) {
          movieData.pSEO_Content_ott_release = movieData.pSEO_Content_ott_release || [];
          movieData.pSEO_Content_ott_release.push(section);
        }
      }
    });

    // Extract infobox data
    infoBox.find("tr").each((_, el) => {
      const label = $(el).find(".infobox-label, th").text().trim().toLowerCase();
      const dataEl = $(el).find(".infobox-data, td");
      const value = cleanText(dataEl.text());

      switch (true) {
        case label.includes("release date") || label.includes("original release"):
          movieData.releaseYear = extractYear(value);
          break;
        case label.includes("budget"):
          movieData.budget = value;
          break;
        case label.includes("box office"):
          movieData.boxOffice.worldwide = value;
          break;
        case label.includes("starring"):
          const castItems = parseListItems($, dataEl);
          movieData.cast = castItems.length ? castItems : 
            value.split(/[,;]|\band\b/).map(a => ({ name: a.trim(), slug: slugify(a.trim()) })).filter(c => c.name);
          break;
        case label.includes("directed by"):
          movieData.director = parseListItems($, dataEl).map(d => d.name);
          if (!movieData.director.length) {
            movieData.director = value.split(/[,;]|\band\b/).map(d => d.trim()).filter(Boolean);
          }
          break;
        case label.includes("produced by"):
          movieData.producer = parseListItems($, dataEl).map(p => p.name);
          if (!movieData.producer.length) {
            movieData.producer = value.split(/[,;]|\band\b/).map(p => p.trim()).filter(Boolean);
          }
          break;
        case label.includes("written by") || label.includes("screenplay by") || label.includes("story by"):
          movieData.writer = parseListItems($, dataEl).map(w => w.name);
          if (!movieData.writer.length) {
            movieData.writer = value.split(/[,;]|\band\b/).map(w => w.trim()).filter(Boolean);
          }
          break;
        case label.includes("genre"):
          movieData.genres = parseListItems($, dataEl).map(g => g.name);
          if (!movieData.genres.length) {
            movieData.genres = value.split(/[,;]|\band\b/).map(g => g.trim()).filter(Boolean);
          }
          break;
        case label.includes("network") || label.includes("original network") || label.includes("distributor"):
          movieData.ottPlatform = value;
          break;
      }
    });

    // Extract critical response
    const responseHeading = $("#Critical_response, #Reception").first();
    if (responseHeading.length) {
      const responseText = cleanText(responseHeading.parent().nextUntil("h2, h3").text());
      movieData.criticalResponse = responseText;
      
      // Extract highlights (first few meaningful sentences)
      movieData.highlights = responseText
        .split(/[.!?]/)
        .map(s => s.trim())
        .filter(s => s.length > 50 && s.length < 200)
        .slice(0, 3);
    }

    return movieData;
  } catch (error) {
    console.error(`Error scraping Wikipedia for ${movieUrl}:`, error.message);
    return null;
  }
}

// Improved movie/content list scraper
export async function getMoviesByYear(year, category = "Hollywood") {
  try {
    const categoryMap = {
      bollywood: `https://en.wikipedia.org/wiki/List_of_Hindi_films_of_${year}`,
      hollywood: `https://en.wikipedia.org/wiki/${year}_in_film`,
      webseries: `https://en.wikipedia.org/wiki/Category:Indian_web_series`,
      boxoffice: `https://en.wikipedia.org/wiki/List_of_highest-grossing_Indian_films`,
      ott: `https://en.wikipedia.org/wiki/Category:Netflix_original_programming`,
    };

    let url = categoryMap[category.toLowerCase()];
    if (!url) {
      throw new Error(`Unsupported category: ${category}`);
    }

    const data = await fetchWithRetry(url);
    const $ = cheerio.load(data);
    
    const movieUrls = [];
    
    if (category.toLowerCase() === 'webseries' || category.toLowerCase() === 'ott') {
      console.log(`🔍 Scraping ${category} from category page: ${url}`);
      // Scrape from category page
      const links = $(".mw-category-group ul li a");
      console.log(`🔗 Found ${links.length} potential links`);
      links.each((_, el) => {
        const $el = $(el);
        const href = $el.attr("href");
        if (href && href.startsWith("/wiki/")) {
          movieUrls.push({
            title: cleanText($el.text()),
            url: `https://en.wikipedia.org${href}`,
            year,
            category,
          });
        }
      });
    } else if (category.toLowerCase() === 'boxoffice') {
      console.log(`🔍 Scraping BoxOffice from list page: ${url}`);
      $("table.wikitable").first().find("tr").each((_, row) => {
        const firstLink = $(row).find("td i a").first() || $(row).find("td a").first();
        if (firstLink.length) {
          const href = firstLink.attr("href");
          if (href && href.startsWith("/wiki/")) {
            movieUrls.push({
              title: cleanText(firstLink.text()),
              url: `https://en.wikipedia.org${href}`,
              year,
              category,
            });
          }
        }
      });
    } else {
      // Scrape from wikitable (for movies)
      $("table.wikitable").each((_, table) => {
        $(table).find("tr").each((_, row) => {
          const firstLink = $(row).find("td i a").first();
          if (firstLink.length) {
            const href = firstLink.attr("href");
            if (href && href.startsWith("/wiki/")) {
              movieUrls.push({
                title: cleanText(firstLink.text()),
                url: `https://en.wikipedia.org${href}`,
                year,
                category,
              });
            }
          }
        });
      });
    }

    return movieUrls;
  } catch (error) {
    console.error(`Error getting movie list for ${year} (${category}):`, error.message);
    return [];
  }
}

// Improved celebrity scraper
export async function scrapeWikipediaCelebrity(url, industry = "Bollywood") {
  try {
    const data = await fetchWithRetry(url);
    const $ = cheerio.load(data);

    // Clean up DOM
    $("style, script, .mw-empty-elt, .reference, .noprint, .mw-editsection, .ambox, .navbox").remove();

    const infoBox = $(".infobox.biota, .infobox.vcard, .infobox.person, .infobox.table-responsive");
    
    // Extract name
    const name = cleanText($(".infobox-title, .fn").first().text()) || 
                 cleanText($("h1#firstHeading").text());
    
    if (!name || name.toLowerCase().includes("citation needed") || name.length < 2) return null;

    // Initialize data structure
    const celebrityData = {
      heroSection: {
        name,
        slug: slugify(name),
        profession: [],
        profileImage: "",
        nationality: "N/A",
        industry,
        height: "N/A",
        filmsCount: 0,
        awardsCount: 0,
        careerStage: "Active",
        growthPercentage: Math.floor(Math.random() * 25) + 5
      },
      netWorth: {
        title: `${name} Net Worth 2026`,
        year: 2026,
        description: "",
        currencyToggle: ["USD", "INR"],
        netWorthINR: { min: 0, max: 0, display: "N/A" },
        netWorthUSD: { min: 0, max: 0, display: "N/A" },
        lastUpdated: new Date(),
        estimationNote: "Net worth is estimated based on career earnings, brand deals, and public records.",
        analysisSummary: ""
      },
      netWorthAnalysis: {
        estimatedRange: { min: 0, max: 0 },
        displayRange: "N/A",
        currency: "USD",
        lastUpdated: new Date(),
        description: ""
      },
      quickFacts: {
        age: null,
        birthDate: null,
        profession: [],
        activeSince: null,
        brandEndorsements: Math.floor(Math.random() * 10) + 5
      },
      netWorthCalculation: {
        incomeSources: [
          { sourceName: "Acting", percentage: 65, description: "Major income from film and television roles." },
          { sourceName: "Endorsements", percentage: 25, description: "Commercial deals with leading brands." },
          { sourceName: "Business Ventures", percentage: 10, description: "Personal investments and production ventures." }
        ]
      },
      netWorthTimeline: { timeline: [], keyMilestones: [] },
      biographyTimeline: [],
      assets: [],
      celebrityComparisons: { comparisons: [] },
      relatedIntelligence: [
        {
          category: "Career",
          title: "Industry Impact",
          description: `${name} has established a strong presence in the ${industry} film industry.`
        },
        {
          category: "Wealth",
          title: "Net Worth Growth",
          description: `Analysis of ${name}'s wealth accumulation and major income sources like brand endorsements and film projects.`
        }
      ],
      faqs: [],
      netWorthDisclaimer: {
        title: "Disclaimer",
        description: "Financial figures are based on multiple public sources and represent estimates only.",
        highlights: [
          { title: "Based on Public Sources", description: "Estimates derived from multiple credible financial reports and public interviews." },
          { title: "Subject to Market Changes", description: "Celebrity wealth fluctuates based on market conditions and new career ventures." },
          { title: "Net Worth vs Cash Flow", description: "Reported figures include total assets and are not necessarily liquid cash." }
        ]
      },
      premiumIntelligence: { title: `Detailed Career Analysis: ${name}`, description: "Unlock deep-dive analytics on career growth and wealth accumulation." },
      scrapedAt: new Date().toISOString(),
    };

    // Extract profile image
    const imageEl = infoBox.find("img").first();
    if (imageEl.length) {
      let src = imageEl.attr("src");
      if (src) {
        celebrityData.heroSection.profileImage = src.startsWith("http") ? src : `https:${src}`;
      }
    }

    // Extract infobox data
    if (infoBox.length) {
      infoBox.find("tr").each((_, el) => {
        const label = $(el).find("th, .infobox-label").text().trim().toLowerCase();
        const valueEl = $(el).find("td, .infobox-data");
        const value = cleanText(valueEl.text());

        switch (true) {
          case label.includes("occupation") || label.includes("profession") || label.includes("work"):
            celebrityData.heroSection.profession = value.split(/[,;]|\band\b/).map(p => p.trim()).filter(Boolean);
            celebrityData.quickFacts.profession = celebrityData.heroSection.profession;
            break;
          case label.includes("nationality"):
            celebrityData.heroSection.nationality = value;
            break;
          case label.includes("height"):
            celebrityData.heroSection.height = value;
            break;
          case label.includes("born"):
            const dateMatch = value.match(/(\d{1,2}\s+\w+\s+\d{4})|(\w+\s+\d{1,2},\s+\d{4})|(\d{4}-\d{2}-\d{2})/);
            if (dateMatch) {
              const birthDate = new Date(dateMatch[0]);
              if (!isNaN(birthDate.getTime())) {
                celebrityData.quickFacts.birthDate = birthDate;
                celebrityData.quickFacts.age = new Date().getFullYear() - birthDate.getFullYear();
              }
            }
            const ageMatch = value.match(/age\s*(\d+)/i) || value.match(/\((\d+)\)/);
            if (ageMatch && !celebrityData.quickFacts.age) {
              celebrityData.quickFacts.age = parseInt(ageMatch[1]);
            }
            break;
          case label.includes("active") || label.includes("since") || label.includes("start"):
            celebrityData.heroSection.activeSince = extractYear(value);
            celebrityData.quickFacts.activeSince = celebrityData.heroSection.activeSince;
            break;
          case label.includes("spouse") || label.includes("partner"):
            celebrityData.quickFacts.spouse = value;
            break;
          case label.includes("children") || label.includes("kids"):
            celebrityData.quickFacts.children = value;
            break;
          case label.includes("education") || label.includes("alma mater"):
            celebrityData.quickFacts.education = value;
            break;
          case label.includes("awards") || label.includes("honours"):
            const awardsCount = value.match(/\d+/);
            if (awardsCount) celebrityData.heroSection.awardsCount = parseInt(awardsCount[0]);
            break;
        }
      });
    }

    // Extract summary and biography
    const paragraphs = $(".mw-parser-output > p").not(".mw-empty-elt");
    paragraphs.each((i, el) => {
      const text = cleanText($(el).text());
      if (text.length > 100) {
        if (!celebrityData.netWorth.analysisSummary) {
          celebrityData.netWorth.analysisSummary = text;
        }
        if (i < 5) { // Increased from 3 to 5 for more info
          celebrityData.heroSection.biography = (celebrityData.heroSection.biography || "") + text + "\n\n";
        }
      }
    });

    // Set default nationality if not found
    if (celebrityData.heroSection.nationality === "N/A" && celebrityData.netWorth.analysisSummary) {
      if (celebrityData.netWorth.analysisSummary.includes("Indian")) celebrityData.heroSection.nationality = "Indian";
      else if (celebrityData.netWorth.analysisSummary.includes("American")) celebrityData.heroSection.nationality = "American";
      else if (celebrityData.netWorth.analysisSummary.includes("British")) celebrityData.heroSection.nationality = "British";
    }

    // Count films and awards
    $("h2, h3").each((_, heading) => {
      const $h = $(heading);
      const title = $h.text().toLowerCase();
      
      if (title.includes('filmography') || title.includes('films') || title.includes('television') || title.includes('career')) {
        let curr = $h.parent().is("div") ? $h.parent().next() : $h.next();
        while (curr.length && !curr.is("h2, h3, div:has(h2), div:has(h3)")) {
          if (curr.is('table.wikitable')) {
            celebrityData.heroSection.filmsCount += curr.find('tr').length - 1;
          } else if (curr.is('ul')) {
            celebrityData.heroSection.filmsCount += curr.find('li').length;
          }
          curr = curr.next();
        }
      }
      
      if (title.includes('awards') || title.includes('accoldades') || title.includes('nominations') || title.includes('honours')) {
        let curr = $h.parent().is("div") ? $h.parent().next() : $h.next();
        while (curr.length && !curr.is("h2, h3, div:has(h2), div:has(h3)")) {
          if (curr.is('table.wikitable')) {
            celebrityData.heroSection.awardsCount += curr.find('tr').length - 1;
          } else if (curr.is('ul')) {
            celebrityData.heroSection.awardsCount += curr.find('li').length;
          }
          curr = curr.next();
        }
      }
    });

    // Extract net worth
    const netWorthSection = $("h2:contains('Net worth'), h2:contains('Wealth'), h3:contains('Net worth'), h3:contains('Wealth'), h2:contains('Earnings')").first();
    let netWorthText = "";
    
    if (netWorthSection.length) {
      netWorthText = cleanText(netWorthSection.parent().nextUntil("h2, h3").text());
    } else {
      netWorthText = paragraphs.slice(0, 5).text().trim().replace(/\[\d+\]/g, "");
    }

    if (netWorthText) {
      const { usdValue, inrValue } = extractNetWorth(netWorthText, industry);
      
      if (usdValue && usdValue.min > 0) {
        celebrityData.netWorth.netWorthUSD = {
          min: usdValue.min,
          max: usdValue.max,
          display: `$${usdValue.min.toFixed(1)}${usdValue.min !== usdValue.max ? `-${usdValue.max.toFixed(1)}` : ''}M`
        };
        celebrityData.netWorthAnalysis.estimatedRange = { min: usdValue.min, max: usdValue.max };
        celebrityData.netWorthAnalysis.displayRange = celebrityData.netWorth.netWorthUSD.display;
      }
      
      if (inrValue && inrValue.min > 0) {
        celebrityData.netWorth.netWorthINR = {
          min: inrValue.min,
          max: inrValue.max,
          display: `₹${inrValue.min}${inrValue.min !== inrValue.max ? `-${inrValue.max}` : ''} Cr`
        };
      }
      
      celebrityData.netWorth.description = netWorthText.slice(0, 1000);
      celebrityData.netWorthAnalysis.description = celebrityData.netWorth.description;
    }

    // Generate estimated net worth if none found or too low
    if (celebrityData.netWorth.netWorthUSD.display === "N/A" || celebrityData.netWorth.netWorthUSD.min < 1) {
      const yearsActive = celebrityData.heroSection.activeSince ? (new Date().getFullYear() - celebrityData.heroSection.activeSince) : 8;
      const totalFilms = celebrityData.heroSection.filmsCount || 5;
      const basePerFilm = industry === "Bollywood" ? 0.5 : 1.5;
      const experienceBonus = Math.min(2, yearsActive / 15);
      
      const estimatedMin = Math.round(Math.max(1, totalFilms * basePerFilm * (1 + experienceBonus * 0.4)));
      const estimatedMax = Math.round(estimatedMin * 2.2);

      celebrityData.netWorth.netWorthUSD = {
        min: estimatedMin,
        max: estimatedMax,
        display: `$${estimatedMin}-${estimatedMax}M`
      };
      celebrityData.netWorthAnalysis.estimatedRange = { min: estimatedMin, max: estimatedMax };
      celebrityData.netWorthAnalysis.displayRange = celebrityData.netWorth.netWorthUSD.display;
      
      celebrityData.netWorth.netWorthINR = {
        min: Math.round(estimatedMin * LIVE_USD_TO_INR_RATE),
        max: Math.round(estimatedMax * LIVE_USD_TO_INR_RATE),
        display: `₹${Math.round(estimatedMin * LIVE_USD_TO_INR_RATE)}-${Math.round(estimatedMax * LIVE_USD_TO_INR_RATE)} Cr`
      };
      
      celebrityData.netWorth.description = `${name} has built a substantial net worth through a prolific career in ${industry}, spanning ${yearsActive} years and over ${totalFilms} film and television projects. (Estimated based on career scale)`;
      celebrityData.netWorthAnalysis.description = celebrityData.netWorth.description;
    }

    // Extract all sections as potential biography timeline entries if they are substantial
    const bioSections = ["early life", "career", "personal life", "philanthropy", "education", "background", "biography", "filmography", "public image", "discography"];
    
    $("h2, h3").each((_, el) => {
      const $h = $(el);
      const title = cleanText($h.text().replace(/\[edit\]/g, ""));
      const lowerTitle = title.toLowerCase();
      
      if (bioSections.some(s => lowerTitle.includes(s))) {
        let content = "";
        let curr = $h.is("h2") || $h.is("h3") ? ($h.parent().is("div") ? $h.parent().next() : $h.next()) : $h.next();
        
        while (curr.length && !curr.is("h2, h3, div:has(h2), div:has(h3)")) {
          if (curr.is("p, ul, ol")) {
            const text = cleanText(curr.text());
            if (text.length > 20) {
              content += text + "\n\n";
            }
          }
          curr = curr.next();
        }
        
        if (content.length > 50) {
          let period = "";
          const yearMatch = title.match(/\d{4}/g);
          
          if (yearMatch && yearMatch.length >= 2) {
            period = `${yearMatch[0]}-${yearMatch[1]}`;
          } else if (yearMatch && yearMatch.length === 1) {
            period = `${yearMatch[0]}-Present`;
          } else {
            const contentYears = content.match(/\d{4}/g);
            if (contentYears && contentYears.length > 0) {
              const sortedYears = contentYears.map(Number).sort((a, b) => a - b);
              period = `${sortedYears[0]}-${sortedYears[sortedYears.length - 1]}`;
            }
          }

          celebrityData.biographyTimeline.push({
            period: period || (celebrityData.heroSection.activeSince ? `${celebrityData.heroSection.activeSince}-Present` : "2020-Present"),
            title,
            description: content.slice(0, 3000) + (content.length > 3000 ? "..." : ""),
            subDescription: `Insights into ${name}'s ${title.toLowerCase()}.`
          });
        }
      }
    });

    // Net worth timeline
    if (celebrityData.netWorth.netWorthUSD.min) {
      celebrityData.netWorthTimeline.timeline = [
        { year: 2026, netWorth: celebrityData.netWorth.netWorthUSD.display },
        { year: 2025, netWorth: `$${(celebrityData.netWorth.netWorthUSD.min * 0.9).toFixed(0)}M` },
        { year: 2024, netWorth: `$${(celebrityData.netWorth.netWorthUSD.min * 0.8).toFixed(0)}M` },
        { year: 2020, netWorth: `$${(celebrityData.netWorth.netWorthUSD.min * 0.5).toFixed(0)}M` }
      ];
      celebrityData.netWorthTimeline.keyMilestones = [
        { year: celebrityData.heroSection.activeSince || 2018, milestone: "Began professional career in the industry" },
        { year: (celebrityData.heroSection.activeSince || 2018) + 3, milestone: "Achieved significant commercial success" },
        { year: 2024, milestone: "Major brand partnership deals finalized" }
      ];
    }

    // Extract dynamic assets from text
    const assetsFound = [];
    const assetKeywords = [
      { type: "Residence", keywords: ["house", "bungalow", "mansion", "apartment", "penthouse", "residence", "estate", "villa"] },
      { type: "Vehicle", keywords: ["car", "vehicle", "automobile", "luxury car", "collection", "garage", "fleet"] },
      { type: "Investment", keywords: ["business", "startup", "investment", "production company", "brand", "franchise"] }
    ];

    const allText = paragraphs.text().toLowerCase();
    
    assetKeywords.forEach(category => {
      paragraphs.each((_, p) => {
        const text = $(p).text().trim();
        const lowerText = text.toLowerCase();
        
        category.keywords.forEach(keyword => {
          if (lowerText.includes(keyword) && text.length < 500) {
            // Try to find a named asset (e.g., "Mannat")
            const capitalizedWords = text.match(/[A-Z][a-z]+/g);
            if (capitalizedWords && capitalizedWords.length > 0) {
              const potentialName = capitalizedWords.find(word => lowerText.includes(word.toLowerCase() + " " + keyword) || lowerText.includes(keyword + " " + word.toLowerCase()));
              if (potentialName) {
                assetsFound.push({
                  name: `${potentialName} ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
                  location: industry === "Bollywood" ? "Mumbai, India" : "USA",
                  description: text.slice(0, 200) + "...",
                  type: category.type
                });
              }
            }
          }
        });
      });
    });

    // Fallback to scaled assets if none found or too few
    const assetCategories = [
      { name: "Primary Residence", location: industry === "Bollywood" ? "Mumbai, India" : "Los Angeles, USA", baseValue: industry === "Bollywood" ? 15 : 5, unit: industry === "Bollywood" ? "Cr" : "M" },
      { name: "Luxury Vehicle Collection", location: "Private Garage", baseValue: industry === "Bollywood" ? 8 : 2.5, unit: industry === "Bollywood" ? "Cr" : "M" },
      { name: "Business & Investments", location: "Global", baseValue: "Varies", unit: "", description: "Diverse portfolio of equity in startups and real estate ventures." }
    ];

    celebrityData.assets = assetsFound.length >= 2 ? assetsFound.slice(0, 3).map(a => ({
      name: a.name,
      location: a.location,
      value: "Premium Asset",
      description: a.description,
      image: ""
    })) : assetCategories.map(asset => {
      let value = asset.value || "Confidential";
      if (asset.baseValue && typeof asset.baseValue === 'number') {
        const multiplier = Math.max(1, (celebrityData.netWorth.netWorthUSD.min / 20)); // Lowered threshold for better scaling
        const scaledValue = (asset.baseValue * multiplier).toFixed(1);
        value = industry === "Bollywood" ? `₹${scaledValue}${asset.unit}+` : `$${scaledValue}${asset.unit}+`;
      }
      
      return {
        name: asset.name,
        location: asset.location,
        value: value,
        description: asset.description || `A cornerstone of ${name}'s significant wealth and high-status lifestyle.`,
        image: ""
      };
    });

    // Generate dynamic FAQs
    const dynamicFaqs = [];
    
    // 1. Net Worth FAQ
    if (celebrityData.netWorth.netWorthUSD.display !== "N/A") {
      dynamicFaqs.push({
        question: `What is ${name}'s net worth in 2026?`,
        answer: `As of 2026, ${name}'s estimated net worth is approximately ${celebrityData.netWorth.netWorthUSD.display} (${celebrityData.netWorth.netWorthINR.display}). This wealth is attributed to a successful career in ${industry}, brand endorsements, and private investments.`
      });
    }

    // 2. Career FAQ
    dynamicFaqs.push({
      question: `How many movies has ${name} worked in?`,
      answer: `${name} has been part of over ${celebrityData.heroSection.filmsCount || 15} film and television productions throughout their career in the ${industry} industry.`
    });

    // 3. Age/Birth FAQ
    if (celebrityData.quickFacts.age) {
      dynamicFaqs.push({
        question: `How old is ${name}?`,
        answer: `${name} is currently ${celebrityData.quickFacts.age} years old. ${celebrityData.quickFacts.birthDate ? `They were born on ${celebrityData.quickFacts.birthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.` : ""}`
      });
    }

    // 4. Education FAQ
    if (celebrityData.quickFacts.education) {
      dynamicFaqs.push({
        question: `Where did ${name} get their education?`,
        answer: `${name} attended ${celebrityData.quickFacts.education}, which helped shape their early background before entering the entertainment industry.`
      });
    }

    // 5. Active Status FAQ
    dynamicFaqs.push({
      question: `Is ${name} still active in ${industry}?`,
      answer: `Yes, ${name} remains an active and influential figure in the ${industry} film industry, with several upcoming projects and brand collaborations.`
    });

    // 6. Family FAQ (if available)
    if (celebrityData.quickFacts.spouse) {
      dynamicFaqs.push({
        question: `Who is ${name} married to?`,
        answer: `${name} is married to ${celebrityData.quickFacts.spouse}.`
      });
    }

    celebrityData.faqs = dynamicFaqs;

    // 7. AI-Powered Data Extraction (Extract structured data from biography)
    // This will run asynchronously and update the database separately
    extractCelebrityDataWithAI(celebrityData).catch(err => 
      console.error(`AI extraction failed for ${name}:`, err.message)
    );

    return celebrityData;
  } catch (error) {
    console.error(`Error scraping celebrity ${url}:`, error.message);
    return null;
  }
}

// Improved celebrity URL scraper
export async function getCelebrityUrlsByIndustry(industry = "Bollywood") {
  try {
    const industryConfig = {
      bollywood: {
        urls: ["https://en.wikipedia.org/wiki/List_of_Hindi_film_actors"],
        filters: {
          excludePatterns: [/Category:/, /Template:/, /Help:/, /Special:/, /List of/, /Lists of/, /Bollywood Hungama/],
          minNameLength: 3,
        }
      },
      hollywood: {
        urls: [
          "https://en.wikipedia.org/wiki/Academy_Award_for_Best_Actor",
          "https://en.wikipedia.org/wiki/Academy_Award_for_Best_Actress"
        ],
        filters: {
          excludePatterns: [/Category:/, /Template:/, /Help:/, /Special:/, /Academy Award/, /Oscar/],
          minNameLength: 3,
          excludeItalicized: true,
        }
      }
    };

    const config = industryConfig[industry.toLowerCase()];
    if (!config) {
      throw new Error(`Unsupported industry: ${industry}`);
    }

    const celebUrls = [];
    
    for (const url of config.urls) {
      const data = await fetchWithRetry(url);
      const $ = cheerio.load(data);
      
      $(".mw-parser-output ul li a, .mw-parser-output table.wikitable td a, .mw-category-group ul li a").each((_, el) => {
        const $el = $(el);
        const href = $el.attr("href");
        const title = $el.attr("title");
        const text = cleanText($el.text());
        
        // Apply filters
        if (!href || !href.startsWith("/wiki/") || !title) return;
        
        for (const pattern of config.filters.excludePatterns) {
          if (pattern.test(title) || pattern.test(text)) return;
        }
        
        if (text.length < config.filters.minNameLength) return;
        
        if (config.filters.excludeItalicized && $el.closest('i').length > 0) return;
        
        celebUrls.push({
          name: text,
          url: `https://en.wikipedia.org${href}`,
          industry,
        });
      });
    }

    // Remove duplicates
    const uniqueCelebs = Array.from(new Map(celebUrls.map(c => [c.url, c])).values());
    return uniqueCelebs;
  } catch (error) {
    console.error(`Error getting celebrity list for ${industry}:`, error.message);
    return [];
  }
}

export default {
  scrapeWikipediaMovie,
  getMoviesByYear,
  scrapeWikipediaCelebrity,
  getCelebrityUrlsByIndustry,
};
