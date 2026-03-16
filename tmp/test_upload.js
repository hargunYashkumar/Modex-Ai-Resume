const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:5000/api';
// We need a valid token to test. 
// Since I don't have one easily available, I'll try to find one from the logs or hope for a 401/400.
// Actually, I'll check terminal output for a token if possible, or create a dummy user.
const TOKEN = process.argv[2]; 

if (!TOKEN) {
    console.error('Please provide a Bearer token as an argument');
    process.exit(1);
}

async function testUpload() {
    console.log('Testing upload to:', `${API_URL}/resumes/upload/parse`);
    
    // Create a dummy file
    const filePath = path.join(__dirname, 'dummy_resume.pdf');
    fs.writeFileSync(filePath, '%PDF-1.4 dummy content');

    const form = new FormData();
    form.append('resume', fs.createReadStream(filePath));

    try {
        const response = await axios.post(`${API_URL}/resumes/upload/parse`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${TOKEN}`
            }
        });
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Upload Failed');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    } finally {
        fs.unlinkSync(filePath);
    }
}

testUpload();
