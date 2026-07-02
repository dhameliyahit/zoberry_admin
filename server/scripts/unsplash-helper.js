/**
 * Unsplash API Helper — fetches product images from Unsplash
 * Uses the Unsplash Source API for direct image URLs
 */

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos";

if (!UNSPLASH_ACCESS_KEY) {
  console.error("❌ UNSPLASH_ACCESS_KEY not set in .env");
  process.exit(1);
}

/**
 * Search Unsplash for photos matching a query
 * @param {string} query - Search query
 * @param {number} count - Number of results (max 30)
 * @returns {Array<{url: string, alt: string, thumb: string}>}
 */
async function searchPhotos(query, count = 5) {
  const params = new URLSearchParams({
    query,
    per_page: String(count),
    orientation: "squarish",
    content_filter: "high",
  });

  const response = await fetch(`${UNSPLASH_SEARCH_URL}?${params}`, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Unsplash API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.results.map((photo) => ({
    url: `${photo.urls.raw}&w=800&h=800&fit=crop&q=80`,
    alt: photo.alt_description || photo.description || "Product image",
    thumb: photo.urls.thumb,
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
  }));
}

/**
 * Get a random photo from Unsplash for a query (uses source API)
 * @param {string} query - Search query
 * @returns {string} Direct image URL
 */
function getRandomPhotoUrl(query) {
  const encoded = encodeURIComponent(query);
  return `https://source.unsplash.com/800x800/?${encoded}`;
}

/**
 * Generate Unsplash search queries for a product
 * @param {string} title - Product title
 * @param {string} brand - Brand name
 * @returns {string[]} Array of search queries to try
 */
function getSearchQueries(title, brand) {
  const queries = [];

  // Try specific product name first
  if (brand) {
    queries.push(`${brand} ${title}`);
  }
  queries.push(title);

  // Extract key product type words
  const words = title.toLowerCase().split(/\s+/);
  const productTypes = ["phone", "laptop", "watch", "tablet", "mouse", "keyboard", "headphone", "earbuds", "speaker", "router", "camera", "tv", "monitor", "gamepad", "controller", "imac", "macbook", "iphone", "ipad", "airpods"];

  const matchingType = words.find((w) => productTypes.includes(w));
  if (matchingType) {
    queries.push(`${brand || ""} ${matchingType}`.trim());
    queries.push(matchingType);
  }

  return queries;
}

/**
 * Fetch the best images for a product
 * Tries multiple search queries and returns the first successful results
 * @param {string} title - Product title
 * @param {string} brand - Brand name
 * @param {number} count - Number of images to return
 * @returns {Array<{url: string, alt: string}>}
 */
async function fetchProductImages(title, brand, count = 2) {
  const queries = getSearchQueries(title, brand);

  for (const query of queries) {
    try {
      const photos = await searchPhotos(query, count + 2); // fetch extra in case some fail
      if (photos.length >= count) {
        return photos.slice(0, count).map((p) => ({
          url: p.url,
          alt: p.alt,
        }));
      }
    } catch (err) {
      console.warn(`  Unsplash search failed for "${query}":`, err.message);
    }
  }

  // Fallback: use source.unsplash.com direct URLs
  console.warn(`  Using fallback Unsplash URLs for "${title}"`);
  const fallbackQuery = brand ? `${brand} ${title}` : title;
  return [
    { url: getRandomPhotoUrl(fallbackQuery), alt: `${title} - primary image` },
    { url: getRandomPhotoUrl(`${fallbackQuery} side view`), alt: `${title} - secondary image` },
  ];
}

module.exports = {
  searchPhotos,
  getRandomPhotoUrl,
  fetchProductImages,
  getSearchQueries,
};
