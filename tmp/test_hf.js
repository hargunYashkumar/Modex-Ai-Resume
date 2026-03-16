const { HfInference } = require('@huggingface/inference');
require('dotenv').config({ path: './backend/.env' });

async function testHF() {
  const token = process.env.HUGGINGFACE_API_KEY;
  if (!token || token.includes('your_huggingface_token_here')) {
    console.error("Please add your HUGGINGFACE_API_KEY to backend/.env first!");
    return;
  }

  const hf = new HfInference(token);
  const model = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B';
  
  console.log(`--- Testing Hugging Face with ${model} ---`);
  try {
    const result = await hf.chatCompletion({
      model: model,
      messages: [
        { role: 'user', content: "Say 'Hugging Face is ready'" }
      ],
      max_tokens: 100,
    });
    console.log("Full Result:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("HF Test Failed!");
    console.error("Error Message:", err.message);
  }
}

testHF();
