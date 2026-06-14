const db = require('../config/db');

// Predict eligible colleges and branches based on entrance rank
exports.predictColleges = async (req, res) => {
  try {
    const { rank, exam, category, state } = req.query;

    if (!rank || !exam || !category) {
      return res.status(404).json({ error: 'Please provide rank, exam, and category' });
    }

    const candidateRank = parseInt(rank);

    // Fetch cutoffs matching exam and category
    // We fetch the latest cutoff year data available for accurate predictions (e.g. 2024 or 2025)
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

    const params = [exam, category];
    let paramCounter = 3;

    if (state) {
      sql += ` AND colleges.state = $${paramCounter}`;
      params.push(state);
      paramCounter++;
    }

    // Run query
    const result = await db.query(sql, params);

    // Group and de-duplicate by (college_name, campus_name, branch_name)
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

    // Process and categorize cutoffs
    // Safe: Rank <= 0.9 * Closing Rank
    // Possible: 0.9 * Closing Rank < Rank <= 1.05 * Closing Rank
    // Reach: 1.05 * Closing Rank < Rank <= 1.25 * Closing Rank
    const predictions = uniqueRows.map(row => {
      const closing = row.closing_rank;
      let status = '';
      let chancePercent = 0;

      if (candidateRank <= closing * 0.9) {
        status = 'Safe';
        chancePercent = Math.min(99, Math.round(90 + ((closing * 0.9 - candidateRank) / (closing * 0.9)) * 9));
      } else if (candidateRank <= closing * 1.05) {
        status = 'Possible';
        chancePercent = Math.round(50 + ((closing * 1.05 - candidateRank) / (closing * 0.15)) * 39);
      } else if (candidateRank <= closing * 1.25) {
        status = 'Reach';
        chancePercent = Math.round(10 + ((closing * 1.25 - candidateRank) / (closing * 0.20)) * 39);
      } else {
        status = 'Unlikely';
        chancePercent = 5;
      }

      return {
        ...row,
        status,
        chancePercent
      };
    })
    .filter(p => p.status !== 'Unlikely') // Filter out branches with very low chances
    .sort((a, b) => {
      // Sort by NIRF Rank if available (smaller is better), else name
      const aNirf = a.nirf_rank || 9999;
      const bNirf = b.nirf_rank || 9999;
      return aNirf - bNirf;
    });

    res.json(predictions);
  } catch (err) {
    console.error('Error predicting colleges:', err);
    res.status(500).json({ error: 'Server error in college predictor' });
  }
};

// Predict branch availability for a specific college
exports.predictCourses = async (req, res) => {
  try {
    const { rank, collegeId, category, exam } = req.query;

    if (!rank || !collegeId || !category || !exam) {
      return res.status(400).json({ error: 'Please provide rank, collegeId, category, and exam' });
    }

    const candidateRank = parseInt(rank);

    const sql = `
      SELECT 
        c.id as cutoff_id,
        c.year,
        c.opening_rank,
        c.closing_rank,
        courses.id as course_id,
        courses.course_name,
        courses.duration,
        colleges.name as college_name,
        colleges.campus_name as campus_name
      FROM cutoffs c
      INNER JOIN courses ON c.course_id = courses.id
      INNER JOIN colleges ON c.college_id = colleges.id
      WHERE c.college_id = $1 AND c.exam = $2 AND c.category = $3 AND c.verification_status = 'Verified'
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
      ORDER BY c.closing_rank ASC
    `;

    const result = await db.query(sql, [collegeId, exam, category]);

    // Group and de-duplicate by (college_name, campus_name, branch_name)
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

    const resultsWithStatus = uniqueRows.map(row => {
      const closing = row.closing_rank;
      let status = '';
      let chancePercent = 0;

      if (candidateRank <= closing * 0.9) {
        status = 'Safe';
        chancePercent = 95;
      } else if (candidateRank <= closing * 1.05) {
        status = 'Possible';
        chancePercent = 70;
      } else if (candidateRank <= closing * 1.25) {
        status = 'Reach';
        chancePercent = 35;
      } else {
        status = 'Unlikely';
        chancePercent = 5;
      }

      return {
        ...row,
        status,
        chancePercent
      };
    });

    res.json(resultsWithStatus);
  } catch (err) {
    console.error('Error predicting courses:', err);
    res.status(500).json({ error: 'Server error in course predictor' });
  }
};
