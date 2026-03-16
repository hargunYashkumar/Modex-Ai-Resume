const { HfInference } = require('@huggingface/inference')
const logger = require('../utils/logger')

// AI configuration
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY

const hf = new HfInference(HF_TOKEN, {
  use_cache: false,
  wait_for_model: true,
})

// Model fallback chain for Inference API
const MODELS = [
  'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
  'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
  'deepseek-ai/DeepSeek-R1'
]
const MAX_RETRIES = 1

/**
 * Send a chat completion request and return the content.
 * Uses Hugging Face Inference API with DeepSeek models.
 */
async function ask(prompt, maxTokens = 2048, system = 'You are a professional resume parsing assistant. Always return valid JSON only.') {
  // ─── AI Mock Mode for Development ─────────────────────────────────────────
  if (process.env.AI_MOCK_MODE === 'true') {
    logger.info('AI Mock Mode active, returning simulated response');
    return '{"mock": true}'; 
  }

  if (!HF_TOKEN) {
    throw new Error('HUGGINGFACE_API_KEY is not configured in .env');
  }

  let lastError = null;

  for (const modelName of MODELS) {
    let attempt = 0
    while (attempt <= MAX_RETRIES) {
      try {
        logger.debug(`Attempting Hugging Face chat completion`, { model: modelName, attempt });
        
        const response = await hf.chatCompletion({
          model: modelName,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt }
          ],
          max_tokens: maxTokens,
          temperature: 0.1,
        });

        const text = response.choices?.[0]?.message?.content;
        
        if (!text) {
          logger.warn(`Empty response from model ${modelName}`, { response });
          throw new Error('Empty response content from Hugging Face');
        }

        logger.debug('Hugging Face AI call success', { model: modelName, attempt })
        return text
      } catch (err) {
        lastError = err;
        logger.warn(`HF Model ${modelName} failed`, { error: err.message, attempt });

        // If it's a 429 (Rate Limit) or 503 (Model Loading or busy), try next model
        if (err.message?.includes('429') || err.message?.includes('503') || err.message?.includes('loading')) {
          break; // Move to next model
        }

        attempt++
        if (attempt > MAX_RETRIES) break;
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  }

  throw lastError || new Error('Hugging Face service failed to respond across all specified models.');
}

/**
 * Parse a JSON response from AI safely.
 */
function parseJSON(text) {
  if (text === '{"mock": true}') {
    return {
      personalInfo: { name: 'John Doe', email: 'john@example.com', phone: '1234567890', location: 'New York, NY', summary: 'Experienced software engineer.', linkedinUrl: 'linkedin.com/in/johndoe', githubUrl: 'github.com/johndoe' },
      workExperience: [{ company: 'Tech Corp', position: 'Senior Engineer', location: 'NY', startDate: '2020', endDate: 'Present', isCurrent: true, bullets: ['Led team of 5', 'Built scalable APIs'] }],
      education: [{ institution: 'State University', degree: 'BSCS', fieldOfStudy: 'Computer Science', startDate: '2016', endDate: '2020' }],
      skills: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
      certifications: [{ name: 'AWS Certified Developer', issuer: 'Amazon', issueDate: '2023' }],
      projects: [{ name: 'Modex', description: 'AI-powered resume builder', technologies: ['React', 'Node.js'], url: '' }]
    };
  }

  // Clean DeepSeek "thinking" blocks if present
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Remove markdown code blocks
  cleaned = cleaned
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  
  try {
    return JSON.parse(cleaned)
  } catch (e) {
    logger.error('Failed to parse AI JSON', { text });
    // Try to find JSON object within the text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerE) {
        throw new Error('AI returned invalid JSON structure');
      }
    }
    throw new Error('AI returned invalid JSON structure');
  }
}

async function askJSON(prompt, maxTokens = 2048, system = 'You are a professional resume parsing assistant. You must extract resume data and return ONLY a valid JSON object matching the requested schema. Do not include thinking, reasoning, or any other text outside the JSON.') {
  const text = await ask(prompt, maxTokens, system)
  return parseJSON(text)
}

module.exports = { ask, askJSON, parseJSON }
