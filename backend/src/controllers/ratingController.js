const db = require('../config/db');

// Submit or update a college rating
exports.submitRating = async (req, res) => {
  try {
    const collegeId = parseInt(req.params.id);
    const userId = req.user.id;
    const { rating_hostels, rating_campus, rating_infra, review_text } = req.body;

    const rHostels = parseFloat(rating_hostels);
    const rCampus = parseFloat(rating_campus);
    const rInfra = parseFloat(rating_infra);

    // Validate inputs
    if (
      isNaN(rHostels) || rHostels < 1 || rHostels > 5 ||
      isNaN(rCampus) || rCampus < 1 || rCampus > 5 ||
      isNaN(rInfra) || rInfra < 1 || rInfra > 5
    ) {
      return res.status(400).json({ error: 'Ratings must be numbers between 1 and 5' });
    }

    // Automatically calculate overall quality as average of hostels, campus environment, and infrastructure
    const rOverall = parseFloat(((rHostels + rCampus + rInfra) / 3).toFixed(2));

    // Verify college exists
    const collegeCheck = await db.query('SELECT id FROM colleges WHERE id = $1', [collegeId]);
    if (collegeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'College not found' });
    }

    // Check if user already rated this college
    const existing = await db.query(
      'SELECT id FROM ratings WHERE college_id = $1 AND user_id = $2',
      [collegeId, userId]
    );

    if (existing.rows.length > 0) {
      // Update rating
      await db.query(
        `UPDATE ratings
         SET rating_hostels = $1, rating_campus = $2, rating_infra = $3, rating_overall = $4, review_text = $5, created_at = CURRENT_TIMESTAMP
         WHERE college_id = $6 AND user_id = $7`,
        [rHostels, rCampus, rInfra, rOverall, review_text || '', collegeId, userId]
      );

      return res.json({
        message: 'Rating updated successfully',
        ratings: { rating_hostels: rHostels, rating_campus: rCampus, rating_infra: rInfra, rating_overall: rOverall, review_text }
      });
    } else {
      // Create new rating
      await db.query(
        `INSERT INTO ratings (college_id, user_id, rating_hostels, rating_campus, rating_infra, rating_overall, review_text)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [collegeId, userId, rHostels, rCampus, rInfra, rOverall, review_text || '']
      );

      return res.status(201).json({
        message: 'Rating submitted successfully',
        ratings: { rating_hostels: rHostels, rating_campus: rCampus, rating_infra: rInfra, rating_overall: rOverall, review_text }
      });
    }
  } catch (err) {
    console.error('Submit rating error:', err);
    res.status(500).json({ error: 'Server error during rating submission' });
  }
};
