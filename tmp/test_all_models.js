const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './backend/.env' });

async function testAll() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash-lite",
    "gemini-1.5-flash",
    "gemini-pro"
  ];
  
  for (const m of models) {
    console.log(`--- Testing ${m} ---`);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Say 'System ready' if you can hear me.");
      console.log(`Success with ${m}:`, result.response.text());
      break; 
    } catch (err) {
      console.error(`Failed ${m}:`, err.message);
    }
  }
}

testAll();
