const db = require('../config/db');

async function main() {
  try {
    await db.initDbSchema();
    const result = await db.query(`
      SELECT 
        c.id, 
        c.name, 
        c.type, 
        c.nirf_rank, 
        cu.exam, 
        co.course_name, 
        cu.closing_rank
      FROM colleges c
      JOIN courses co ON c.id = co.college_id
      JOIN cutoffs cu ON co.id = cu.course_id
      WHERE cu.category = 'General' AND cu.year = 2025 AND co.course_name LIKE '%Computer%'
      ORDER BY c.type, c.nirf_rank
    `);
    
    console.log(`Auditing ${result.rows.length} CSE General 2025 Cutoffs:`);
    console.table(result.rows.map(r => ({
      Rank: r.nirf_rank,
      Name: r.name,
      Type: r.type,
      Exam: r.exam,
      Branch: r.course_name,
      Cutoff: r.closing_rank
    })));
    
    process.exit(0);
  } catch (err) {
    console.error('Audit failed:', err);
    process.exit(1);
  }
}

main();
