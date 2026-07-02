/**
 * Groq API Helper — generates product descriptions, specifications, and tags
 * Uses Groq's fast inference API for AI content generation
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY not set in .env");
  process.exit(1);
}

async function callGroq(messages, model = "llama-3.1-8b-instant", temperature = 0.7, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: 1024,
      }),
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after") || 5;
      console.warn(`    Rate limited (attempt ${attempt}/${retries}), waiting ${retryAfter}s...`);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      continue;
    }

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  throw new Error(`Groq API: all ${retries} attempts failed due to rate limiting`);
}

/**
 * Generate a product description from a product title
 */
async function generateDescription(title, brand) {
  const prompt = `You are an ecommerce copywriter for an Indian electronics store called Zoberry.
Write a compelling product description for:
Product: ${title}${brand ? ` | Brand: ${brand}` : ""}

Rules:
- 2-3 sentences, professional tone
- Highlight key features and benefits
- Mention what makes it a good purchase
- No markdown, no bullet points, just plain text
- Do NOT include the product name at the start
- Keep it under 200 characters if possible`;

  const messages = [
    { role: "system", content: "You are a concise ecommerce product copywriter." },
    { role: "user", content: prompt },
  ];

  return callGroq(messages);
}

/**
 * Generate specifications for a product
 */
async function generateSpecifications(title, brand) {
  const prompt = `Generate 4-6 technical specifications for this product as a JSON array.
Product: ${title}${brand ? ` | Brand: ${brand}` : ""}

Return ONLY valid JSON array, no markdown, no explanation. Format:
[{"key":"Display","value":"6.1-inch OLED"},{"key":"Processor","value":"A15 Bionic"}]

Rules:
- Use common spec categories: Display, Processor, Memory, Storage, Battery, Camera, Connectivity, Weight, etc.
- Values should be realistic for the product type
- Keep each value under 40 characters`;

  const messages = [
    { role: "system", content: "You are a technical product data specialist. Return only valid JSON." },
    { role: "user", content: prompt },
  ];

  const response = await callGroq(messages);
  try {
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return [
      { key: "Type", value: title },
      { key: "Brand", value: brand || "Various" },
    ];
  }
}

/**
 * Generate tags for a product
 */
async function generateTags(title, brand) {
  const prompt = `Generate 4-6 relevant product tags for an ecommerce store.
Product: ${title}${brand ? ` | Brand: ${brand}` : ""}

Return ONLY a JSON array of lowercase strings, no markdown.
Example: ["wireless", "bluetooth", "headphones", "noise-cancelling"]

Rules:
- All lowercase
- No spaces in individual tags (use hyphens if needed)
- Relevant to the product category and features
- Include brand name as one tag`;

  const messages = [
    { role: "system", content: "You are a product tagging specialist. Return only valid JSON arrays." },
    { role: "user", content: prompt },
  ];

  const response = await callGroq(messages);
  try {
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return [title.toLowerCase().split(" ")[0], "electronics"];
  }
}

/**
 * Generate complete product content in one call
 */
async function generateProductContent(title, brand) {
  const prompt = `Generate ecommerce product data for:
Product: ${title}${brand ? ` | Brand: ${brand}` : ""}

Return ONLY valid JSON with this exact structure, no markdown, no explanation:
{
  "description": "2-3 sentence product description (plain text, no markdown)",
  "specifications": [{"key":"Spec Name","value":"Spec Value"}],
  "tags": ["tag1", "tag2", "tag3"],
  "seoTitle": "Product Name - Buy Online at Zoberry",
  "seoDescription": "Buy {product name} at best price in India. Features, specs, and offers."
}

Rules:
- Description: 2-3 sentences, professional, highlight key features, under 300 chars
- Specifications: 4-6 realistic specs for this product type
- Tags: 4-6 lowercase relevant tags
- SEO title: includes product name and "Zoberry"
- SEO description: mentions India and best price`;

  const messages = [
    { role: "system", content: "You are an ecommerce data specialist. Return only valid JSON." },
    { role: "user", content: prompt },
  ];

  const response = await callGroq(messages);
  try {
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error(`  Failed to parse Groq response for "${title}":`, e.message);
    return {
      description: `${title} from ${brand || "Zoberry"}. Available at best price in India.`,
      specifications: [{ key: "Brand", value: brand || "Various" }],
      tags: ["electronics"],
      seoTitle: `${title} - Buy Online at Zoberry`,
      seoDescription: `Buy ${title} at best price in India.`,
    };
  }
}

module.exports = {
  generateDescription,
  generateSpecifications,
  generateTags,
  generateProductContent,
  callGroq,
};
