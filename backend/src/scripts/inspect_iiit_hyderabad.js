const db = require('../config/db');

async function inspect() {
  try {
    const collegeId = 1447;
    console.log('Inspecting IIIT Hyderabad (ID 1447)...');

    // Get courses
    const coursesRes = await db.query('SELECT * FROM courses WHERE college_id = $1', [collegeId]);
    console.log('\nCourses offered:');
    console.log(coursesRes.rows);

    // Get cutoffs count by exam
    const examCounts = await db.query('SELECT exam, COUNT(*) as count FROM cutoffs WHERE college_id = $1 GROUP BY exam', [collegeId]);
    console.log('\nCutoff count by exam/mode:');
    console.log(examCounts.rows);

    // Get sample cutoffs
    const cutoffsRes = await db.query('SELECT * FROM cutoffs WHERE college_id = $1 LIMIT 15', [collegeId]);
    console.log('\nSample cutoffs:');
    console.log(cutoffsRes.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspect();
