require('dotenv').config({ path: './backend/.env' });
const { askJSON } = require('../backend/src/services/aiService');

async function simulateParsing() {
  const sampleResume = `
    Yash Chopra
    Software Engineer
    yash@example.com
    Experience:
    - Senior Developer at Tech Hub (2020-2023). Led a team of 3 developers to build a SaaS platform.
    - Junior Developer at Code Base (2018-2020). Built features using React and Node.js.
    Skills: JavaScript, React, Node.js, PostgreSQL.
  `;

  console.log("--- Simulating Resume Parsing with DeepSeek-R1 ---");
  try {
    const prompt = `Extract the following resume text into a JSON object. Ensure it includes personalInfo, workExperience (with company, position, startDate, endDate, bullets), and skills. \n\nResume Text: ${sampleResume}`;
    const result = await askJSON(prompt);
    console.log("Parsed Result:", JSON.stringify(result, null, 2));
    
    if (result.personalInfo?.name && result.workExperience?.length > 0) {
      console.log("\n✅ SUCCESS: Data correctly parsed and structured!");
    } else {
      console.log("\n❌ FAILURE: Parsed data is missing critical fields.");
    }
  } catch (err) {
    console.error("Simulation Failed:", err.message);
  }
}

simulateParsing();
