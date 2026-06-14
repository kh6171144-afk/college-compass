const db = require('../config/db');
const cutoffController = require('../controllers/cutoffController');

// Mock request and response helpers
const createMockReq = (query) => ({ query });
const createMockRes = (resolve, reject) => ({
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    if (this.statusCode >= 400) {
      reject(new Error(`API Error: Status ${this.statusCode} - ${JSON.stringify(data)}`));
    } else {
      resolve(data);
    }
  }
});

async function runTests() {
  try {
    console.log('==============================================');
    console.log('   Running College Compass Backend Unit Tests  ');
    console.log('==============================================');

    // Test 1: Verify database connection
    console.log('\n[TEST 1] Verifying database connection...');
    const dbTest = await db.query('SELECT count(*) as count FROM colleges');
    const collegeCount = dbTest.rows[0].count;
    console.log(`✓ Database Connected. Found ${collegeCount} colleges in catalog.`);
    if (collegeCount === 0) {
      throw new Error('Database is empty. Please run the seed script first.');
    }

    // Test 2: Verify prediction logic (JEE Advanced General, rank = 100)
    console.log('\n[TEST 2] Verifying Predictor algorithm (JEE Advanced, General Category, Rank 100)...');
    const predResult = await new Promise((resolve, reject) => {
      cutoffController.predictColleges(
        createMockReq({ rank: '100', exam: 'JEE Advanced', category: 'General' }),
        createMockRes(resolve, reject)
      );
    });

    console.log(`✓ Prediction complete. Found ${predResult.length} eligible options.`);
    
    // Assert on Safe/Possible/Reach classification
    // For general category, IIT Bombay CSE closing rank was 68.
    // If rank is 100, is IIT Bombay CSE expected to be "Possible"? 
    // Let's check: 68 * 1.05 = 71.4. Since 100 > 71.4, is it Reach?
    // Let's check: 68 * 1.25 = 85. Since 100 > 85, it is Unlikely (filtered out).
    // Let's check IIT Delhi CSE: closing rank 115.
    // Since rank 100 is <= 115 * 0.9 = 103.5. So rank 100 should be "Safe" for IIT Delhi CSE!
    // Let's check IIT Madras CSE: closing rank 140.
    // Since rank 100 is <= 140 * 0.9 = 126. So rank 100 should be "Safe" for IIT Madras CSE!
    // Let's check IIT Bombay EE: closing rank 290.
    // Since rank 100 is <= 290 * 0.9 = 261. So rank 100 should be "Safe" for IIT Bombay EE!
    
    const iitdBranches = predResult.filter(p => p.college_name.includes('Delhi') && p.course_name.includes('Computer'));
    if (iitdBranches.length > 0) {
      const b = iitdBranches[0];
      
      // Calculate expected status dynamically based on the database closing rank
      let expectedStatus = 'Unlikely';
      if (100 <= b.closing_rank * 0.9) expectedStatus = 'Safe';
      else if (100 <= b.closing_rank * 1.05) expectedStatus = 'Possible';
      else if (100 <= b.closing_rank * 1.25) expectedStatus = 'Reach';

      console.log(`  - IIT Delhi CSE (Closing Cutoff ${b.closing_rank}) with Rank 100: Classified as "${b.status}" (Expected: "${expectedStatus}")`);
      if (b.status !== expectedStatus) {
        throw new Error(`Classification logic incorrect for IIT Delhi CSE. Got "${b.status}", expected "${expectedStatus}".`);
      }
    } else {
      console.log('  - Note: IIT Delhi CSE option was filtered out for Rank 100.');
    }

    // Test 3: Course Predictor list details
    console.log('\n[TEST 3] Verifying specific Course Predictor endpoint...');
    // Find IIT Bombay ID
    const iitbRes = await db.query("SELECT id FROM colleges WHERE name LIKE '%Bombay%'");
    const iitbId = iitbRes.rows[0].id;

    const coursePred = await new Promise((resolve, reject) => {
      cutoffController.predictCourses(
        createMockReq({ rank: '100', collegeId: iitbId.toString(), exam: 'JEE Advanced', category: 'General' }),
        createMockRes(resolve, reject)
      );
    });

    console.log(`✓ Course Predictor fetched. Found ${coursePred.length} branch cutoffs.`);
    // IIT Bombay EE closing rank was 290. With rank 100 (100 <= 290 * 0.9 = 261), EE should be 'Safe'.
    const eeBranch = coursePred.find(c => c.course_name.includes('Electrical'));
    if (eeBranch) {
      console.log(`  - IIT Bombay Electrical (Closing Cutoff ${eeBranch.closing_rank}) with Rank 100: Classified as "${eeBranch.status}"`);
      if (eeBranch.status !== 'Safe') {
        throw new Error('Classification logic incorrect for IIT Bombay Electrical.');
      }
    }

    console.log('\n==============================================');
    console.log('   ALL UNIT TESTS PASSED SUCCESSFULLY! (100%)  ');
    console.log('==============================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Unit Tests Failed:', err.message);
    process.exit(1);
  }
}

runTests();
