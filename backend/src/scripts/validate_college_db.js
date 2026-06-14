const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function validateCollegeDb() {
  try {
    console.log('--- Starting Database Validation Audit ---');
    const reportPath = path.resolve(__dirname, '../../../../../brain/1411192a-91a2-4c61-8dcc-7959eb4ce749/college_db_validation_report.md');
    
    // Lists to accumulate issues
    const missingCampuses = [];
    const missingBranches = [];
    const missingCutoffYears = [];
    const conflictingCutoffs = [];
    const duplicateColleges = [];

    // 1. Define expected campuses
    const expectedCampuses = {
      'VIT': ['Vellore', 'Chennai', 'Bhopal', 'AP'],
      'Manipal': ['Manipal', 'Jaipur', 'Bengaluru'],
      'Amrita': ['Coimbatore', 'Amritapuri', 'Bengaluru', 'Chennai', 'Amaravati'],
      'SRM': ['Kattankulathur', 'Ramapuram', 'Vadapalani', 'AP'],
      'Symbiosis': ['Pune', 'Nagpur'],
      'Shiv Nadar': ['Greater Noida', 'Chennai'],
      'NMIMS': ['Mumbai', 'Shirpur', 'Bengaluru', 'Navi Mumbai', 'Indore'],
      'Bennett': ['Greater Noida'],
      'UPES': ['Dehradun'],
      'KIIT': ['Bhubaneswar']
    };

    // Get all colleges
    const collegesRes = await db.query('SELECT id, name, campus_name, city, state FROM colleges');
    const colleges = collegesRes.rows;

    // A. Check for Missing Campuses
    for (const [university, expectedList] of Object.entries(expectedCampuses)) {
      for (const expectedCamp of expectedList) {
        // Find if this campus exists in the DB
        const match = colleges.find(c => {
          const nameLower = c.name.toLowerCase();
          const campLower = expectedCamp.toLowerCase();
          const uniLower = university.toLowerCase();
          
          // E.g., name includes both 'vit' and 'chennai', or campus_name matches
          const nameMatches = nameLower.includes(uniLower) && nameLower.includes(campLower);
          const campusNameMatches = c.campus_name && c.campus_name.toLowerCase() === campLower && nameLower.includes(uniLower);
          
          // Exception: MIT Manipal has 'mit' and 'manipal'
          if (university === 'Manipal' && expectedCamp === 'Manipal') {
            return nameLower.includes('mit') && nameLower.includes('manipal');
          }
          
          return nameMatches || campusNameMatches;
        });

        if (!match) {
          missingCampuses.push({ university, campus: expectedCamp });
        }
      }
    }

    // B. Check for Missing Branches & Cutoff Years
    const requiredBranches = [
      'B.Tech Computer Science & Engineering (CSE)',
      'B.Tech Electronics & Communication Engineering (ECE)'
    ];
    const requiredYears = [2025, 2024, 2023, 2022];

    for (const col of colleges) {
      // Is it one of our target multi-campus colleges?
      const isTarget = Object.keys(expectedCampuses).some(uni => col.name.includes(uni) || col.name.includes('MIT Manipal'));
      if (!isTarget) continue;

      // Fetch courses for this college
      const coursesRes = await db.query('SELECT id, course_name FROM courses WHERE college_id = $1', [col.id]);
      const courses = coursesRes.rows;

      for (const reqBranch of requiredBranches) {
        const hasBranch = courses.find(c => c.course_name.includes(reqBranch.split('(')[1].split(')')[0]));
        if (!hasBranch) {
          missingBranches.push({ college: col.name, branch: reqBranch });
        } else {
          // If branch exists, check cutoffs for required years
          const cutoffsRes = await db.query(
            'SELECT DISTINCT year FROM cutoffs WHERE college_id = $1 AND course_id = $2',
            [col.id, hasBranch.id]
          );
          const years = cutoffsRes.rows.map(r => r.year);
          for (const reqYear of requiredYears) {
            if (!years.includes(reqYear)) {
              missingCutoffYears.push({ college: col.name, branch: reqBranch, year: reqYear });
            }
          }
        }
      }
    }

    // C. Check for Conflicting Cutoff Data
    // - Check if opening_rank > closing_rank
    const confRanksRes = await db.query(
      `SELECT c.id, col.name as college_name, crs.course_name, c.year, c.category, c.quota, c.opening_rank, c.closing_rank 
       FROM cutoffs c
       JOIN colleges col ON c.college_id = col.id
       JOIN courses crs ON c.course_id = crs.id
       WHERE c.opening_rank > c.closing_rank`
    );
    for (const r of confRanksRes.rows) {
      conflictingCutoffs.push({
        type: 'Opening rank greater than closing rank',
        college: r.college_name,
        course: r.course_name,
        details: `Year: ${r.year}, Cat: ${r.category}, Quota: ${r.quota}, Open: ${r.opening_rank}, Close: ${r.closing_rank}`
      });
    }

    // - Check for duplicate cutoffs (same college, course, category, year, quota, round)
    const dupCutoffsRes = await db.query(
      `SELECT college_id, course_id, category, year, quota, round, COUNT(*) as cnt 
       FROM cutoffs 
       GROUP BY college_id, course_id, category, year, quota, round 
       HAVING COUNT(*) > 1`
    );
    for (const r of dupCutoffsRes.rows) {
      const colRes = await db.query('SELECT name FROM colleges WHERE id = $1', [r.college_id]);
      const crsRes = await db.query('SELECT course_name FROM courses WHERE id = $1', [r.course_id]);
      conflictingCutoffs.push({
        type: 'Duplicate cutoff records found',
        college: colRes.rows[0]?.name || r.college_id,
        course: crsRes.rows[0]?.course_name || r.course_id,
        details: `Year: ${r.year}, Cat: ${r.category}, Quota: ${r.quota}, Round: ${r.round} (Count: ${r.cnt})`
      });
    }

    // D. Check for Duplicate College Records
    // - Colleges with exact same name or same name & campus_name combination
    const dupColRes = await db.query(
      `SELECT name, campus_name, COUNT(*) as cnt 
       FROM colleges 
       GROUP BY name, campus_name 
       HAVING COUNT(*) > 1`
    );
    for (const r of dupColRes.rows) {
      duplicateColleges.push({
        name: r.name,
        campus: r.campus_name || 'N/A',
        reason: `Found ${r.cnt} exact duplicate entries in colleges table.`
      });
    }

    // - Check for similar names that might be duplicates (e.g. 'VIT Vellore' and 'Vellore Institute of Technology')
    for (let i = 0; i < colleges.length; i++) {
      for (let j = i + 1; j < colleges.length; j++) {
        const nameA = colleges[i].name.toLowerCase();
        const nameB = colleges[j].name.toLowerCase();
        if (nameA === nameB) continue; // exact duplicate is handled above
        
        // E.g., if one includes the other and they are in the same city
        const cityA = colleges[i].city.toLowerCase();
        const cityB = colleges[j].city.toLowerCase();
        
        if (cityA === cityB && (nameA.includes(nameB) || nameB.includes(nameA))) {
          duplicateColleges.push({
            name: `${colleges[i].name} (ID: ${colleges[i].id}) vs ${colleges[j].name} (ID: ${colleges[j].id})`,
            campus: colleges[i].campus_name || 'N/A',
            reason: `Potential name overlap in city: ${colleges[i].city}`
          });
        }
      }
    }

    // 2. Generate Markdown Report
    let mdReport = `# College Database Validation Report\n\n`;
    mdReport += `Generated on: ${new Date().toISOString()}\n`;
    mdReport += `Status: ${
      missingCampuses.length === 0 && missingBranches.length === 0 && missingCutoffYears.length === 0 && conflictingCutoffs.length === 0 && duplicateColleges.length === 0
        ? '✅ ALL CHECKS PASSED'
        : '⚠️ AUDIT ALERTS FOUND'
    }\n\n`;

    // A. Summary Table
    mdReport += `## Audit Summary\n\n`;
    mdReport += `| Check Category | Status | Details / Count |\n`;
    mdReport += `| --- | --- | --- |\n`;
    mdReport += `| Missing Campuses | ${missingCampuses.length === 0 ? '✅ Passed' : '❌ Alert'} | ${missingCampuses.length} missing |\n`;
    mdReport += `| Missing Core Branches (CSE/ECE) | ${missingBranches.length === 0 ? '✅ Passed' : '❌ Alert'} | ${missingBranches.length} missing |\n`;
    mdReport += `| Missing Cutoff Years (2022-2025) | ${missingCutoffYears.length === 0 ? '✅ Passed' : '❌ Alert'} | ${missingCutoffYears.length} missing |\n`;
    mdReport += `| Conflicting Cutoffs / Duplicates | ${conflictingCutoffs.length === 0 ? '✅ Passed' : '❌ Alert'} | ${conflictingCutoffs.length} conflicts |\n`;
    mdReport += `| Duplicate College Records | ${duplicateColleges.length === 0 ? '✅ Passed' : '❌ Alert'} | ${duplicateColleges.length} duplicates |\n\n`;

    // B. Missing Campuses Details
    mdReport += `## 1. Missing Campuses\n\n`;
    if (missingCampuses.length === 0) {
      mdReport += `✅ No expected campuses are missing.\n\n`;
    } else {
      mdReport += `The following expected multi-campus records were not found:\n\n`;
      missingCampuses.forEach(m => {
        mdReport += `- **${m.university}**: ${m.campus} campus\n`;
      });
      mdReport += `\n`;
    }

    // C. Missing Branches Details
    mdReport += `## 2. Missing Core Branches\n\n`;
    if (missingBranches.length === 0) {
      mdReport += `✅ All campuses have courses established for core branches (CSE and ECE).\n\n`;
    } else {
      missingBranches.forEach(m => {
        mdReport += `- **${m.college}**: Missing course registration for **${m.branch}**\n`;
      });
      mdReport += `\n`;
    }

    // D. Missing Cutoff Years Details
    mdReport += `## 3. Missing Cutoff Years (2022-2025)\n\n`;
    if (missingCutoffYears.length === 0) {
      mdReport += `✅ All core courses have cutoff records registered for all required years.\n\n`;
    } else {
      missingCutoffYears.forEach(m => {
        mdReport += `- **${m.college}** (${m.branch}): Missing cutoff data for **${m.year}**\n`;
      });
      mdReport += `\n`;
    }

    // E. Conflicting Cutoffs Details
    mdReport += `## 4. Conflicting Cutoff Data\n\n`;
    if (conflictingCutoffs.length === 0) {
      mdReport += `✅ No rank conflicts (opening > closing) or duplicate cutoff allocations found.\n\n`;
    } else {
      conflictingCutoffs.forEach(m => {
        mdReport += `- **${m.type}** at **${m.college}** (${m.course}): ${m.details}\n`;
      });
      mdReport += `\n`;
    }

    // F. Duplicate Colleges Details
    mdReport += `## 5. Duplicate College Records\n\n`;
    if (duplicateColleges.length === 0) {
      mdReport += `✅ No duplicate college profiles found.\n\n`;
    } else {
      duplicateColleges.forEach(m => {
        mdReport += `- **${m.name}** (Campus: ${m.campus}): ${m.reason}\n`;
      });
      mdReport += `\n`;
    }

    fs.writeFileSync(reportPath, mdReport, 'utf8');
    console.log(`Validation report written successfully to: ${reportPath}`);
    console.log('--- Database Validation Completed ---');
    process.exit(0);
  } catch (err) {
    console.error('Validation script failed:', err);
    process.exit(1);
  }
}

validateCollegeDb();
