const fetch = require('node-fetch');

const BATCH_SIZE = 50; // Number of movies to scrape per request
const DELAY_MS = 2000; // Delay between requests to avoid overwhelming the server

const scrapeYear = async (year, category) => {
  console.log(`Scraping movies for ${year}...`);
  try {
    const response = await fetch('http://localhost:3000/api/admin/automation/scrape-wikipedia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year,
        category,
        limit: BATCH_SIZE,
      }),
    });
    const data = await response.json();
    console.log(`Scraping for ${year} completed:`, data);
  } catch (error) {
    console.error(`Error scraping for ${year}:`, error);
  }
};

const backfill = async () => {
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 5; i++) {
    const year = currentYear - i;
    await scrapeYear(year, 'Bollywood');
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  }
};

backfill();
