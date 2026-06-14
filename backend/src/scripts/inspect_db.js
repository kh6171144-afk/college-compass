const db = require('../config/db');

async function inspectDb() {
  try {
    await db.initDbSchema();
    const keywords = ['VIT', 'Manipal', 'Amrita', 'SRM', 'Kalinga', 'Symbiosis', 'Shiv Nadar', 'NMIMS', 'UPES', 'Bennett', 'MIT'];
    console.log('--- Inspecting database for multi-campus institutes ---');
    for (const kw of keywords) {
      const queryStr = `SELECT id, name, type, city, state FROM colleges WHERE name LIKE ? OR type = ?`;
      const res = await db.query(queryStr, [`%${kw}%`, kw]);
      console.log(`Keyword: "${kw}" -> Found ${res.rows.length} records:`);
      if (res.rows.length > 0) {
        console.log(JSON.stringify(res.rows, null, 2));
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('Inspection failed:', err);
    process.exit(1);
  }
}

inspectDb();
