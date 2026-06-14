const db = require('../config/db');

// Create a new college record
exports.createCollege = async (req, res) => {
  try {
    const {
      name, state, city, type, nirf_rank, naac_grade,
      website, application_link, average_package,
      highest_package, tuition_fee, hostel_fee
    } = req.body;

    const sql = `
      INSERT INTO colleges (
        name, state, city, type, nirf_rank, naac_grade,
        website, application_link, average_package,
        highest_package, tuition_fee, hostel_fee
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id
    `;

    const params = [
      name, state, city, type, 
      nirf_rank ? parseInt(nirf_rank) : null, 
      naac_grade || null,
      website || null, 
      application_link || null,
      average_package ? parseFloat(average_package) : null,
      highest_package ? parseFloat(highest_package) : null,
      tuition_fee ? parseFloat(tuition_fee) : null,
      hostel_fee ? parseFloat(hostel_fee) : null
    ];

    const result = await db.query(sql, params);
    const newId = result.rows[0]?.id;

    res.status(201).json({ message: 'College created successfully', collegeId: newId });
  } catch (err) {
    console.error('Error creating college:', err);
    res.status(500).json({ error: 'Server error creating college' });
  }
};

// Update an existing college
exports.updateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, state, city, type, nirf_rank, naac_grade,
      website, application_link, average_package,
      highest_package, tuition_fee, hostel_fee
    } = req.body;

    const sql = `
      UPDATE colleges SET
        name = $1, state = $2, city = $3, type = $4,
        nirf_rank = $5, naac_grade = $6, website = $7,
        application_link = $8, average_package = $9,
        highest_package = $10, tuition_fee = $11, hostel_fee = $12
      WHERE id = $13
    `;

    const params = [
      name, state, city, type,
      nirf_rank ? parseInt(nirf_rank) : null,
      naac_grade || null,
      website || null,
      application_link || null,
      average_package ? parseFloat(average_package) : null,
      highest_package ? parseFloat(highest_package) : null,
      tuition_fee ? parseFloat(tuition_fee) : null,
      hostel_fee ? parseFloat(hostel_fee) : null,
      id
    ];

    const result = await db.query(sql, params);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'College not found' });
    }

    res.json({ message: 'College updated successfully' });
  } catch (err) {
    console.error('Error updating college:', err);
    res.status(500).json({ error: 'Server error updating college' });
  }
};

// Delete a college and all associated courses & cutoffs
exports.deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM colleges WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'College not found' });
    }

    res.json({ message: 'College deleted successfully' });
  } catch (err) {
    console.error('Error deleting college:', err);
    res.status(500).json({ error: 'Server error deleting college' });
  }
};

// Create a course
exports.createCourse = async (req, res) => {
  try {
    const { college_id, course_name, duration } = req.body;
    
    const sql = `
      INSERT INTO courses (college_id, course_name, duration)
      VALUES ($1, $2, $3) RETURNING id
    `;
    const result = await db.query(sql, [college_id, course_name, duration ? parseInt(duration) : 4]);
    const newId = result.rows[0]?.id;

    res.status(201).json({ message: 'Course added successfully', courseId: newId });
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ error: 'Server error creating course' });
  }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM courses WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Server error deleting course' });
  }
};

// Create a cutoff
exports.createCutoff = async (req, res) => {
  try {
    const { college_id, course_id, exam, category, year, opening_rank, closing_rank } = req.body;
    
    const sql = `
      INSERT INTO cutoffs (college_id, course_id, exam, category, year, opening_rank, closing_rank)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
    `;
    const result = await db.query(sql, [
      college_id, 
      course_id, 
      exam, 
      category, 
      parseInt(year), 
      parseInt(opening_rank), 
      parseInt(closing_rank)
    ]);
    const newId = result.rows[0]?.id;

    res.status(201).json({ message: 'Cutoff added successfully', cutoffId: newId });
  } catch (err) {
    console.error('Error creating cutoff:', err);
    res.status(500).json({ error: 'Server error creating cutoff' });
  }
};

// Delete a cutoff
exports.deleteCutoff = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM cutoffs WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cutoff not found' });
    }
    res.json({ message: 'Cutoff deleted successfully' });
  } catch (err) {
    console.error('Error deleting cutoff:', err);
    res.status(500).json({ error: 'Server error deleting cutoff' });
  }
};
