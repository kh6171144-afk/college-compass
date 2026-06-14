const http = require('http');

function request(method, path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  const email = `test_${Date.now()}@example.com`;
  let token = '';
  let debugOtpVal = '';

  try {
    console.log('--- Test 1: Send OTP for signup ---');
    let res = await request('POST', '/api/auth/send-otp', { email, purpose: 'signup' });
    console.log('Status:', res.status);
    console.log('Body:', res.body);
    if (res.status !== 200 || !res.body.debug_otp) throw new Error('Test 1 Failed');
    debugOtpVal = res.body.debug_otp;

    console.log('\n--- Test 2: Verify OTP ---');
    res = await request('POST', '/api/auth/verify-otp', { email, otp: debugOtpVal });
    console.log('Status:', res.status);
    console.log('Body:', res.body);
    if (res.status !== 200) throw new Error('Test 2 Failed');

    console.log('\n--- Test 3: Try Signup with Weak Password ---');
    res = await request('POST', '/api/auth/signup', { name: 'Test User', email, password: 'weak' });
    console.log('Status:', res.status);
    console.log('Body:', res.body);
    if (res.status !== 400) throw new Error('Test 3 Failed');

    console.log('\n--- Test 4: Complete Signup with Strong Password ---');
    res = await request('POST', '/api/auth/signup', { name: 'Test User', email, password: 'StrongPassword123!' });
    console.log('Status:', res.status);
    console.log('Body:', res.body);
    if (res.status !== 201) throw new Error('Test 4 Failed');
    token = res.body.token;

    console.log('\n--- Test 5: Verify double signup block ---');
    res = await request('POST', '/api/auth/send-otp', { email, purpose: 'signup' });
    console.log('Status:', res.status);
    console.log('Body:', res.body);
    if (res.status !== 400) throw new Error('Test 5 Failed');

    console.log('\n--- Test 6: Verify correct login ---');
    res = await request('POST', '/api/auth/login', { email, password: 'StrongPassword123!' });
    console.log('Status:', res.status);
    console.log('Body:', res.body);
    if (res.status !== 200 || !res.body.token) throw new Error('Test 6 Failed');
    token = res.body.token;

    console.log('\n--- Test 7: Verify failed login counting & lockout ---');
    // Trigger 5 failed attempts
    for (let i = 1; i <= 5; i++) {
      console.log(`Failed attempt ${i}...`);
      res = await request('POST', '/api/auth/login', { email, password: 'WrongPassword' });
      console.log(`Attempt ${i} Status:`, res.status, 'Body:', res.body.error || res.body);
      if (i < 5) {
        if (res.status !== 400 || !res.body.error.includes('Incorrect password')) {
          throw new Error(`Test 7 Failed on attempt ${i}`);
        }
      } else {
        // 5th attempt must result in temporary lock
        if (res.status !== 403 || !res.body.error.includes('locked')) {
          throw new Error('Test 7 Failed on lockout check');
        }
      }
    }

    console.log('\n--- Test 8: Verify login block during lockout period ---');
    res = await request('POST', '/api/auth/login', { email, password: 'StrongPassword123!' });
    console.log('Status:', res.status);
    console.log('Body:', res.body);
    if (res.status !== 403 || !res.body.error.includes('locked')) {
      throw new Error('Test 8 Failed');
    }

    console.log('\n--- Test 9: Update onboarding preferences ---');
    res = await request('POST', '/api/auth/onboarding', {
      education_level: 'Undergraduate',
      preferred_branch: 'Computer Science',
      preferred_state: 'Karnataka',
      preferred_exam: 'JEE Advanced'
    }, { 'Authorization': `Bearer ${token}` });
    console.log('Status:', res.status);
    console.log('Body:', res.body);
    if (res.status !== 200 || res.body.user.education_level !== 'Undergraduate') {
      throw new Error('Test 9 Failed');
    }

    console.log('\n--- Test 10: Forgot password OTP send ---');
    res = await request('POST', '/api/auth/send-otp', { email, purpose: 'forgot_password' });
    console.log('Status:', res.status);
    console.log('Body:', res.body);
    if (res.status !== 200 || !res.body.debug_otp) throw new Error('Test 10 Failed');
    debugOtpVal = res.body.debug_otp;

    console.log('\n--- Test 11: Verify Forgot Password OTP ---');
    res = await request('POST', '/api/auth/verify-otp', { email, otp: debugOtpVal });
    console.log('Status:', res.status);
    if (res.status !== 200) throw new Error('Test 11 Failed');

    console.log('\n--- Test 12: Reset password (unlocks account as well) ---');
    res = await request('POST', '/api/auth/reset-password', { email, password: 'NewStrongPassword456!' });
    console.log('Status:', res.status);
    console.log('Body:', res.body);
    if (res.status !== 200) throw new Error('Test 12 Failed');

    console.log('\n--- Test 13: Verify login with new password (and lock is reset) ---');
    res = await request('POST', '/api/auth/login', { email, password: 'NewStrongPassword456!' });
    console.log('Status:', res.status);
    console.log('Body:', res.body);
    if (res.status !== 200 || !res.body.token) throw new Error('Test 13 Failed');

    console.log('\n===============================================');
    console.log('🎉 ALL BACKEND AUTH SECURITY TESTS PASSED!');
    console.log('===============================================');
  } catch (err) {
    console.error('❌ Verification test suite failed:', err);
    process.exit(1);
  }
}

runTests();
