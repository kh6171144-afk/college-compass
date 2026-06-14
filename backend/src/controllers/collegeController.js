const db = require('../config/db');

// Get all colleges with optional search, filters, and sorting
exports.getAllColleges = async (req, res) => {
  try {
    const { search, state, type, minPackage, maxFee, sortBy } = req.query;
    
    let sql = `
      SELECT c.*, 
             COALESCE(r.avg_overall, 0) as avg_rating,
             COALESCE(r.total_reviews, 0) as review_count
      FROM colleges c
      LEFT JOIN (
        SELECT college_id, AVG(rating_overall) as avg_overall, COUNT(*) as total_reviews
        FROM ratings
        GROUP BY college_id
      ) r ON c.id = r.college_id
      WHERE 1=1
    `;
    const params = [];
    let paramCounter = 1;

    if (search) {
      sql += ` AND (c.name LIKE $${paramCounter} OR c.city LIKE $${paramCounter} OR c.state LIKE $${paramCounter})`;
      params.push(`%${search}%`);
      paramCounter++;
    }

    if (state) {
      sql += ` AND c.state = $${paramCounter}`;
      params.push(state);
      paramCounter++;
    }

    if (type) {
      sql += ` AND c.type = $${paramCounter}`;
      params.push(type);
      paramCounter++;
    }

    if (minPackage) {
      sql += ` AND c.average_package >= $${paramCounter}`;
      params.push(parseFloat(minPackage));
      paramCounter++;
    }

    if (maxFee) {
      sql += ` AND c.tuition_fee <= $${paramCounter}`;
      params.push(parseFloat(maxFee));
      paramCounter++;
    }

    // Sorting
    if (sortBy === 'nirf_rank') {
      sql += ' ORDER BY CASE WHEN c.nirf_rank IS NULL THEN 999999 ELSE c.nirf_rank END ASC';
    } else if (sortBy === 'highest_package') {
      sql += ' ORDER BY c.highest_package DESC';
    } else if (sortBy === 'average_package') {
      sql += ' ORDER BY c.average_package DESC';
    } else if (sortBy === 'tuition_fee') {
      sql += ' ORDER BY c.tuition_fee ASC';
    } else {
      sql += ' ORDER BY c.name ASC';
    }

    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching colleges:', err);
    res.status(500).json({ error: 'Server error fetching colleges' });
  }
};

// Get single college details including courses, cutoffs, ratings and reviews
exports.getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch College metadata
    const collegeRes = await db.query('SELECT * FROM colleges WHERE id = $1', [id]);
    if (collegeRes.rows.length === 0) {
      return res.status(404).json({ error: 'College not found' });
    }
    const college = collegeRes.rows[0];

    // 2. Fetch associated courses
    const coursesRes = await db.query('SELECT * FROM courses WHERE college_id = $1 ORDER BY course_name ASC', [id]);
    college.courses = coursesRes.rows;

    // 2.5 Fetch associated fee structures
    const feesRes = await db.query(
      `SELECT cf.*, courses.course_name 
       FROM college_fees cf
       LEFT JOIN courses ON cf.course_id = courses.id
       WHERE cf.college_id = $1`, 
      [id]
    );
    college.fees = feesRes.rows;

    // 3. Fetch associated cutoffs (only verified ones with 100% confidence)
    const cutoffsRes = await db.query(
      `SELECT cutoffs.*, courses.course_name 
       FROM cutoffs 
       LEFT JOIN courses ON cutoffs.course_id = courses.id 
       WHERE cutoffs.college_id = $1 AND cutoffs.verification_status = 'Verified'
       ORDER BY cutoffs.year DESC, cutoffs.closing_rank ASC`,
      [id]
    );
    
    // Filter to keep only the ultimate (highest) round details for each (course, exam, category, year) combination
    const ultimateCutoffsMap = new Map();
    for (const cutoff of cutoffsRes.rows) {
      const key = `${cutoff.course_id}_${cutoff.exam}_${cutoff.category}_${cutoff.year}`;
      const existing = ultimateCutoffsMap.get(key);
      if (!existing || (cutoff.round !== null && (existing.round === null || cutoff.round > existing.round))) {
        ultimateCutoffsMap.set(key, cutoff);
      }
    }
    college.cutoffs = Array.from(ultimateCutoffsMap.values());

    // 4. Fetch ratings summary
    const ratingsSummaryRes = await db.query(`
      SELECT 
        AVG(rating_hostels) as avg_hostels,
        AVG(rating_campus) as avg_campus,
        AVG(rating_infra) as avg_infra,
        AVG(rating_overall) as avg_overall,
        COUNT(*) as total_reviews
      FROM ratings
      WHERE college_id = $1
    `, [id]);
    const summary = ratingsSummaryRes.rows[0];
    college.ratings_summary = {
      avg_hostels: summary.avg_hostels ? parseFloat(parseFloat(summary.avg_hostels).toFixed(1)) : 0,
      avg_campus: summary.avg_campus ? parseFloat(parseFloat(summary.avg_campus).toFixed(1)) : 0,
      avg_infra: summary.avg_infra ? parseFloat(parseFloat(summary.avg_infra).toFixed(1)) : 0,
      avg_overall: summary.avg_overall ? parseFloat(parseFloat(summary.avg_overall).toFixed(1)) : 0,
      total_reviews: summary.total_reviews || 0
    };

    // 5. Fetch individual reviews
    const reviewsRes = await db.query(`
      SELECT r.*, u.name as user_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.college_id = $1
      ORDER BY r.created_at DESC
    `, [id]);
    college.reviews = reviewsRes.rows;

    res.json(college);
  } catch (err) {
    console.error('Error fetching college details:', err);
    res.status(500).json({ error: 'Server error fetching college details' });
  }
};

// Get list of unique states and types for filter dropdowns
exports.getFilterOptions = async (req, res) => {
  try {
    const statesRes = await db.query('SELECT DISTINCT state FROM colleges ORDER BY state ASC');
    const typesRes = await db.query('SELECT DISTINCT type FROM colleges ORDER BY type ASC');
    
    res.json({
      states: statesRes.rows.map(r => r.state),
      types: typesRes.rows.map(r => r.type)
    });
  } catch (err) {
    console.error('Error fetching filter options:', err);
    res.status(500).json({ error: 'Server error fetching filter options' });
  }
};
