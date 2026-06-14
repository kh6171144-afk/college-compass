const db = require('../config/db');

const seedData = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Ensure table structure is created (particularly for SQLite fallback)
    await db.initDbSchema();

    // Clear existing data (using DELETE FROM which is compatible with PG and SQLite)
    console.log('Cleaning up old records...');
    await db.query('DELETE FROM cutoffs');
    await db.query('DELETE FROM courses');
    await db.query('DELETE FROM colleges');
    console.log('Database cleaned.');

    // 1. Define Colleges
    const colleges = [
      {
        name: 'Indian Institute of Technology Bombay (IITB)',
        state: 'Maharashtra',
        city: 'Mumbai',
        type: 'IIT',
        nirf_rank: 3,
        naac_grade: 'A++',
        website: 'https://www.iitb.ac.in',
        application_link: 'https://josaa.nic.in',
        average_package: 23.50,
        highest_package: 168.00,
        tuition_fee: 220000.00,
        hostel_fee: 30000.00
      },
      {
        name: 'Indian Institute of Technology Madras (IITM)',
        state: 'Tamil Nadu',
        city: 'Chennai',
        type: 'IIT',
        nirf_rank: 1,
        naac_grade: 'A++',
        website: 'https://www.iitm.ac.in',
        application_link: 'https://josaa.nic.in',
        average_package: 22.00,
        highest_package: 131.00,
        tuition_fee: 215000.00,
        hostel_fee: 35000.00
      },
      {
        name: 'Indian Institute of Technology Delhi (IITD)',
        state: 'Delhi',
        city: 'New Delhi',
        type: 'IIT',
        nirf_rank: 2,
        naac_grade: 'A++',
        website: 'https://home.iitd.ac.in',
        application_link: 'https://josaa.nic.in',
        average_package: 21.90,
        highest_package: 150.00,
        tuition_fee: 220000.00,
        hostel_fee: 32000.00
      },
      {
        name: 'National Institute of Technology Trichy (NITT)',
        state: 'Tamil Nadu',
        city: 'Tiruchirappalli',
        type: 'NIT',
        nirf_rank: 9,
        naac_grade: 'A+',
        website: 'https://www.nitt.edu',
        application_link: 'https://josaa.nic.in',
        average_package: 15.80,
        highest_package: 52.00,
        tuition_fee: 145000.00,
        hostel_fee: 25000.00
      },
      {
        name: 'National Institute of Technology Surathkal (NITK)',
        state: 'Karnataka',
        city: 'Surathkal',
        type: 'NIT',
        nirf_rank: 12,
        naac_grade: 'A+',
        website: 'https://www.nitk.ac.in',
        application_link: 'https://josaa.nic.in',
        average_package: 15.20,
        highest_package: 54.00,
        tuition_fee: 142000.00,
        hostel_fee: 28000.00
      },
      {
        name: 'COEP Technological University',
        state: 'Maharashtra',
        city: 'Pune',
        type: 'State Government',
        nirf_rank: 73,
        naac_grade: 'A',
        website: 'https://www.coep.org.in',
        application_link: 'https://fe2024.mahacet.org',
        average_package: 9.70,
        highest_package: 50.50,
        tuition_fee: 135000.00,
        hostel_fee: 40000.00
      },
      {
        name: 'Veermata Jijabai Technological Institute (VJTI)',
        state: 'Maharashtra',
        city: 'Mumbai',
        type: 'State Government',
        nirf_rank: 82,
        naac_grade: 'A+',
        website: 'https://vjti.ac.in',
        application_link: 'https://fe2024.mahacet.org',
        average_package: 10.30,
        highest_package: 62.00,
        tuition_fee: 85000.00,
        hostel_fee: 35000.00
      },
      {
        name: 'RV College of Engineering (RVCE)',
        state: 'Karnataka',
        city: 'Bengaluru',
        type: 'Private',
        nirf_rank: 95,
        naac_grade: 'A+',
        website: 'https://rvce.edu.in',
        application_link: 'https://cetonline.karnataka.gov.in',
        average_package: 11.20,
        highest_package: 53.00,
        tuition_fee: 250000.00,
        hostel_fee: 120000.00
      },
      {
        name: 'Jawaharlal Nehru Technological University College of Engineering',
        state: 'Telangana',
        city: 'Hyderabad',
        type: 'State Government',
        nirf_rank: 105,
        naac_grade: 'A+',
        website: 'https://jntuhceh.ac.in',
        application_link: 'https://tseamcet.nic.in',
        average_package: 7.20,
        highest_package: 44.00,
        tuition_fee: 50000.00,
        hostel_fee: 20000.00
      }
    ];

    console.log('Inserting colleges...');
    const collegeIds = {};
    for (const c of colleges) {
      const res = await db.query(
        `INSERT INTO colleges (
          name, state, city, type, nirf_rank, naac_grade, website, 
          application_link, average_package, highest_package, tuition_fee, hostel_fee
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        [
          c.name, c.state, c.city, c.type, c.nirf_rank, c.naac_grade, c.website,
          c.application_link, c.average_package, c.highest_package, c.tuition_fee, c.hostel_fee
        ]
      );
      // Fetch the last inserted ID
      const id = res.rows[0].id;
      collegeIds[c.name] = id;
    }

    console.log('Inserting courses and cutoffs...');

    // Helper to insert course and returns id
    const insertCourse = async (collegeName, courseName, duration = 4) => {
      const colId = collegeIds[collegeName];
      const res = await db.query(
        'INSERT INTO courses (college_id, course_name, duration) VALUES ($1, $2, $3) RETURNING id',
        [colId, courseName, duration]
      );
      return res.rows[0].id;
    };

    // Helper to insert cutoff
    const insertCutoff = async (collegeName, courseId, exam, category, year, opening, closing) => {
      const colId = collegeIds[collegeName];
      await db.query(
        `INSERT INTO cutoffs (college_id, course_id, exam, category, year, opening_rank, closing_rank)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [colId, courseId, exam, category, year, opening, closing]
      );
    };

    // --- SEED COURSES & CUTOFFS FOR IIT BOMBAY ---
    const iitb_cse = await insertCourse('Indian Institute of Technology Bombay (IITB)', 'Computer Science & Engineering');
    const iitb_ece = await insertCourse('Indian Institute of Technology Bombay (IITB)', 'Electrical Engineering');
    const iitb_mech = await insertCourse('Indian Institute of Technology Bombay (IITB)', 'Mechanical Engineering');

    // IIT Bombay JEE Advanced cutoffs (General, OBC, SC, ST)
    const categories = ['General', 'OBC', 'SC', 'ST'];
    
    // CSE Cutoffs
    await insertCutoff('Indian Institute of Technology Bombay (IITB)', iitb_cse, 'JEE Advanced', 'General', 2024, 1, 68);
    await insertCutoff('Indian Institute of Technology Bombay (IITB)', iitb_cse, 'JEE Advanced', 'OBC', 2024, 10, 50);
    await insertCutoff('Indian Institute of Technology Bombay (IITB)', iitb_cse, 'JEE Advanced', 'SC', 2024, 5, 20);
    await insertCutoff('Indian Institute of Technology Bombay (IITB)', iitb_cse, 'JEE Advanced', 'ST', 2024, 2, 10);
    
    // EE Cutoffs
    await insertCutoff('Indian Institute of Technology Bombay (IITB)', iitb_ece, 'JEE Advanced', 'General', 2024, 80, 290);
    await insertCutoff('Indian Institute of Technology Bombay (IITB)', iitb_ece, 'JEE Advanced', 'OBC', 2024, 90, 180);
    await insertCutoff('Indian Institute of Technology Bombay (IITB)', iitb_ece, 'JEE Advanced', 'SC', 2024, 40, 95);
    
    // ME Cutoffs
    await insertCutoff('Indian Institute of Technology Bombay (IITB)', iitb_mech, 'JEE Advanced', 'General', 2024, 300, 1200);
    await insertCutoff('Indian Institute of Technology Bombay (IITB)', iitb_mech, 'JEE Advanced', 'OBC', 2024, 250, 750);

    // --- SEED COURSES & CUTOFFS FOR IIT MADRAS ---
    const iitm_cse = await insertCourse('Indian Institute of Technology Madras (IITM)', 'Computer Science & Engineering');
    const iitm_ece = await insertCourse('Indian Institute of Technology Madras (IITM)', 'Electrical Engineering');

    await insertCutoff('Indian Institute of Technology Madras (IITM)', iitm_cse, 'JEE Advanced', 'General', 2024, 50, 140);
    await insertCutoff('Indian Institute of Technology Madras (IITM)', iitm_cse, 'JEE Advanced', 'OBC', 2024, 60, 98);
    await insertCutoff('Indian Institute of Technology Madras (IITM)', iitm_ece, 'JEE Advanced', 'General', 2024, 150, 480);

    // --- SEED COURSES & CUTOFFS FOR IIT DELHI ---
    const iitd_cse = await insertCourse('Indian Institute of Technology Delhi (IITD)', 'Computer Science & Engineering');
    const iitd_ece = await insertCourse('Indian Institute of Technology Delhi (IITD)', 'Electrical Engineering');

    await insertCutoff('Indian Institute of Technology Delhi (IITD)', iitd_cse, 'JEE Advanced', 'General', 2024, 20, 115);
    await insertCutoff('Indian Institute of Technology Delhi (IITD)', iitd_ece, 'JEE Advanced', 'General', 2024, 100, 380);

    // --- SEED COURSES & CUTOFFS FOR NIT TRICHY (JEE Main rank cutoffs) ---
    const nitt_cse = await insertCourse('National Institute of Technology Trichy (NITT)', 'Computer Science & Engineering');
    const nitt_ece = await insertCourse('National Institute of Technology Trichy (NITT)', 'Electronics & Communication Engineering');
    const nitt_eee = await insertCourse('National Institute of Technology Trichy (NITT)', 'Electrical & Electronics Engineering');

    await insertCutoff('National Institute of Technology Trichy (NITT)', nitt_cse, 'JEE Main', 'General', 2024, 500, 1500);
    await insertCutoff('National Institute of Technology Trichy (NITT)', nitt_cse, 'JEE Main', 'OBC', 2024, 400, 800);
    await insertCutoff('National Institute of Technology Trichy (NITT)', nitt_cse, 'JEE Main', 'SC', 2024, 100, 300);
    await insertCutoff('National Institute of Technology Trichy (NITT)', nitt_ece, 'JEE Main', 'General', 2024, 1200, 3500);
    await insertCutoff('National Institute of Technology Trichy (NITT)', nitt_eee, 'JEE Main', 'General', 2024, 2500, 5800);

    // --- SEED COURSES & CUTOFFS FOR NIT SURATHKAL ---
    const nitk_cse = await insertCourse('National Institute of Technology Surathkal (NITK)', 'Computer Science & Engineering');
    const nitk_ece = await insertCourse('National Institute of Technology Surathkal (NITK)', 'Electronics & Communication Engineering');

    await insertCutoff('National Institute of Technology Surathkal (NITK)', nitk_cse, 'JEE Main', 'General', 2024, 600, 2000);
    await insertCutoff('National Institute of Technology Surathkal (NITK)', nitk_ece, 'JEE Main', 'General', 2024, 1800, 4200);

    // --- SEED COURSES & CUTOFFS FOR COEP PUNE (MHT-CET percentiles or state ranks) ---
    // In MHT-CET, closing rank is usually a state-level general merit rank (1 to 50000)
    const coep_cse = await insertCourse('COEP Technological University', 'Computer Science & Engineering');
    const coep_ece = await insertCourse('COEP Technological University', 'Electronics & Telecommunication Engineering');
    const coep_mech = await insertCourse('COEP Technological University', 'Mechanical Engineering');

    await insertCutoff('COEP Technological University', coep_cse, 'MHT-CET', 'General', 2024, 50, 150);
    await insertCutoff('COEP Technological University', coep_cse, 'MHT-CET', 'OBC', 2024, 120, 350);
    await insertCutoff('COEP Technological University', coep_ece, 'MHT-CET', 'General', 2024, 151, 650);
    await insertCutoff('COEP Technological University', coep_mech, 'MHT-CET', 'General', 2024, 600, 2500);

    // --- SEED COURSES & CUTOFFS FOR VJTI MUMBAI ---
    const vjti_cse = await insertCourse('Veermata Jijabai Technological Institute (VJTI)', 'Computer Science & Engineering');
    const vjti_ece = await insertCourse('Veermata Jijabai Technological Institute (VJTI)', 'Electronics & Telecommunication Engineering');

    await insertCutoff('Veermata Jijabai Technological Institute (VJTI)', vjti_cse, 'MHT-CET', 'General', 2024, 60, 220);
    await insertCutoff('Veermata Jijabai Technological Institute (VJTI)', vjti_ece, 'MHT-CET', 'General', 2024, 230, 800);

    // --- SEED COURSES & CUTOFFS FOR RVCE BENGALURU (KCET state ranks) ---
    const rvce_cse = await insertCourse('RV College of Engineering (RVCE)', 'Computer Science & Engineering');
    const rvce_ece = await insertCourse('RV College of Engineering (RVCE)', 'Electronics & Communication Engineering');

    await insertCutoff('RV College of Engineering (RVCE)', rvce_cse, 'KCET', 'General', 2024, 100, 450);
    await insertCutoff('RV College of Engineering (RVCE)', rvce_cse, 'KCET', 'OBC', 2024, 300, 950);
    await insertCutoff('RV College of Engineering (RVCE)', rvce_ece, 'KCET', 'General', 2024, 451, 1200);

    // --- SEED COURSES & CUTOFFS FOR JNTU HYDERABAD (TS EAMCET state ranks) ---
    const jntuh_cse = await insertCourse('Jawaharlal Nehru Technological University College of Engineering', 'Computer Science & Engineering');
    const jntuh_ece = await insertCourse('Jawaharlal Nehru Technological University College of Engineering', 'Electronics & Communication Engineering');

    await insertCutoff('Jawaharlal Nehru Technological University College of Engineering', jntuh_cse, 'EAMCET', 'General', 2024, 150, 850);
    await insertCutoff('Jawaharlal Nehru Technological University College of Engineering', jntuh_cse, 'EAMCET', 'OBC', 2024, 500, 2200);
    await insertCutoff('Jawaharlal Nehru Technological University College of Engineering', jntuh_ece, 'EAMCET', 'General', 2024, 851, 2500);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed with error:', err);
    process.exit(1);
  }
};

seedData();
