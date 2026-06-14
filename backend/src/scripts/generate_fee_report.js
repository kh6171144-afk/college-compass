const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    await db.initDbSchema();
    console.log('--- Running Fee Database Audit ---');

    // 1. Fetch colleges
    const collegesRes = await db.query("SELECT id, name, type FROM colleges");
    const colleges = collegesRes.rows;

    // 2. Fetch fees
    const feesRes = await db.query("SELECT * FROM college_fees");
    const fees = feesRes.rows;

    console.log(`Total colleges in DB: ${colleges.length}`);
    console.log(`Total fee records in DB: ${fees.length}`);

    // Categorization lists
    const verifiedColleges = [];
    const partiallyVerifiedColleges = [];
    const missingFeeColleges = [];
    const conflictingRecords = [];
    const outdatedRecords = [];

    // Map fees by college_id
    const feeMap = new Map();
    for (const f of fees) {
      if (!feeMap.has(f.college_id)) {
        feeMap.set(f.college_id, []);
      }
      feeMap.get(f.college_id).push(f);
    }

    for (const col of colleges) {
      const colFees = feeMap.get(col.id) || [];

      if (colFees.length === 0) {
        missingFeeColleges.push({ col, reason: 'No fee records found' });
        continue;
      }

      // Check conflicts: multiple rows for same course_id (or multiple course_id = NULL rows)
      const courseIdsSeen = new Set();
      let hasConflict = false;
      for (const f of colFees) {
        const key = f.course_id === null ? 'null' : f.course_id.toString();
        if (courseIdsSeen.has(key)) {
          hasConflict = true;
          conflictingRecords.push({ col, record: f, reason: `Duplicate fee entries found for course ID: ${f.course_id}` });
        }
        courseIdsSeen.add(key);

        // Check if outdated (academic year < 2025)
        if (f.academic_year < 2025) {
          outdatedRecords.push({ col, record: f, year: f.academic_year });
        }
      }

      // Check verification statuses
      const allVerified = colFees.every(f => f.verification_status === 'Verified' && f.tuition_fee_per_year !== null && f.hostel_fee_per_year !== null);
      const someVerified = colFees.some(f => f.verification_status === 'Verified' || f.verification_status === 'Partially Verified');
      const allUnverified = colFees.every(f => f.verification_status === 'Unverified' || f.tuition_fee_per_year === null);

      if (allVerified) {
        verifiedColleges.push(col);
      } else if (allUnverified) {
        missingFeeColleges.push({ col, reason: 'All fee records are unverified/null' });
      } else {
        partiallyVerifiedColleges.push(col);
      }
    }

    // Generate markdown report content
    const reportPath = path.resolve('C:/Users/harid/.gemini/antigravity/brain/1411192a-91a2-4c61-8dcc-7959eb4ce749/fee_accuracy_report.md');
    
    let md = `# Engineering College Fee Database Accuracy & Validation Report\n\n`;
    md += `This report lists the validation, verification, and audit results for the newly introduced college fees database across all campuses and engineering specializations.\n\n`;
    
    md += `## Database Summary\n\n`;
    md += `| Metric | Count |\n`;
    md += `| :--- | :--- |\n`;
    md += `| **Total Colleges Audited** | ${colleges.length} |\n`;
    md += `| **Total Fee Records Evaluated** | ${fees.length} |\n`;
    md += `| **Colleges with Fully Verified Fees** | ${verifiedColleges.length} |\n`;
    md += `| **Colleges with Partially Verified Fees** | ${partiallyVerifiedColleges.length} |\n`;
    md += `| **Colleges with Missing/Unverified Fee Data** | ${missingFeeColleges.length} |\n`;
    md += `| **Conflicting Fee Records Found** | ${conflictingRecords.length} |\n`;
    md += `| **Outdated Fee Records Found (< 2025)** | ${outdatedRecords.length} |\n\n`;

    md += `---\n\n`;

    md += `## Verified Institutions (Top Campuses)\n\n`;
    md += `Below is a sample of major campuses with fully verified, campus-specific, or branch-specific fee structures in the database:\n\n`;
    md += `| College Name | Ownership / Type | Verification Status |\n`;
    md += `| :--- | :--- | :--- |\n`;
    verifiedColleges.slice(0, 40).forEach(col => {
      md += `| ${col.name} | ${col.type} | \`Verified\` |\n`;
    });
    if (verifiedColleges.length > 40) {
      md += `| *And ${verifiedColleges.length - 40} other colleges...* | | |\n`;
    }
    md += `\n`;

    md += `## Missing/Unverified Fee Data\n\n`;
    md += `The following colleges do not have verified official fee structures. They are marked as \`Unverified\` and display as "Fee data not verified" to prevent misleading estimates:\n\n`;
    md += `| College Name | Reason / Status |\n`;
    md += `| :--- | :--- |\n`;
    missingFeeColleges.slice(0, 30).forEach(item => {
      md += `| ${item.col.name} | ${item.reason} |\n`;
    });
    if (missingFeeColleges.length > 30) {
      md += `| *And ${missingFeeColleges.length - 30} other colleges...* | |\n`;
    }
    md += `\n`;

    md += `## Outdated Fee Records\n\n`;
    if (outdatedRecords.length === 0) {
      md += `No outdated fee records found. All verified records are calibrated to Academic Year **2025** or later.\n\n`;
    } else {
      md += `| College Name | Academic Year |\n`;
      md += `| :--- | :--- |\n`;
      outdatedRecords.forEach(item => {
        md += `| ${item.col.name} | ${item.year} |\n`;
      });
      md += `\n`;
    }

    md += `## Conflicting Fee Records\n\n`;
    if (conflictingRecords.length === 0) {
      md += `✅ **Zero conflicting fee entries found!** All records correspond to unique college-branch combinations with no overlapping definitions.\n\n`;
    } else {
      md += `| College Name | Conflict Details |\n`;
      md += `| :--- | :--- |\n`;
      conflictingRecords.forEach(item => {
        md += `| ${item.col.name} | ${item.reason} |\n`;
      });
      md += `\n`;
    }

    fs.writeFileSync(reportPath, md);
    console.log(`Successfully generated fee accuracy report at: ${reportPath}`);
    process.exit(0);
  } catch (err) {
    console.error('Audit failed:', err);
    process.exit(1);
  }
}

main();
