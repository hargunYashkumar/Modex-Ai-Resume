const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './backend/.env' });

const API_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'resumeai_super_secret_key_change_this_in_production_2025';
const USER_ID = '606ca4bb-bc2c-45a3-a010-3e75ad341170';

const token = jwt.sign({ userId: USER_ID }, JWT_SECRET, { expiresIn: '1h' });

async function checkLatest() {
    try {
        // 1. Get all resumes
        const listRes = await axios.get(`${API_URL}/resumes`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const latestId = listRes.data.resumes[0].id;
        console.log('Latest ID:', latestId);

        // 2. Fetch specific resume
        const res = await axios.get(`${API_URL}/resumes/${latestId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const resume = res.data.resume;
        console.log('--- RESUME DATA ---');
        console.log('ID:', resume.id);
        console.log('Title:', resume.title);
        console.log('Content Type:', typeof resume.content);
        console.log('Content Keys:', Object.keys(resume.content || {}));
        console.log('Work Experience Data Length:', resume.work_experience_data?.length);
        
        if (resume.content) {
            console.log('Personal Info Name:', resume.content.personalInfo?.name);
            console.log('Work Experience Length (in content):', resume.content.workExperience?.length);
        }

    } catch (err) {
        console.error('Check Failed:', err.response?.data || err.message);
    }
}

checkLatest();
