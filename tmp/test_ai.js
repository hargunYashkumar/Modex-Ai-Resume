require('dotenv').config({ path: './backend/.env' });
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-3-5-sonnet-20240620';

async function testAI() {
  console.log('Testing AI with model:', MODEL);
  console.log('API Key present:', !!process.env.ANTHROPIC_API_KEY);
  
  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 100,
      system: 'Respond with valid JSON only.',
      messages: [{ role: 'user', content: 'Say hello in JSON format.' }],
    });
    console.log('Response:', JSON.stringify(msg.content, null, 2));
  } catch (err) {
    console.error('AI Test Failed:', err.message);
    if (err.status) console.error('Status:', err.status);
    console.error('Full Error:', JSON.stringify(err, null, 2));
  }
}

testAI();
