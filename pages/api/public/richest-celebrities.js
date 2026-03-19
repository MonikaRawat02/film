import dbConnect from "../../../lib/mongodb";
import Celebrity from "../../../model/celebrity";

function getDisplayNetWorth(c) {
  const usd = c?.netWorth?.netWorthUSD;
  
  // If a pre-formatted display string exists, check if it has a currency symbol and 'M'
  if (usd?.display) {
    let display = usd.display.trim();
    // If it doesn't start with $, prepend it
    if (!display.startsWith("$")) {
      display = `$${display}`;
    }
    // If it doesn't have M or B, append M
    if (!display.toUpperCase().includes("M") && !display.toUpperCase().includes("B")) {
      display = `${display}M`;
    }
    return display;
  }
  
  // Otherwise, format the range from min and max values
  const min = usd?.min;
  const max = usd?.max;
  
  if (min != null && max != null && min !== max) {
    return `${toMoneyShort(min)} - ${toMoneyShort(max)}`;
  } else if (max != null) {
    return toMoneyShort(max);
  } else if (min != null) {
    return toMoneyShort(min);
  }
  
  return "N/A";
}

function toMoneyShort(n) {
  if (n == null || Number.isNaN(Number(n))) return null;
  const v = Number(n);
  
  let formattedValue;
  if (v >= 1_000_000_000) {
    formattedValue = `${(v / 1_000_000_000).toFixed(1)}B`;
  } else if (v >= 1_000_000) {
    formattedValue = `${(v / 1_000_000).toFixed(0)}M`;
  } else {
    // If it's a small number, assume it's already in millions based on the user's request
    formattedValue = `${v}M`;
  }
  
  return `$${formattedValue}`;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    await dbConnect();
    
    const richest = await Celebrity.find({ "netWorth.netWorthUSD.max": { $exists: true, $ne: null } })
      .sort({ "netWorth.netWorthUSD.max": -1 })
      .limit(10);

    const data = richest.map(c => ({
      name: c.heroSection?.name || "Unknown",
      netWorth: getDisplayNetWorth(c),
      slug: c.heroSection?.slug,
      image: c.heroSection?.profileImage,
      industry: c.heroSection?.industry || "Hollywood",
      profession: Array.isArray(c.heroSection?.profession) 
        ? c.heroSection.profession.join(", ") 
        : c.heroSection?.profession || "Actor"
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching richest celebrities:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
