const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    const formData = new FormData();
    const filePath = path.join(__dirname, 'uploads/thumbnails/cover-dev.png');
    formData.append('image', fs.createReadStream(filePath));
    
    // Simulate login to get token
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@myltaacademy.dz',
      password: 'admin123'
    });
    const token = loginRes.data.token;

    // We do NOT set explicit content type. FormData handles it!
    const res = await axios.post('http://localhost:3000/api/admin/upload-thumbnail', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    console.log('Upload success:', res.data);
  } catch (error) {
    console.error('Upload failed:', error.response ? error.response.data : error.message);
  }
}
testUpload();
