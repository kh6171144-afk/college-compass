const db = require('../config/db');

async function main() {
  try {
    await db.initDbSchema();
    const collegesRes = await db.query("SELECT id, name FROM colleges WHERE name LIKE '%Manipal%'");
    console.log('Manipal colleges:');
    console.log(collegesRes.rows);

    const jaipurCol = collegesRes.rows.find(c => c.name.includes('Jaipur'));
    if (jaipurCol) {
      console.log(`\nDetailed Cutoffs for ${jaipurCol.name} (ID: ${jaipurCol.id}):`);
      const cutoffsRes = await db.query(`
        SELECT cu.exam, c.course_name, cu.category, cu.year, cu.opening_rank, cu.closing_rank
        FROM cutoffs cu
        JOIN courses c ON cu.course_id = c.id
        WHERE cu.college_id = $1 AND (c.course_name LIKE '%Computer%' OR c.course_name LIKE '%Information%')
        ORDER BY c.course_name, cu.category, cu.year
      `, [jaipurCol.id]);
      console.table(cutoffsRes.rows);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error running check_db:', err);
    process.exit(1);
  }
}

main();
