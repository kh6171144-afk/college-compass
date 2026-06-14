const db = require('../config/db');

async function checkSchema() {
  try {
    const res = await db.query('PRAGMA table_info(colleges)');
    console.log('Colleges Table Schema:');
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
