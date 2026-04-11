import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const OPENAI_MODEL = "gpt-4o-mini"; // Using gpt-4o-mini as requested (balance of cost + quality)

/**
 * Executes an OpenAI model for content generation
 * @param {string} prompt The prompt to send
 * @param {object} options Configuration for the generation
 * @returns {Promise<string|null>} The generated text or null if failed
 */
export async function generateContent(prompt, options = {}) {
  if (!openai) {
    console.error("❌ OpenAI API Key not configured.");
    return null;
  }

  try {
    console.log(`🤖 Attempting OpenAI model: ${OPENAI_MODEL}...`);
    
    const isReasoningModel = OPENAI_MODEL.startsWith('o1');
    const systemPrompt = "You are an expert SEO content writer for a movie intelligence platform.";
    
    const messages = isReasoningModel 
      ? [{ role: "user", content: `${systemPrompt}\n\n${prompt}` }]
      : [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ];

    const completionOptions = {
      model: OPENAI_MODEL,
      messages,
      ...options
    };

    if (isReasoningModel) {
      completionOptions.max_completion_tokens = options.max_tokens || 2000;
      // o1 models don't support temperature or max_tokens
      delete completionOptions.temperature;
      delete completionOptions.max_tokens;
    } else {
      completionOptions.max_tokens = options.max_tokens || 2000;
      completionOptions.temperature = options.temperature || 0.7;
    }

    const response = await openai.chat.completions.create(completionOptions);

    const text = response.choices[0]?.message?.content;
    
    if (text) {
      console.log(`✅ Success with OpenAI model: ${OPENAI_MODEL}`);
      return text;
    }
  } catch (error) {
    console.error(`❌ OpenAI Error: ${error.message}`);
    throw error;
  }

  return null;
}

export default {
  generateContent,
  OPENAI_MODEL
};
