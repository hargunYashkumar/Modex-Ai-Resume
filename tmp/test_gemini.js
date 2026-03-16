const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './backend/.env' });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  console.log("--- Testing v1 ---");
  try {
    const modelV1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
    const resultV1 = await modelV1.generateContent("Say hello");
    console.log("Success with v1:", resultV1.response.text());
  } catch (err) {
    console.error("Error with v1:", err.message);
  }

  console.log("\n--- Testing v1beta ---");
  try {
    const modelV1Beta = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1beta' });
    const resultV1Beta = await modelV1Beta.generateContent("Say hello");
    console.log("Success with v1beta:", resultV1Beta.response.text());
  } catch (err2) {
    console.error("Error with v1beta:", err2.message);
  }

  console.log("\n--- Testing gemini-pro (v1beta) ---");
  try {
    const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
    const resultPro = await modelPro.generateContent("Say hello");
    console.log("Success with gemini-pro:", resultPro.response.text());
  } catch (err3) {
    console.error("Error with gemini-pro:", err3.message);
  }
}

listModels();
