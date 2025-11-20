/**
 * Test script for Fantasy League Management API
 *
 * This script tests the League Management API endpoints by making requests
 * to the local development server. Make sure the server is running first.
 *
 * Usage: npx tsx scripts/test-league-api.ts
 */

const BASE_URL = 'http://localhost:3000';

async function testLeagueAPI() {
  console.log('🧪 Testing Fantasy League Management API\n');

  try {
    // Test 1: Create a new league
    console.log('1️⃣  Testing POST /api/leagues (Create League)...');
    const createResponse = await fetch(`${BASE_URL}/api/leagues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        name: 'Test League 2025',
        season: 2025,
        maxTeams: 12,
        draftType: 'snake',
        waiverSystem: 'rolling',
        playoffTeams: 4,
      }),
    });

    if (!createResponse.ok) {
      console.log(`❌ Failed: ${createResponse.status} ${createResponse.statusText}`);
      const error = await createResponse.json();
      console.log('   Error:', error);
      console.log('\n⚠️  Make sure you are logged in! Visit http://localhost:3000');
      return;
    }

    const createdLeague = await createResponse.json();
    console.log('✅ Success! League created:', createdLeague);

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testLeagueAPI();