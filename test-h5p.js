#!/usr/bin/env node

/**
 * Simple H5P API Test Script
 * Tests basic H5P endpoints to verify integration is working
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Test configuration
const testConfig = {
  baseUrl: BASE_URL,
  testUser: {
    email: 'teacher@example.com',
    password: 'password123',
  },
};

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: testConfig.testUser.email,
      password: testConfig.testUser.password,
    });
    
    authToken = response.data.access_token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testHealthEndpoint() {
  try {
    console.log('🏥 Testing H5P health endpoint...');
    const response = await axios.get(`${BASE_URL}/h5p/health`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ H5P health check:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testContentTypesEndpoint() {
  try {
    console.log('📚 Testing H5P content types endpoint...');
    const response = await axios.get(`${BASE_URL}/h5p/content-types`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Content types available:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Content types failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testLibrariesEndpoint() {
  try {
    console.log('📖 Testing H5P libraries endpoint...');
    const response = await axios.get(`${BASE_URL}/h5p/libraries`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Libraries available:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Libraries test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testUserContentsEndpoint() {
  try {
    console.log('📄 Testing H5P user contents endpoint...');
    const response = await axios.get(`${BASE_URL}/h5p/content`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ User contents:', response.data);
    return true;
  } catch (error) {
    console.error('❌ User contents failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testIntegrationEndpoint() {
  try {
    console.log('🔗 Testing H5P integration endpoint...');
    const response = await axios.get(`${BASE_URL}/h5p/integration`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Integration data:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Integration test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting H5P API Tests...\n');
  
  // First login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  console.log('');
  
  // Run all tests
  const tests = [
    testHealthEndpoint,
    testContentTypesEndpoint,
    testLibrariesEndpoint,
    testUserContentsEndpoint,
    testIntegrationEndpoint,
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    console.log('');
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All H5P tests passed! Integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the server and database connection.');
  }
}

// Run tests if this script is called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testConfig,
};