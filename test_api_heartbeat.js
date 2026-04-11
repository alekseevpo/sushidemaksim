import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const userId = '54f2ed9f-e17b-48cd-8898-1c5ce9d518c3'; // From diagnostic
const secret = process.env.JWT_SECRET || 'sushi-de-maksim-super-secret-jwt-key-2024-change-in-production';

console.log('🔑 Generating test token...');
const token = jwt.sign({ userId }, secret, { expiresIn: '1h' });
console.log(`Token: ${token.substring(0, 10)}...`);

async function testApi() {
  console.log('📡 Sending request to http://localhost:3001/api/user/active');
  try {
    const response = await axios.put('http://localhost:3001/api/user/active', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ API SUCCESS:', response.data);
  } catch (error) {
    console.error('❌ API FAILED!');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Message:', error.message);
      console.log('💡 TIP: Is the server running? Make sure node server/src/index.ts is active.');
    }
  }
}

testApi();
