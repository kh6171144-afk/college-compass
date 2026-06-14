const db = require('../config/db');

async function cleanRedundantRounds() {
  try {
    console.log('===========================================================');
    console.log('   Cleaning Redundant Cutoff Rounds from Database          ');
    console.log('===========================================================');

    // 1. Fetch all cutoffs
    console.log('Fetching all cutoff records...');
    const res = await db.query('SELECT id, college_id, course_id, exam, category, year, round, closing_rank FROM cutoffs');
    const totalRecords = res.rows.length;
    console.log(`Loaded ${totalRecords} cutoffs.`);

    // 2. Identify ultimate rounds to keep
    const keepMap = new Map();
    for (const row of res.rows) {
      const key = `${row.college_id}_${row.course_id}_${row.exam}_${row.category}_${row.year}`;
      const existing = keepMap.get(key);
      
      if (!existing) {
        keepMap.set(key, row);
      } else {
        const existingRound = existing.round !== null ? existing.round : -1;
        const currentRound = row.round !== null ? row.round : -1;
        
        let shouldReplace = false;
        if (currentRound > existingRound) {
          shouldReplace = true;
        } else if (currentRound === existingRound) {
          if (row.closing_rank > existing.closing_rank) {
            shouldReplace = true;
          }
        }
        
        if (shouldReplace) {
          keepMap.set(key, row);
        }
      }
    }

    const keepIds = new Set(Array.from(keepMap.values()).map(r => r.id));
    console.log(`Unique cutoffs to keep (ultimate rounds): ${keepIds.size}`);

    // 3. Find IDs to delete
    const deleteIds = res.rows.filter(r => !keepIds.has(r.id)).map(r => r.id);
    console.log(`Redundant round records to delete: ${deleteIds.length}`);

    // 4. Perform deletion
    if (deleteIds.length > 0) {
      console.log('Starting transaction for deletion...');
      await db.query('BEGIN TRANSACTION');
      
      // Delete in chunks of 500 to stay within limits
      const chunkSize = 500;
      let deletedCount = 0;
      
      for (let i = 0; i < deleteIds.length; i += chunkSize) {
        const chunk = deleteIds.slice(i, i + chunkSize);
        const placeholders = chunk.map((_, idx) => `$${idx + 1}`).join(', ');
        const result = await db.query(`DELETE FROM cutoffs WHERE id IN (${placeholders})`, chunk);
        deletedCount += result.rowCount || chunk.length;
      }
      
      await db.query('COMMIT');
      console.log(`Successfully deleted ${deletedCount} redundant cutoff records.`);
    } else {
      console.log('No redundant cutoff records found. Database is already clean.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Redundant round cleanup failed:', err);
    process.exit(1);
  }
}

cleanRedundantRounds();
