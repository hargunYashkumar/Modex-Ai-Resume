const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

async function testCurl() {
  const key = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
  
  try {
    const res = await axios.post(url, {
      contents: [{ parts: [{ text: "Hello" }] }]
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log("CURL Success:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("CURL Error:", err.response?.status, err.response?.data || err.message);
  }
}

testCurl();
