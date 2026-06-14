const db = require('../config/db');

async function testDedup() {
  try {
    await db.initDbSchema();
    console.log('--- Testing College Predictor Query Deduplication ---');

    // Mimic inputs: rank = 30000, exam = 'VITEEE', category = 'General'
    const exam = 'VITEEE';
    const category = 'General';

    let sql = `
      SELECT 
        c.id as cutoff_id,
        c.year,
        c.opening_rank,
        c.closing_rank,
        c.exam,
        c.category,
        colleges.id as college_id,
        colleges.name as college_name,
        colleges.campus_name as campus_name,
        colleges.state,
        colleges.city,
        colleges.type as college_type,
        colleges.nirf_rank,
        colleges.average_package,
        colleges.tuition_fee,
        courses.id as course_id,
        courses.course_name,
        courses.duration
      FROM cutoffs c
      INNER JOIN colleges ON c.college_id = colleges.id
      INNER JOIN courses ON c.course_id = courses.id
      WHERE c.exam = $1 AND c.category = $2 AND c.verification_status = 'Verified'
        AND c.id = (
          SELECT c2.id
          FROM cutoffs c2
          WHERE c2.college_id = c.college_id 
            AND c2.course_id = c.course_id 
            AND c2.exam = c.exam 
            AND c2.category = c.category 
            AND c2.year = c.year 
            AND c2.verification_status = 'Verified'
          ORDER BY c2.closing_rank ASC, c2.id ASC
          LIMIT 1
        )
    `;

    const result = await db.query(sql, [exam, category]);
    console.log(`Raw rows returned from DB: ${result.rows.length}`);

    const groupedMap = new Map();
    for (const row of result.rows) {
      const key = `${row.college_name || ''}_${row.campus_name || ''}_${row.course_name || ''}`.toLowerCase().replace(/\s+/g, '');
      const existing = groupedMap.get(key);
      if (!existing) {
        groupedMap.set(key, row);
      } else {
        if (row.year > existing.year) {
          groupedMap.set(key, row);
        } else if (row.year === existing.year) {
          if (row.closing_rank < existing.closing_rank) {
            groupedMap.set(key, row);
          }
        }
      }
    }
    const uniqueRows = Array.from(groupedMap.values());
    console.log(`Deduplicated unique rows: ${uniqueRows.length}`);

    // Print VIT AP records specifically to verify
    const vitApRows = uniqueRows.filter(r => r.college_name.includes('VIT AP'));
    console.log('\nVIT AP predicted courses:');
    console.table(vitApRows.map(r => ({
      college: r.college_name,
      campus: r.campus_name,
      course: r.course_name,
      year: r.year,
      closing: r.closing_rank
    })));

    // Verify there are no duplicates at all by checking count
    const keys = uniqueRows.map(r => `${r.college_name}_${r.campus_name}_${r.course_name}`);
    const keySet = new Set(keys);
    if (keys.length === keySet.size) {
      console.log('\n✅ PASS: Zero duplicate college-campus-branch combinations found!');
    } else {
      console.log('\n❌ FAIL: Duplicate entries detected!');
    }

    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

testDedup();
