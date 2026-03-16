const axios = require('axios');
const fs = require('fs');
require('dotenv').config({ path: './backend/.env' });

async function listModels() {
  const key = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  
  try {
    const res = await axios.get(url);
    fs.writeFileSync('./tmp/available_models.json', JSON.stringify(res.data, null, 2));
    console.log("Written to tmp/available_models.json");
  } catch (err) {
    console.error("List Models Error:", err.response?.status, err.response?.data || err.message);
  }
}

listModels();
