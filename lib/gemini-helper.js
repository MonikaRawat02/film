import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-pro-latest",
  "gemini-1.5-flash",
  "gemini-1.5-pro"
];

/**
 * Executes a Gemini model with fallback logic
 * @param {string} prompt The prompt to send
 * @param {object} options Configuration for the generation
 * @returns {Promise<string|null>} The generated text or null if all fail
 */
export async function generateWithFallback(prompt, options = {}) {
  if (!genAI) return null;

  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`🤖 Attempting Gemini model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName, ...options });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        console.log(`✅ Success with model: ${modelName}`);
        return text;
      }
    } catch (error) {
      console.warn(`⚠️ Gemini model ${modelName} failed: ${error.message}`);
      // Continue to next model
    }
  }

  console.error("❌ All Gemini models failed to generate content.");
  return null;
}

export default {
  generateWithFallback,
  GEMINI_MODELS
};
