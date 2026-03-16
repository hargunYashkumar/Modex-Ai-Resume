const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './backend/.env' });

async function testFinalModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("--- Testing gemini-2.5-flash ---");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("Say 'System ready' if you can hear me.");
    console.log("Success:", result.response.text());
  } catch (err) {
    console.error("Final Test Failed:", err.message);
  }
}

testFinalModel();
