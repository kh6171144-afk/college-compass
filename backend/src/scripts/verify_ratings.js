const http = require('http');

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(dataString);
    }
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          if (res.statusCode >= 400) {
            reject({ status: res.statusCode, error: parsed.error || parsed });
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject({ status: res.statusCode, error: responseBody });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(dataString);
    }
    req.end();
  });
};

async function runRatingTests() {
  console.log('==============================================');
  console.log('    Running College Ratings API Unit Tests    ');
  console.log('==============================================');

  try {
    const testEmail = `testuser_${Date.now()}@example.com`;
    
    // 1. Test User Signup
    console.log('\n[TEST 1] Creating a new user account (Signup)...');
    const signupRes = await request('POST', '/api/auth/signup', {
      name: 'Jane Doe',
      email: testEmail,
      password: 'testpassword123'
    });
    console.log('✓ Account registered successfully. User ID:', signupRes.user.id);
    const token = signupRes.token;

    // 2. Test User Login
    console.log('\n[TEST 2] Logging in with email and password...');
    const loginRes = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'testpassword123'
    });
    console.log('✓ Login successful. Generated Token.');

    // 3. Test Google Login (Simulated)
    console.log('\n[TEST 3] Logging in using simulated Google OAuth...');
    const googleRes = await request('POST', '/api/auth/google', {
      email: `google_${Date.now()}@gmail.com`,
      name: 'Google Test User',
      google_id: `g_id_${Date.now()}`
    });
    console.log('✓ Google login successful. User:', googleRes.user.name);

    // 4. Test Rating Submission (Jane Doe rates Manipal Jaipur)
    console.log('\n[TEST 4] Submitting rating for Manipal University Jaipur...');
    // Find Manipal Jaipur ID from database
    const db = require('../config/db');
    await db.initDbSchema();
    const colRes = await db.query("SELECT id FROM colleges WHERE name LIKE '%Jaipur%' LIMIT 1");
    const collegeId = colRes.rows[0].id;

    const ratingRes = await request('POST', `/api/colleges/${collegeId}/ratings`, {
      rating_hostels: 4,
      rating_campus: 5,
      rating_infra: 3,
      review_text: 'Excellent campus environment and infrastructure, decent hostels.'
    }, token);

    console.log('✓ Rating submitted. Overall quality rating calculated:', ratingRes.ratings.rating_overall);
    if (ratingRes.ratings.rating_overall !== 4) {
      throw new Error(`Overall rating incorrect. Expected 4.0, got ${ratingRes.ratings.rating_overall}`);
    }

    // 5. Test College Details displays ratings
    console.log('\n[TEST 5] Fetching college details & verifying reviews feed...');
    const detailsRes = await request('GET', `/api/colleges/${collegeId}`);
    
    console.log('Ratings summary:');
    console.log(detailsRes.ratings_summary);
    console.log('Reviews count:', detailsRes.reviews.length);

    if (detailsRes.ratings_summary.total_reviews !== 1) {
      throw new Error(`Total reviews count incorrect. Expected 1, got ${detailsRes.ratings_summary.total_reviews}`);
    }
    if (detailsRes.reviews[0].user_name !== 'Jane Doe') {
      throw new Error(`Review username incorrect. Expected 'Jane Doe', got '${detailsRes.reviews[0].user_name}'`);
    }

    console.log('\n==============================================');
    console.log('   ALL RATING TESTS PASSED SUCCESSFULLY!      ');
    console.log('==============================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Ratings Verification Failed:', err);
    process.exit(1);
  }
}

// Ensure the Express server is running on port 5000 before running this script
runRatingTests();
