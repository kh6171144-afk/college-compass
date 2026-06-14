const db = require('../config/db');

const getBaseCseRank = (name, type) => {
  // 1. IITs
  if (type === 'IIT') {
    if (name.includes('Bombay')) return 66;
    if (name.includes('Delhi')) return 110;
    if (name.includes('Madras')) return 150;
    if (name.includes('Kanpur')) return 250;
    if (name.includes('Kharagpur')) return 415;
    if (name.includes('Roorkee')) return 480;
    if (name.includes('Hyderabad')) return 600;
    if (name.includes('Guwahati')) return 650;
    if (name.includes('Varanasi') || name.includes('BHU')) return 1000;
    if (name.includes('Indore')) return 1350;
    if (name.includes('Gandhinagar')) return 1550;
    if (name.includes('Ropar')) return 1850;
    if (name.includes('Jodhpur')) return 2200;
    if (name.includes('Mandi')) return 2700;
    if (name.includes('Patna')) return 2800;
    if (name.includes('Bhubaneswar')) return 3100;
    if (name.includes('Tirupati')) return 4200;
    if (name.includes('Palakkad')) return 4800;
    if (name.includes('Dharwad')) return 5200;
    if (name.includes('Jammu')) return 5800;
    if (name.includes('Bhilai')) return 6000;
    return 5000; // default fallback for other/new IITs
  }

  // 2. NITs
  if (type === 'NIT') {
    if (name.includes('Trichy') || name.includes('Tiruchirappalli')) return 1600;
    if (name.includes('Surathkal')) return 1850;
    if (name.includes('Warangal')) return 3000;
    if (name.includes('Rourkela')) return 3500;
    if (name.includes('Allahabad') || name.includes('MNNIT')) return 4000;
    if (name.includes('Jaipur') || name.includes('MNIT')) return 4500;
    if (name.includes('Nagpur') || name.includes('VNIT')) return 5000;
    if (name.includes('Calicut')) return 5200;
    if (name.includes('Kurukshetra')) return 6200;
    if (name.includes('Surat') || name.includes('SVNIT')) return 6500;
    if (name.includes('Jamshedpur')) return 7200;
    if (name.includes('Durgapur')) return 8500;
    if (name.includes('Jalandhar')) return 9200;
    if (name.includes('Silchar')) return 9800;
    if (name.includes('Hamirpur')) return 10500;
    if (name.includes('Goa')) return 11000;
    if (name.includes('Raipur')) return 11500;
    if (name.includes('Patna')) return 12500;
    if (name.includes('Karaikal') || name.includes('Puducherry')) return 13500;
    if (name.includes('Agartala')) return 14500;
    if (name.includes('Meghalaya')) return 15000;
    if (name.includes('Uttarakhand')) return 16000;
    if (name.includes('Srinagar')) return 18000;
    if (name.includes('Manipur')) return 22000;
    if (name.includes('Sikkim')) return 23000;
    if (name.includes('Mizoram')) return 24000;
    if (name.includes('Arunachal')) return 25000;
    if (name.includes('Nagaland')) return 26000;
    return 15000; // default fallback for other NITs
  }

  // 3. IIITs
  if (type === 'IIIT' || name.includes('IIIT')) {
    if (name.includes('Allahabad')) return 5000;
    if (name.includes('Bangalore')) return 7000;
    if (name.includes('Gwalior')) return 7500;
    if (name.includes('Lucknow')) return 9000;
    if (name.includes('Jabalpur')) return 12000;
    if (name.includes('Pune')) return 15000;
    if (name.includes('Kancheepuram')) return 16000;
    if (name.includes('Vadodara')) return 18000;
    if (name.includes('Kota')) return 22000;
    if (name.includes('Sri City')) return 24000;
    if (name.includes('Dharwad')) return 28000;
    if (name.includes('Kalyani')) return 30000;
    return 18000; // default fallback for other IIITs
  }

  return null;
};

const getPrivateOrStateBaseRank = (col, exam, branchName) => {
  const isCse = branchName.includes('Computer');
  const isEce = branchName.includes('Communication') || branchName.includes('Information');
  const isEe = branchName.includes('Electrical');
  const isMech = branchName.includes('Mechanical');
  const isCivil = branchName.includes('Civil');
  const isIT = branchName.includes('Information Technology');

  if (exam === 'BITSAT') {
    if (isCse) return 350;
    if (isEce || isIT) return 1200;
    if (isEe) return 2000;
    if (isMech) return 3000;
    return 4500;
  }

  if (exam === 'MET') {
    if (col.name.includes('Jaipur')) {
      // Manipal University Jaipur
      if (isCse) return 32000;
      if (isIT) return 38000;
      if (isEce) return 45000;
      if (isEe) return 50000;
      if (isMech) return 55000;
      return 60000;
    } else {
      // MIT Manipal (highly competitive)
      if (isCse) return 4500;
      if (isIT) return 6000;
      if (isEce) return 9000;
      if (isEe) return 15000;
      if (isMech) return 20000;
      return 25000;
    }
  }

  if (exam === 'VITEEE') {
    if (col.name.includes('Vellore')) {
      if (isCse) return 8000;
      if (isIT) return 12000;
      if (isEce) return 16000;
      if (isEe) return 25000;
      if (isMech) return 35000;
      return 50000;
    }
    // Default fallback for other VIT campuses
    if (isCse) return 18000;
    if (isIT) return 24000;
    if (isEce) return 30000;
    return 45000;
  }

  if (exam === 'SRMJEEE') {
    if (isCse) return 12000;
    if (isIT) return 18000;
    if (isEce) return 25000;
    if (isEe) return 35000;
    return 50000;
  }

  if (exam === 'AEEE') {
    if (isCse) return 1800;
    if (isIT) return 3000;
    if (isEce) return 4500;
    if (isEe) return 8000;
    return 15000;
  }

  if (exam === 'COMEDK') {
    if (col.name.includes('RV College')) {
      if (isCse) return 400;
      if (isIT) return 600;
      if (isEce) return 1200;
      if (isEe) return 2500;
      return 6000;
    }
    if (col.name.includes('BMS College')) {
      if (isCse) return 900;
      if (isIT) return 1300;
      if (isEce) return 2200;
      if (isEe) return 4000;
      return 9000;
    }
    if (col.name.includes('Ramaiah')) {
      if (isCse) return 1000;
      if (isIT) return 1500;
      if (isEce) return 2500;
      if (isEe) return 5000;
      return 10000;
    }
    // Fallback for other COMEDK colleges (like CMRIT, New Horizon)
    if (isCse) return 8000;
    if (isIT) return 12000;
    if (isEce) return 16000;
    return 30000;
  }

  if (exam === 'MHT-CET') {
    if (col.name.includes('COEP')) {
      if (isCse) return 150;
      if (isIT) return 250;
      if (isEce) return 450;
      if (isEe) return 900;
      return 2500;
    }
    if (col.name.includes('VJTI')) {
      if (isCse) return 120;
      if (isIT) return 200;
      if (isEce) return 380;
      if (isEe) return 800;
      return 2200;
    }
    if (col.name.includes('Vishwakarma Institute of Technology')) {
      if (isCse) return 1500;
      if (isIT) return 2000;
      if (isEce) return 3500;
      if (isEe) return 6000;
      return 12000;
    }
    // Fallback for private/state colleges in Maharashtra
    if (isCse) return 3000;
    if (isIT) return 4500;
    if (isEce) return 6500;
    return 18000;
  }

  if (exam === 'WBJEE') {
    if (col.name.includes('Jadavpur')) {
      if (isCse) return 80;
      if (isIT) return 120;
      if (isEce) return 200;
      if (isEe) return 450;
      return 1200;
    }
    if (col.name.includes('Heritage') || col.name.includes('IEM')) {
      if (isCse) return 3000;
      if (isIT) return 4500;
      if (isEce) return 6000;
      return 15000;
    }
    // Fallback
    if (isCse) return 6000;
    if (isIT) return 8500;
    if (isEce) return 12000;
    return 25000;
  }

  if (exam === 'GUJCET') {
    if (col.name.includes('L.D. College') || col.name.includes('LDCE')) {
      if (isCse) return 800;
      if (isIT) return 1200;
      if (isEce) return 2500;
      if (isEe) return 4500;
      return 10000;
    }
    if (col.name.includes('Vishwakarma Government')) {
      if (isCse) return 1500;
      if (isIT) return 2200;
      if (isEce) return 4000;
      if (isEe) return 7000;
      return 15000;
    }
    // Fallback (like DDU, GCET)
    if (isCse) return 2500;
    if (isIT) return 3800;
    if (isEce) return 6000;
    return 18000;
  }

  if (exam === 'KEAM') {
    if (col.name.includes('Trivandrum') || col.name.includes('CET')) {
      if (isCse) return 400;
      if (isEce) return 1000;
      if (isEe) return 2200;
      return 6000;
    }
    if (col.name.includes('Thrissur')) {
      if (isCse) return 900;
      if (isEce) return 2000;
      if (isEe) return 3500;
      return 9000;
    }
    // Fallback
    if (isCse) return 2000;
    if (isEce) return 4000;
    if (isEe) return 7000;
    return 15000;
  }

  if (exam === 'KCET') {
    if (col.name.includes('RV College')) {
      if (isCse) return 250;
      if (isIT) return 350;
      if (isEce) return 600;
      if (isEe) return 1200;
      return 4000;
    }
    if (col.name.includes('BMS College')) {
      if (isCse) return 600;
      if (isIT) return 850;
      if (isEce) return 1400;
      if (isEe) return 2500;
      return 6000;
    }
    if (col.name.includes('Ramaiah')) {
      if (isCse) return 800;
      if (isIT) return 1100;
      if (isEce) return 1800;
      if (isEe) return 3200;
      return 8000;
    }
    // Fallback (like New Horizon, CMRIT)
    if (isCse) return 5000;
    if (isIT) return 8000;
    if (isEce) return 12000;
    return 25000;
  }

  if (exam === 'EAMCET') {
    if (col.name.includes('JNTU')) {
      if (isCse) return 500;
      if (isIT) return 800;
      if (isEce) return 1200;
      if (isEe) return 2200;
      return 6000;
    }
    if (col.name.includes('Vasavi') || col.name.includes('CBIT')) {
      if (isCse) return 800;
      if (isIT) return 1200;
      if (isEce) return 1800;
      if (isEe) return 3500;
      return 9000;
    }
    // Fallback
    if (isCse) return 3500;
    if (isIT) return 5500;
    if (isEce) return 8000;
    return 20000;
  }

  // Private exams
  if (exam === 'LPUNEST') {
    if (isCse) return 8000;
    return 20000;
  }
  if (exam === 'CUCET') {
    if (isCse) return 6000;
    return 18000;
  }
  if (exam === 'HITSEEE') {
    if (isCse) return 4000;
    return 12000;
  }
  if (exam === 'GLAET') {
    if (isCse) return 5000;
    return 15000;
  }

  // General JEE Main fallback for State/Private
  const multiplier = col.type === 'Private' ? 350 : 250;
  if (isCse) {
    return 1000 + multiplier * col.rank;
  } else if (isEce || isIT) {
    return 3000 + (multiplier + 100) * col.rank;
  } else if (isEe) {
    return 6000 + (multiplier + 200) * col.rank;
  } else {
    return 10000 + (multiplier + 300) * col.rank;
  }
};

const seedExpanded = async () => {
  try {
    console.log('Starting Expanded Database Seeding for Top 200 NIRF Colleges...');
    
    // Ensure table structure is created
    await db.initDbSchema();

    // Clear existing data (using DELETE FROM which is compatible with PG and SQLite)
    console.log('Cleaning up old records...');
    await db.query('DELETE FROM cutoffs');
    await db.query('DELETE FROM courses');
    await db.query('DELETE FROM colleges');
    console.log('Database cleaned.');

    // 200 NIRF Engineering Colleges (Ranks 1 to 200 sequentially for 2025)
    const colleges = [
      { name: 'Indian Institute of Technology Madras (IITM)', state: 'Tamil Nadu', city: 'Chennai', type: 'IIT', nirf_rank: 1, naac_grade: 'A++', website: 'https://www.iitm.ac.in', avg_pkg: 22.0, max_pkg: 131.0, t_fee: 215000, h_fee: 35000 },
      { name: 'Indian Institute of Technology Delhi (IITD)', state: 'Delhi', city: 'New Delhi', type: 'IIT', nirf_rank: 2, naac_grade: 'A++', website: 'https://home.iitd.ac.in', avg_pkg: 21.9, max_pkg: 150.0, t_fee: 220000, h_fee: 32000 },
      { name: 'Indian Institute of Technology Bombay (IITB)', state: 'Maharashtra', city: 'Mumbai', type: 'IIT', nirf_rank: 3, naac_grade: 'A++', website: 'https://www.iitb.ac.in', avg_pkg: 23.5, max_pkg: 168.0, t_fee: 220000, h_fee: 30000 },
      { name: 'Indian Institute of Technology Kanpur (IITK)', state: 'Uttar Pradesh', city: 'Kanpur', type: 'IIT', nirf_rank: 4, naac_grade: 'A++', website: 'https://www.iitk.ac.in', avg_pkg: 20.0, max_pkg: 120.0, t_fee: 215000, h_fee: 28000 },
      { name: 'Indian Institute of Technology Kharagpur (IITKGP)', state: 'West Bengal', city: 'Kharagpur', type: 'IIT', nirf_rank: 5, naac_grade: 'A++', website: 'https://www.iitkgp.ac.in', avg_pkg: 19.5, max_pkg: 110.0, t_fee: 210000, h_fee: 26000 },
      { name: 'Indian Institute of Technology Roorkee (IITR)', state: 'Uttarakhand', city: 'Roorkee', type: 'IIT', nirf_rank: 6, naac_grade: 'A++', website: 'https://www.iitr.ac.in', avg_pkg: 18.2, max_pkg: 105.0, t_fee: 215000, h_fee: 29000 },
      { name: 'Indian Institute of Technology Hyderabad (IITH)', state: 'Telangana', city: 'Sangareddy', type: 'IIT', nirf_rank: 7, naac_grade: 'A++', website: 'https://www.iith.ac.in', avg_pkg: 17.5, max_pkg: 90.0, t_fee: 220000, h_fee: 34000 },
      { name: 'Indian Institute of Technology Guwahati (IITG)', state: 'Assam', city: 'Guwahati', type: 'IIT', nirf_rank: 8, naac_grade: 'A++', website: 'https://www.iitg.ac.in', avg_pkg: 18.0, max_pkg: 95.0, t_fee: 215000, h_fee: 25000 },
      { name: 'National Institute of Technology Trichy (NITT)', state: 'Tamil Nadu', city: 'Tiruchirappalli', type: 'NIT', nirf_rank: 9, naac_grade: 'A+', website: 'https://www.nitt.edu', avg_pkg: 15.8, max_pkg: 52.0, t_fee: 145000, h_fee: 25000 },
      { name: 'IIT (Banaras Hindu University) Varanasi', state: 'Uttar Pradesh', city: 'Varanasi', type: 'IIT', nirf_rank: 10, naac_grade: 'A', website: 'https://iitbhu.ac.in', avg_pkg: 17.1, max_pkg: 85.0, t_fee: 210000, h_fee: 28000 },
      { name: 'BITS Pilani', state: 'Rajasthan', city: 'Pilani', type: 'Private', nirf_rank: 11, naac_grade: 'A++', website: 'https://www.bits-pilani.ac.in', avg_pkg: 19.0, max_pkg: 60.0, t_fee: 550000, h_fee: 100000 },
      { name: 'Indian Institute of Technology Indore (IITI)', state: 'Madhya Pradesh', city: 'Indore', type: 'IIT', nirf_rank: 12, naac_grade: 'A++', website: 'https://www.iiti.ac.in', avg_pkg: 16.5, max_pkg: 68.0, t_fee: 215000, h_fee: 30000 },
      { name: 'National Institute of Technology Rourkela', state: 'Odisha', city: 'Rourkela', type: 'NIT', nirf_rank: 13, naac_grade: 'A+', website: 'https://www.nitrkl.ac.in', avg_pkg: 12.8, max_pkg: 46.0, t_fee: 142000, h_fee: 27000 },
      { name: 'SRM Institute of Science and Technology', state: 'Tamil Nadu', city: 'Chennai', type: 'Private', nirf_rank: 14, naac_grade: 'A++', website: 'https://www.srmist.edu.in', avg_pkg: 8.2, max_pkg: 42.0, t_fee: 300000, h_fee: 120000 },
      { name: 'Indian Institute of Technology (ISM) Dhanbad', state: 'Jharkhand', city: 'Dhanbad', type: 'IIT', nirf_rank: 15, naac_grade: 'A', website: 'https://www.iitism.ac.in', avg_pkg: 16.2, max_pkg: 56.0, t_fee: 210000, h_fee: 28000 },
      { name: 'VIT Vellore', state: 'Tamil Nadu', city: 'Vellore', type: 'Private', nirf_rank: 16, naac_grade: 'A++', website: 'https://vit.ac.in', avg_pkg: 9.2, max_pkg: 50.0, t_fee: 198000, h_fee: 95000 },
      { name: 'National Institute of Technology Surathkal (NITK)', state: 'Karnataka', city: 'Surathkal', type: 'NIT', nirf_rank: 17, naac_grade: 'A+', website: 'https://www.nitk.ac.in', avg_pkg: 15.2, max_pkg: 54.0, t_fee: 142000, h_fee: 28000 },
      { name: 'Jadavpur University', state: 'West Bengal', city: 'Kolkata', type: 'State Government', nirf_rank: 18, naac_grade: 'A++', website: 'http://www.jaduniv.edu.in', avg_pkg: 12.5, max_pkg: 65.0, t_fee: 2400, h_fee: 3000 },
      { name: 'Indian Institute of Technology Patna', state: 'Bihar', city: 'Patna', type: 'IIT', nirf_rank: 19, naac_grade: 'A+', website: 'https://www.iitp.ac.in', avg_pkg: 14.5, max_pkg: 55.0, t_fee: 210000, h_fee: 26000 },
      { name: 'Anna University', state: 'Tamil Nadu', city: 'Chennai', type: 'State Government', nirf_rank: 20, naac_grade: 'A++', website: 'https://www.annauniv.edu', avg_pkg: 8.5, max_pkg: 36.0, t_fee: 45000, h_fee: 35000 },
      { name: 'National Institute of Technology Calicut (NITC)', state: 'Kerala', city: 'Kozhikode', type: 'NIT', nirf_rank: 21, naac_grade: 'A+', website: 'https://www.nitc.ac.in', avg_pkg: 13.5, max_pkg: 48.0, t_fee: 140000, h_fee: 25000 },
      { name: 'Siksha O Anusandhan University (SOA)', state: 'Odisha', city: 'Bhubaneswar', type: 'Private', nirf_rank: 22, naac_grade: 'A++', website: 'https://www.soa.ac.in', avg_pkg: 7.5, max_pkg: 30.0, t_fee: 250000, h_fee: 80000 },
      { name: 'Amrita School of Engineering', state: 'Tamil Nadu', city: 'Coimbatore', type: 'Private', nirf_rank: 23, naac_grade: 'A++', website: 'https://amrita.edu', avg_pkg: 8.5, max_pkg: 38.0, t_fee: 280000, h_fee: 90000 },
      { name: 'Jamia Millia Islamia (Faculty of Engineering)', state: 'Delhi', city: 'New Delhi', type: 'State Government', nirf_rank: 24, naac_grade: 'A++', website: 'https://jmi.ac.in', avg_pkg: 10.2, max_pkg: 35.0, t_fee: 15000, h_fee: 10000 },
      { name: 'Indian Institute of Technology Gandhinagar', state: 'Gujarat', city: 'Gandhinagar', type: 'IIT', nirf_rank: 25, naac_grade: 'A++', website: 'https://iitgn.ac.in', avg_pkg: 16.0, max_pkg: 62.0, t_fee: 215000, h_fee: 30000 },
      { name: 'Indian Institute of Technology Mandi', state: 'Himachal Pradesh', city: 'Mandi', type: 'IIT', nirf_rank: 26, naac_grade: 'A', website: 'https://www.iitmandi.ac.in', avg_pkg: 15.2, max_pkg: 60.0, t_fee: 210000, h_fee: 25000 },
      { name: 'Indian Institute of Technology Jodhpur', state: 'Rajasthan', city: 'Jodhpur', type: 'IIT', nirf_rank: 27, naac_grade: 'A+', website: 'https://www.iitj.ac.in', avg_pkg: 14.8, max_pkg: 58.0, t_fee: 215000, h_fee: 29000 },
      { name: 'National Institute of Technology Warangal (NITW)', state: 'Telangana', city: 'Warangal', type: 'NIT', nirf_rank: 28, naac_grade: 'A+', website: 'https://www.nitw.ac.in', avg_pkg: 14.9, max_pkg: 52.0, t_fee: 140000, h_fee: 26000 },
      { name: 'Thapar Institute of Engineering and Technology', state: 'Punjab', city: 'Patiala', type: 'Private', nirf_rank: 29, naac_grade: 'A+', website: 'https://www.thapar.edu', avg_pkg: 10.9, max_pkg: 45.0, t_fee: 440000, h_fee: 120000 },
      { name: 'COEP Technological University', state: 'Maharashtra', city: 'Pune', type: 'State Government', nirf_rank: 30, naac_grade: 'A', website: 'https://www.coep.org.in', avg_pkg: 9.7, max_pkg: 50.5, t_fee: 135000, h_fee: 40000 },
      { name: 'Indian Institute of Technology Ropar (IITRPR)', state: 'Punjab', city: 'Rupnagar', type: 'IIT', nirf_rank: 31, naac_grade: 'A', website: 'https://www.iitrpr.ac.in', avg_pkg: 15.8, max_pkg: 65.0, t_fee: 215000, h_fee: 27000 },
      { name: 'Kalasalingam Academy of Research and Education', state: 'Tamil Nadu', city: 'Srivilliputtur', type: 'Private', nirf_rank: 32, naac_grade: 'A', website: 'https://www.kalasalingam.ac.in', avg_pkg: 5.5, max_pkg: 30.0, t_fee: 120000, h_fee: 60000 },
      { name: 'Aligarh Muslim University (AMU)', state: 'Uttar Pradesh', city: 'Aligarh', type: 'State Government', nirf_rank: 33, naac_grade: 'A+', website: 'https://www.amu.ac.in', avg_pkg: 6.5, max_pkg: 24.0, t_fee: 25000, h_fee: 12000 },
      { name: 'Koneru Lakshmaiah Education Foundation (KL University)', state: 'Andhra Pradesh', city: 'Vaddeswaram', type: 'Private', nirf_rank: 34, naac_grade: 'A++', website: 'https://www.kluniversity.in', avg_pkg: 7.2, max_pkg: 36.0, t_fee: 250000, h_fee: 85000 },
      { name: 'Kalinga Institute of Industrial Technology (KIIT)', state: 'Odisha', city: 'Bhubaneswar', type: 'Private', nirf_rank: 35, naac_grade: 'A++', website: 'https://kiit.ac.in', avg_pkg: 8.0, max_pkg: 40.0, t_fee: 350000, h_fee: 90000 },
      { name: 'Amity University Noida', state: 'Uttar Pradesh', city: 'Noida', type: 'Private', nirf_rank: 36, naac_grade: 'A+', website: 'https://www.amity.edu', avg_pkg: 7.0, max_pkg: 38.0, t_fee: 320000, h_fee: 90000 },
      { name: 'IIIT Hyderabad (IIITH)', state: 'Telangana', city: 'Hyderabad', type: 'Private', nirf_rank: 37, naac_grade: 'A++', website: 'https://www.iiit.ac.in', avg_pkg: 30.5, max_pkg: 102.0, t_fee: 400000, h_fee: 90000 },
      { name: 'Indian Institute of Technology Bhubaneswar', state: 'Odisha', city: 'Bhubaneswar', type: 'IIT', nirf_rank: 38, naac_grade: 'A', website: 'https://www.iitbbs.ac.in', avg_pkg: 14.0, max_pkg: 54.0, t_fee: 215000, h_fee: 28000 },
      { name: 'SASTRA Deemed University', state: 'Tamil Nadu', city: 'Thanjavur', type: 'Private', nirf_rank: 39, naac_grade: 'A++', website: 'https://www.sastra.edu', avg_pkg: 7.9, max_pkg: 32.0, t_fee: 170000, h_fee: 60000 },
      { name: 'Institute of Chemical Technology (ICT Mumbai)', state: 'Maharashtra', city: 'Mumbai', type: 'State Government', nirf_rank: 40, naac_grade: 'A++', website: 'https://www.ictmumbai.edu.in', avg_pkg: 9.5, max_pkg: 35.0, t_fee: 85000, h_fee: 30000 },
      { name: 'Malaviya National Institute of Technology Jaipur (MNIT)', state: 'Rajasthan', city: 'Jaipur', type: 'NIT', nirf_rank: 41, naac_grade: 'A', website: 'https://www.mnit.ac.in', avg_pkg: 11.5, max_pkg: 42.0, t_fee: 140000, h_fee: 26000 },
      { name: 'UPES Dehradun', state: 'Uttarakhand', city: 'Dehradun', type: 'Private', nirf_rank: 42, naac_grade: 'A', website: 'https://www.upes.ac.in', avg_pkg: 8.6, max_pkg: 50.0, t_fee: 380000, h_fee: 110000 },
      { name: 'Visvesvaraya National Institute of Technology Nagpur (VNIT)', state: 'Maharashtra', city: 'Nagpur', type: 'NIT', nirf_rank: 43, naac_grade: 'A', website: 'https://www.vnit.ac.in', avg_pkg: 11.2, max_pkg: 40.0, t_fee: 142000, h_fee: 28000 },
      { name: 'Saveetha Institute of Medical and Technical Sciences', state: 'Tamil Nadu', city: 'Chennai', type: 'Private', nirf_rank: 44, naac_grade: 'A++', website: 'https://saveetha.com', avg_pkg: 6.2, max_pkg: 28.0, t_fee: 250000, h_fee: 90000 },
      { name: 'Symbiosis International (Deemed University)', state: 'Maharashtra', city: 'Pune', type: 'Private', nirf_rank: 45, naac_grade: 'A++', website: 'https://www.siu.edu.in', avg_pkg: 8.9, max_pkg: 42.0, t_fee: 300000, h_fee: 110000 },
      { name: 'SSN College of Engineering', state: 'Tamil Nadu', city: 'Kalavakkam', type: 'Private', nirf_rank: 46, naac_grade: 'A+', website: 'https://www.ssn.edu.in', avg_pkg: 8.1, max_pkg: 35.0, t_fee: 130000, h_fee: 90000 },
      { name: 'Lovely Professional University (LPU)', state: 'Punjab', city: 'Phagwara', type: 'Private', nirf_rank: 47, naac_grade: 'A++', website: 'https://www.lpu.in', avg_pkg: 7.2, max_pkg: 64.0, t_fee: 240000, h_fee: 80000 },
      { name: 'National Institute of Technology Durgapur', state: 'West Bengal', city: 'Durgapur', type: 'NIT', nirf_rank: 48, naac_grade: 'A', website: 'https://www.nitdgp.ac.in', avg_pkg: 11.2, max_pkg: 38.0, t_fee: 140000, h_fee: 24000 },
      { name: 'National Institute of Technology Silchar', state: 'Assam', city: 'Silchar', type: 'NIT', nirf_rank: 49, naac_grade: 'A', website: 'https://www.nits.ac.in', avg_pkg: 11.8, max_pkg: 42.0, t_fee: 138000, h_fee: 23000 },
      { name: 'Birla Institute of Technology, Mesra', state: 'Jharkhand', city: 'Ranchi', type: 'Private', nirf_rank: 50, naac_grade: 'A', website: 'https://www.bitmesra.ac.in', avg_pkg: 11.2, max_pkg: 44.0, t_fee: 320000, h_fee: 50000 },
      { name: 'Graphic Era University', state: 'Uttarakhand', city: 'Dehradun', type: 'Private', nirf_rank: 51, naac_grade: 'A+', website: 'https://www.geu.ac.in', avg_pkg: 7.5, max_pkg: 48.0, t_fee: 280000, h_fee: 90000 },
      { name: 'National Institute of Technology Patna', state: 'Bihar', city: 'Patna', type: 'NIT', nirf_rank: 52, naac_grade: 'B++', website: 'https://www.nitp.ac.in', avg_pkg: 10.1, max_pkg: 36.0, t_fee: 138000, h_fee: 25000 },
      { name: 'IIEST Shibpur', state: 'West Bengal', city: 'Howrah', type: 'Government', nirf_rank: 53, naac_grade: 'A', website: 'https://www.iiests.ac.in', avg_pkg: 9.8, max_pkg: 39.0, t_fee: 135000, h_fee: 28000 },
      { name: 'National Institute of Technology Jalandhar', state: 'Punjab', city: 'Jalandhar', type: 'NIT', nirf_rank: 54, naac_grade: 'A', website: 'https://www.nitj.ac.in', avg_pkg: 10.8, max_pkg: 36.0, t_fee: 140000, h_fee: 25000 },
      { name: 'Indian Institute of Technology Jammu', state: 'Jammu and Kashmir', city: 'Jammu', type: 'IIT', nirf_rank: 55, naac_grade: 'A', website: 'https://www.iitjammu.ac.in', avg_pkg: 11.8, max_pkg: 40.0, t_fee: 210000, h_fee: 25000 },
      { name: 'Indian Institute of Technology Tirupati', state: 'Andhra Pradesh', city: 'Tirupati', type: 'IIT', nirf_rank: 56, naac_grade: 'A', website: 'https://www.iittp.ac.in', avg_pkg: 12.8, max_pkg: 48.0, t_fee: 210000, h_fee: 25000 },
      { name: 'Manipal University Jaipur', state: 'Rajasthan', city: 'Jaipur', type: 'Private', nirf_rank: 57, naac_grade: 'A+', website: 'https://jaipur.manipal.edu', avg_pkg: 8.5, max_pkg: 42.0, t_fee: 350000, h_fee: 120000 },
      { name: 'Manipal Institute of Technology', state: 'Karnataka', city: 'Manipal', type: 'Private', nirf_rank: 58, naac_grade: 'A++', website: 'https://manipal.edu', avg_pkg: 10.5, max_pkg: 48.0, t_fee: 420000, h_fee: 150000 },
      { name: 'Madan Mohan Malaviya University of Technology (MMMUT)', state: 'Uttar Pradesh', city: 'Gorakhpur', type: 'State Government', nirf_rank: 59, naac_grade: 'A', website: 'http://www.mmmut.ac.in', avg_pkg: 6.8, max_pkg: 28.0, t_fee: 90000, h_fee: 24000 },
      { name: 'Indian Institute of Space Science and Technology (IIST)', state: 'Kerala', city: 'Thiruvananthapuram', type: 'Government', nirf_rank: 60, naac_grade: 'A', website: 'https://www.iist.ac.in', avg_pkg: 11.0, max_pkg: 30.0, t_fee: 80000, h_fee: 24000 },
      { name: 'Delhi Technological University (DTU)', state: 'Delhi', city: 'New Delhi', type: 'State Government', nirf_rank: 61, naac_grade: 'A', website: 'https://dtu.ac.in', avg_pkg: 16.5, max_pkg: 64.0, t_fee: 248000, h_fee: 85000 },
      { name: 'National Institute of Technology Raipur', state: 'Chhattisgarh', city: 'Raipur', type: 'NIT', nirf_rank: 62, naac_grade: 'B++', website: 'https://www.nitrr.ac.in', avg_pkg: 9.8, max_pkg: 34.0, t_fee: 138000, h_fee: 22000 },
      { name: 'Indian Institute of Technology Palakkad', state: 'Kerala', city: 'Palakkad', type: 'IIT', nirf_rank: 63, naac_grade: 'A', website: 'https://iitpkd.ac.in', avg_pkg: 12.5, max_pkg: 45.0, t_fee: 210000, h_fee: 24000 },
      { name: 'National Institute of Technology Delhi', state: 'Delhi', city: 'New Delhi', type: 'NIT', nirf_rank: 64, naac_grade: 'A', website: 'http://www.nitdelhi.ac.in', avg_pkg: 14.2, max_pkg: 50.0, t_fee: 140000, h_fee: 28000 },
      { name: 'Sardar Vallabhbhai National Institute of Technology Surat (SVNIT)', state: 'Gujarat', city: 'Surat', type: 'NIT', nirf_rank: 65, naac_grade: 'A', website: 'https://www.svnit.ac.in', avg_pkg: 11.9, max_pkg: 44.0, t_fee: 142000, h_fee: 28000 },
      { name: 'PSG College of Technology', state: 'Tamil Nadu', city: 'Coimbatore', type: 'Private', nirf_rank: 66, naac_grade: 'A', website: 'https://www.psgtech.edu', avg_pkg: 9.8, max_pkg: 40.0, t_fee: 180000, h_fee: 75000 },
      { name: 'Sathyabama Institute of Science and Technology', state: 'Tamil Nadu', city: 'Chennai', type: 'Private', nirf_rank: 67, naac_grade: 'A++', website: 'https://www.sathyabama.ac.in', avg_pkg: 6.8, max_pkg: 28.0, t_fee: 200000, h_fee: 80000 },
      { name: 'IIIT Bangalore (IIITB)', state: 'Karnataka', city: 'Bengaluru', type: 'IIIT', nirf_rank: 68, naac_grade: 'A+', website: 'https://www.iiitb.ac.in', avg_pkg: 25.2, max_pkg: 78.0, t_fee: 320000, h_fee: 96000 },
      { name: 'Netaji Subhas University of Technology (NSUT)', state: 'Delhi', city: 'New Delhi', type: 'State Government', nirf_rank: 69, naac_grade: 'A', website: 'http://www.nsut.ac.in', avg_pkg: 16.0, max_pkg: 60.0, t_fee: 195000, h_fee: 36000 },
      { name: 'Banasthali Vidyapith', state: 'Rajasthan', city: 'Banasthali', type: 'Private', nirf_rank: 70, naac_grade: 'A++', website: 'http://www.banasthali.org', avg_pkg: 6.2, max_pkg: 24.0, t_fee: 150000, h_fee: 65000 },
      { name: 'Indian Institute of Technology Bhilai', state: 'Chhattisgarh', city: 'Raipur', type: 'IIT', nirf_rank: 71, naac_grade: 'A', website: 'https://www.iitbhilai.ac.in', avg_pkg: 12.0, max_pkg: 42.0, t_fee: 210000, h_fee: 24000 },
      { name: 'National Institute of Technology Srinagar', state: 'Jammu and Kashmir', city: 'Srinagar', type: 'NIT', nirf_rank: 72, naac_grade: 'B++', website: 'https://www.nitsri.ac.in', avg_pkg: 9.0, max_pkg: 28.0, t_fee: 135000, h_fee: 24000 },
      { name: 'University of Hyderabad', state: 'Telangana', city: 'Hyderabad', type: 'Government', nirf_rank: 73, naac_grade: 'A++', website: 'https://www.uohyd.ac.in', avg_pkg: 8.5, max_pkg: 25.0, t_fee: 30000, h_fee: 10000 },
      { name: 'M. S. Ramaiah Institute of Technology', state: 'Karnataka', city: 'Bengaluru', type: 'Private', nirf_rank: 74, naac_grade: 'A+', website: 'https://www.msrit.edu', avg_pkg: 9.2, max_pkg: 46.0, t_fee: 230000, h_fee: 110000 },
      { name: 'Indian Institute of Technology Dharwad', state: 'Karnataka', city: 'Dharwad', type: 'IIT', nirf_rank: 75, naac_grade: 'A', website: 'https://www.iitdh.ac.in', avg_pkg: 11.5, max_pkg: 38.0, t_fee: 210000, h_fee: 24000 },
      { name: 'Rajiv Gandhi Institute of Petroleum Technology', state: 'Uttar Pradesh', city: 'Jais', type: 'Government', nirf_rank: 76, naac_grade: 'A', website: 'https://www.rgipt.ac.in', avg_pkg: 10.2, max_pkg: 24.0, t_fee: 260000, h_fee: 40000 },
      { name: 'Sant Longowal Institute of Engineering & Technology', state: 'Punjab', city: 'Longowal', type: 'Government', nirf_rank: 77, naac_grade: 'A', website: 'http://sliet.ac.in', avg_pkg: 5.5, max_pkg: 20.0, t_fee: 80000, h_fee: 20000 },
      { name: 'Vignan\'s Foundation for Science, Technology and Research', state: 'Andhra Pradesh', city: 'Guntur', type: 'Private', nirf_rank: 78, naac_grade: 'A++', website: 'https://vignan.ac.in', avg_pkg: 7.2, max_pkg: 30.0, t_fee: 220000, h_fee: 90000 },
      { name: 'MANIT Bhopal', state: 'Madhya Pradesh', city: 'Bhopal', type: 'NIT', nirf_rank: 79, naac_grade: 'A', website: 'http://www.manit.ac.in', avg_pkg: 11.8, max_pkg: 52.0, t_fee: 135000, h_fee: 28000 },
      { name: 'National Institute of Technology Jamshedpur', state: 'Jharkhand', city: 'Jamshedpur', type: 'NIT', nirf_rank: 80, naac_grade: 'A', website: 'https://www.nitjsr.ac.in', avg_pkg: 11.5, max_pkg: 45.0, t_fee: 138000, h_fee: 25000 },
      { name: 'National Institute of Technology Meghalaya', state: 'Meghalaya', city: 'Shillong', type: 'NIT', nirf_rank: 81, naac_grade: 'A', website: 'http://nitmeghalaya.in', avg_pkg: 9.2, max_pkg: 30.0, t_fee: 135000, h_fee: 22000 },
      { name: 'Jain University', state: 'Karnataka', city: 'Bengaluru', type: 'Private', nirf_rank: 82, naac_grade: 'A++', website: 'https://www.jainuniversity.ac.in', avg_pkg: 6.8, max_pkg: 32.0, t_fee: 220000, h_fee: 110000 },
      { name: 'Shri Ramdeobaba College of Engineering and Management', state: 'Maharashtra', city: 'Nagpur', type: 'Private', nirf_rank: 83, naac_grade: 'A++', website: 'https://www.rknec.edu', avg_pkg: 7.5, max_pkg: 36.0, t_fee: 150000, h_fee: 80000 },
      { name: 'National Institute of Technology Kurukshetra', state: 'Haryana', city: 'Kurukshetra', type: 'NIT', nirf_rank: 84, naac_grade: 'A', website: 'https://www.nitkkr.ac.in', avg_pkg: 12.0, max_pkg: 44.0, t_fee: 140000, h_fee: 25000 },
      { name: 'Shri Guru Gobind Singhji Institute of Engineering and Technology', state: 'Maharashtra', city: 'Nanded', type: 'State Government', nirf_rank: 85, naac_grade: 'A', website: 'https://www.sgsits.ac.in', avg_pkg: 6.2, max_pkg: 22.0, t_fee: 80000, h_fee: 30000 },
      { name: 'Sri Ramakrishna Engineering College', state: 'Tamil Nadu', city: 'Coimbatore', type: 'Private', nirf_rank: 86, naac_grade: 'A+', website: 'https://www.srec.ac.in', avg_pkg: 5.2, max_pkg: 24.0, t_fee: 100000, h_fee: 55000 },
      { name: 'Savitribai Phule Pune University (SPPU)', state: 'Maharashtra', city: 'Pune', type: 'State Government', nirf_rank: 87, naac_grade: 'A++', website: 'http://www.unipune.ac.in', avg_pkg: 7.2, max_pkg: 28.0, t_fee: 40000, h_fee: 15000 },
      { name: 'Defence Institute of Advanced Technology (DIAT)', state: 'Maharashtra', city: 'Pune', type: 'Government', nirf_rank: 88, naac_grade: 'A', website: 'https://www.diat.ac.in', avg_pkg: 9.5, max_pkg: 25.0, t_fee: 110000, h_fee: 40000 },
      { name: 'Panjab University', state: 'Chandigarh', city: 'Chandigarh', type: 'State Government', nirf_rank: 89, naac_grade: 'A++', website: 'https://puchd.ac.in', avg_pkg: 7.5, max_pkg: 30.0, t_fee: 75000, h_fee: 25000 },
      { name: 'C.V. Raman Global University', state: 'Odisha', city: 'Bhubaneswar', type: 'Private', nirf_rank: 90, naac_grade: 'A++', website: 'https://cgu-odisha.ac.in', avg_pkg: 7.5, max_pkg: 30.0, t_fee: 175000, h_fee: 45000 },
      { name: 'ABV-IIITM Gwalior', state: 'Madhya Pradesh', city: 'Gwalior', type: 'IIIT', nirf_rank: 91, naac_grade: 'A', website: 'https://www.iiitm.ac.in', avg_pkg: 16.8, max_pkg: 59.0, t_fee: 175000, h_fee: 34000 },
      { name: 'National Institute of Technology Hamirpur', state: 'Himachal Pradesh', city: 'Hamirpur', type: 'NIT', nirf_rank: 92, naac_grade: 'A', website: 'https://www.nith.ac.in', avg_pkg: 10.2, max_pkg: 35.0, t_fee: 138000, h_fee: 24000 },
      { name: 'Pandit Deendayal Energy University (PDEU)', state: 'Gujarat', city: 'Gandhinagar', type: 'Private', nirf_rank: 93, naac_grade: 'A', website: 'https://www.pdpu.ac.in', avg_pkg: 7.2, max_pkg: 28.0, t_fee: 240000, h_fee: 90000 },
      { name: 'National Institute of Technology Puducherry', state: 'Puducherry', city: 'Karaikal', type: 'NIT', nirf_rank: 94, naac_grade: 'B++', website: 'http://www.nitpy.ac.in', avg_pkg: 8.8, max_pkg: 26.0, t_fee: 135000, h_fee: 23000 },
      { name: 'Sri Krishna College of Engineering and Technology', state: 'Tamil Nadu', city: 'Coimbatore', type: 'Private', nirf_rank: 95, naac_grade: 'A', website: 'https://www.skcet.ac.in', avg_pkg: 6.5, max_pkg: 32.0, t_fee: 150000, h_fee: 70000 },
      { name: 'National Institute of Technology Agartala', state: 'Tripura', city: 'Agartala', type: 'NIT', nirf_rank: 96, naac_grade: 'A', website: 'https://www.nita.ac.in', avg_pkg: 9.5, max_pkg: 32.0, t_fee: 135000, h_fee: 22000 },
      { name: 'National Institute of Technology Goa', state: 'Goa', city: 'Ponda', type: 'NIT', nirf_rank: 97, naac_grade: 'A', website: 'https://www.nitgoa.ac.in', avg_pkg: 11.2, max_pkg: 38.0, t_fee: 140000, h_fee: 26000 },
      { name: 'National Institute of Technology Uttarakhand', state: 'Uttarakhand', city: 'Srinagar', type: 'NIT', nirf_rank: 98, naac_grade: 'B++', website: 'http://www.nituk.ac.in', avg_pkg: 8.5, max_pkg: 26.0, t_fee: 132000, h_fee: 22000 },
      { name: 'IIIT Gwalior', state: 'Madhya Pradesh', city: 'Gwalior', type: 'IIIT', nirf_rank: 99, naac_grade: 'A', website: 'https://www.iiitm.ac.in', avg_pkg: 16.5, max_pkg: 52.0, t_fee: 170000, h_fee: 32000 },
      { name: 'IIIT Allahabad (IIITA)', state: 'Uttar Pradesh', city: 'Prayagraj', type: 'IIIT', nirf_rank: 100, naac_grade: 'A', website: 'https://www.iiita.ac.in', avg_pkg: 20.8, max_pkg: 82.0, t_fee: 180000, h_fee: 38000 },

      // NIRF Rank 101 to 200 sequentially
      { name: 'Amity University Haryana', state: 'Haryana', city: 'Gurugram', type: 'Private', nirf_rank: 101, naac_grade: 'A+', website: 'https://www.amity.edu/gurugram', avg_pkg: 6.2, max_pkg: 32.0, t_fee: 220000, h_fee: 80000 },
      { name: 'Anurag University', state: 'Telangana', city: 'Hyderabad', type: 'Private', nirf_rank: 102, naac_grade: 'A', website: 'https://anurag.edu.in', avg_pkg: 5.8, max_pkg: 30.0, t_fee: 125000, h_fee: 75000 },
      { name: 'Vishwakarma Institute of Technology', state: 'Maharashtra', city: 'Pune', type: 'Private', nirf_rank: 103, naac_grade: 'A++', website: 'https://www.vit.edu', avg_pkg: 6.8, max_pkg: 38.0, t_fee: 180000, h_fee: 80000 },
      { name: 'Chandigarh Engineering College-CGC', state: 'Punjab', city: 'Landran', type: 'Private', nirf_rank: 104, naac_grade: 'B++', website: 'https://www.cgc.edu.in', avg_pkg: 5.2, max_pkg: 28.0, t_fee: 95000, h_fee: 65000 },
      { name: 'Chennai Institute of Technology', state: 'Tamil Nadu', city: 'Chennai', type: 'Private', nirf_rank: 105, naac_grade: 'A+', website: 'https://www.citchennai.edu.in', avg_pkg: 6.9, max_pkg: 36.0, t_fee: 200000, h_fee: 90000 },
      { name: 'Coimbatore Institute of Technology', state: 'Tamil Nadu', city: 'Coimbatore', type: 'Private', nirf_rank: 106, naac_grade: 'A', website: 'https://www.cit.edu.in', avg_pkg: 6.5, max_pkg: 32.0, t_fee: 40000, h_fee: 45000 },
      { name: 'College of Engineering Trivandrum', state: 'Kerala', city: 'Thiruvananthapuram', type: 'Government', nirf_rank: 107, naac_grade: 'A', website: 'https://www.cet.ac.in', avg_pkg: 7.2, max_pkg: 36.0, t_fee: 25000, h_fee: 20000 },
      { name: 'Dr. Vishwanath Karad MIT World Peace University', state: 'Maharashtra', city: 'Pune', type: 'Private', nirf_rank: 108, naac_grade: 'A', website: 'https://mitwpu.edu.in', avg_pkg: 7.0, max_pkg: 44.0, t_fee: 310000, h_fee: 120000 },
      { name: 'Easwari Engineering College', state: 'Tamil Nadu', city: 'Chennai', type: 'Private', nirf_rank: 109, naac_grade: 'A+', website: 'https://srmeaswari.ac.in', avg_pkg: 5.8, max_pkg: 28.0, t_fee: 150000, h_fee: 80000 },
      { name: 'Galgotias University', state: 'Uttar Pradesh', city: 'Greater Noida', type: 'Private', nirf_rank: 110, naac_grade: 'A+', website: 'https://www.galgotiasuniversity.edu.in', avg_pkg: 5.5, max_pkg: 35.0, t_fee: 150000, h_fee: 85000 },
      { name: 'GITAM University', state: 'Andhra Pradesh', city: 'Visakhapatnam', type: 'Private', nirf_rank: 111, naac_grade: 'A+', website: 'https://www.gitam.edu', avg_pkg: 6.5, max_pkg: 32.0, t_fee: 290000, h_fee: 95000 },
      { name: 'Gokaraju Rangaraju Institute of Engineering & Technology', state: 'Telangana', city: 'Hyderabad', type: 'Private', nirf_rank: 112, naac_grade: 'A++', website: 'https://www.griet.ac.in', avg_pkg: 6.0, max_pkg: 34.0, t_fee: 120000, h_fee: 75000 },
      { name: 'Hindustan Institute of Technology and Science', state: 'Tamil Nadu', city: 'Chennai', type: 'Private', nirf_rank: 113, naac_grade: 'A', website: 'https://hindustanuniv.ac.in', avg_pkg: 5.5, max_pkg: 28.0, t_fee: 230000, h_fee: 90000 },
      { name: 'Jaypee Institute of Information Technology', state: 'Uttar Pradesh', city: 'Noida', type: 'Private', nirf_rank: 114, naac_grade: 'A', website: 'https://www.jiit.ac.in', avg_pkg: 8.2, max_pkg: 48.0, t_fee: 240000, h_fee: 90000 },
      { name: 'Kongu Engineering College', state: 'Tamil Nadu', city: 'Perundurai', type: 'Private', nirf_rank: 115, naac_grade: 'A', website: 'https://www.kongu.ac.in', avg_pkg: 4.8, max_pkg: 22.0, t_fee: 80000, h_fee: 50000 },
      { name: 'KPR Institute of Engineering and Technology', state: 'Tamil Nadu', city: 'Coimbatore', type: 'Private', nirf_rank: 116, naac_grade: 'A', website: 'https://www.kpriet.ac.in', avg_pkg: 5.0, max_pkg: 24.0, t_fee: 120000, h_fee: 60000 },
      { name: 'Mahindra University', state: 'Telangana', city: 'Hyderabad', type: 'Private', nirf_rank: 117, naac_grade: 'A', website: 'https://www.mahindrauniversity.edu.in', avg_pkg: 9.0, max_pkg: 45.0, t_fee: 400000, h_fee: 120000 },
      { name: 'Manav Rachna International Institute of Research & Studies', state: 'Haryana', city: 'Faridabad', type: 'Private', nirf_rank: 118, naac_grade: 'A', website: 'https://manavrachna.edu.in', avg_pkg: 5.2, max_pkg: 30.0, t_fee: 180000, h_fee: 80000 },
      { name: 'Noida Institute of Engineering & Technology', state: 'Uttar Pradesh', city: 'Greater Noida', type: 'Private', nirf_rank: 119, naac_grade: 'A', website: 'https://www.niet.co.in', avg_pkg: 5.0, max_pkg: 30.0, t_fee: 130000, h_fee: 75000 },
      { name: 'G.L. Bajaj Institute of Technology and Management', state: 'Uttar Pradesh', city: 'Greater Noida', type: 'Private', nirf_rank: 120, naac_grade: 'A', website: 'https://www.glbitm.org', avg_pkg: 5.5, max_pkg: 32.0, t_fee: 115000, h_fee: 75000 },
      { name: 'KIET Group of Institutions', state: 'Uttar Pradesh', city: 'Ghaziabad', type: 'Private', nirf_rank: 121, naac_grade: 'A', website: 'https://www.kiet.edu', avg_pkg: 5.8, max_pkg: 34.0, t_fee: 125000, h_fee: 75000 },
      { name: 'KLE Technological University', state: 'Karnataka', city: 'Dharwad', type: 'Private', nirf_rank: 122, naac_grade: 'A', website: 'https://www.kletech.ac.in', avg_pkg: 6.2, max_pkg: 32.0, t_fee: 220000, h_fee: 90000 },
      { name: 'Kumaraguru College of Technology', state: 'Tamil Nadu', city: 'Coimbatore', type: 'Private', nirf_rank: 123, naac_grade: 'A', website: 'https://www.kct.ac.in', avg_pkg: 6.0, max_pkg: 30.0, t_fee: 150000, h_fee: 80000 },
      { name: 'CVR College of Engineering', state: 'Telangana', city: 'Ibrahimpatan', type: 'Private', nirf_rank: 124, naac_grade: 'A', website: 'https://cvr.ac.in', avg_pkg: 6.0, max_pkg: 32.0, t_fee: 115000, h_fee: 70000 },
      { name: 'Dayalbagh Educational Institute', state: 'Uttar Pradesh', city: 'Agra', type: 'Private', nirf_rank: 125, naac_grade: 'A', website: 'https://www.dei.ac.in', avg_pkg: 5.2, max_pkg: 18.0, t_fee: 15000, h_fee: 10000 },
      { name: 'Dr. D. Y. Patil Institute of Technology', state: 'Maharashtra', city: 'Pune', type: 'Private', nirf_rank: 126, naac_grade: 'A', website: 'https://engg.dypvp.edu.in', avg_pkg: 5.2, max_pkg: 28.0, t_fee: 110000, h_fee: 75000 },
      { name: 'G. H. Raisoni College of Engineering', state: 'Maharashtra', city: 'Nagpur', type: 'Private', nirf_rank: 127, naac_grade: 'A', website: 'https://ghrce.raisoni.net', avg_pkg: 5.0, max_pkg: 26.0, t_fee: 130000, h_fee: 70000 },
      { name: 'G. L. A. University', state: 'Uttar Pradesh', city: 'Mathura', type: 'Private', nirf_rank: 128, naac_grade: 'A', website: 'https://www.gla.ac.in', avg_pkg: 6.2, max_pkg: 32.0, t_fee: 160000, h_fee: 80000 },
      { name: 'Institute of Aeronautical Engineering', state: 'Telangana', city: 'Hyderabad', type: 'Private', nirf_rank: 129, naac_grade: 'A', website: 'https://www.iare.ac.in', avg_pkg: 5.5, max_pkg: 28.0, t_fee: 90000, h_fee: 65000 },
      { name: 'Institute of Engineering & Management', state: 'West Bengal', city: 'Kolkata', type: 'Private', nirf_rank: 130, naac_grade: 'A', website: 'https://iem.edu.in', avg_pkg: 6.0, max_pkg: 36.0, t_fee: 170000, h_fee: 90000 },
      { name: 'J. C. Bose University of Science and Technology, YMCA', state: 'Haryana', city: 'Faridabad', type: 'State Government', nirf_rank: 131, naac_grade: 'A', website: 'https://www.ymcaust.ac.in', avg_pkg: 6.8, max_pkg: 32.0, t_fee: 80000, h_fee: 30000 },
      { name: 'New Horizon College of Engineering', state: 'Karnataka', city: 'Bengaluru', type: 'Private', nirf_rank: 132, naac_grade: 'A+', website: 'https://newhorizonindia.edu', avg_pkg: 6.5, max_pkg: 28.0, t_fee: 250000, h_fee: 100000 },
      { name: 'Sona College of Technology', state: 'Tamil Nadu', city: 'Salem', type: 'Private', nirf_rank: 133, naac_grade: 'A', website: 'https://www.sonatech.ac.in', avg_pkg: 4.8, max_pkg: 20.0, t_fee: 90000, h_fee: 55000 },
      { name: 'Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology', state: 'Tamil Nadu', city: 'Chennai', type: 'Private', nirf_rank: 134, naac_grade: 'A++', website: 'https://www.veltech.edu.in', avg_pkg: 5.5, max_pkg: 30.0, t_fee: 180000, h_fee: 85000 },
      { name: 'B. S. Abdur Rahman Crescent Institute of Science and Technology', state: 'Tamil Nadu', city: 'Chennai', type: 'Private', nirf_rank: 135, naac_grade: 'A+', website: 'https://crescent.education', avg_pkg: 5.2, max_pkg: 28.0, t_fee: 175000, h_fee: 80000 },
      { name: 'CMR Institute of Technology', state: 'Karnataka', city: 'Bengaluru', type: 'Private', nirf_rank: 136, naac_grade: 'A+', website: 'https://www.cmrit.ac.in', avg_pkg: 6.3, max_pkg: 26.0, t_fee: 220000, h_fee: 95000 },
      { name: 'Kakatiya Institute of Technology & Science', state: 'Telangana', city: 'Warangal', type: 'Private', nirf_rank: 137, naac_grade: 'A', website: 'https://www.kitsw.ac.in', avg_pkg: 5.5, max_pkg: 28.0, t_fee: 125000, h_fee: 70000 },
      { name: 'Mahatma Gandhi Institute of Technology', state: 'Telangana', city: 'Hyderabad', type: 'Private', nirf_rank: 138, naac_grade: 'A', website: 'https://www.mgit.ac.in', avg_pkg: 5.5, max_pkg: 26.0, t_fee: 100000, h_fee: 70000 },
      { name: 'MVSR Engineering College', state: 'Telangana', city: 'Hyderabad', type: 'Private', nirf_rank: 139, naac_grade: 'A', website: 'https://www.mvsrec.edu.in', avg_pkg: 5.2, max_pkg: 25.0, t_fee: 110000, h_fee: 65000 },
      { name: 'GMR Institute of Technology', state: 'Andhra Pradesh', city: 'Rajam', type: 'Private', nirf_rank: 140, naac_grade: 'A', website: 'https://www.gmrit.org', avg_pkg: 5.0, max_pkg: 24.0, t_fee: 80000, h_fee: 50000 },
      { name: 'Gayatri Vidya Parishad College of Engineering', state: 'Andhra Pradesh', city: 'Visakhapatnam', type: 'Private', nirf_rank: 141, naac_grade: 'A', website: 'https://www.gvpce.ac.in', avg_pkg: 5.8, max_pkg: 30.0, t_fee: 105000, h_fee: 60000 },
      { name: 'Vignan\'s Institute of Information Technology', state: 'Andhra Pradesh', city: 'Visakhapatnam', type: 'Private', nirf_rank: 142, naac_grade: 'A', website: 'https://vignaniit.edu.in', avg_pkg: 5.2, max_pkg: 26.0, t_fee: 95000, h_fee: 55000 },
      { name: 'Prasad V. Potluri Siddhartha Institute of Technology', state: 'Andhra Pradesh', city: 'Vijayawada', type: 'Private', nirf_rank: 143, naac_grade: 'A+', website: 'https://www.pvpsiddhartha.ac.in', avg_pkg: 5.0, max_pkg: 22.0, t_fee: 70000, h_fee: 50000 },
      { name: 'Velagapudi Ramakrishna Siddhartha Engineering College', state: 'Andhra Pradesh', city: 'Vijayawada', type: 'Private', nirf_rank: 144, naac_grade: 'A+', website: 'https://www.vrseccom.edu', avg_pkg: 5.8, max_pkg: 28.0, t_fee: 110000, h_fee: 60000 },
      { name: 'Sree Vidyanikethan Engineering College', state: 'Andhra Pradesh', city: 'Tirupati', type: 'Private', nirf_rank: 145, naac_grade: 'A+', website: 'https://svec.education', avg_pkg: 5.2, max_pkg: 25.0, t_fee: 95000, h_fee: 55000 },
      { name: 'Madanapalle Institute of Technology & Science', state: 'Andhra Pradesh', city: 'Madanapalle', type: 'Private', nirf_rank: 146, naac_grade: 'A+', website: 'https://www.mits.ac.in', avg_pkg: 5.2, max_pkg: 24.0, t_fee: 85000, h_fee: 50000 },
      { name: 'Rajiv Gandhi Memorial College of Engineering and Technology', state: 'Andhra Pradesh', city: 'Nandyal', type: 'Private', nirf_rank: 147, naac_grade: 'A', website: 'https://www.rgmcet.edu.in', avg_pkg: 4.8, max_pkg: 22.0, t_fee: 75000, h_fee: 45000 },
      { name: 'SR University', state: 'Telangana', city: 'Warangal', type: 'Private', nirf_rank: 148, naac_grade: 'A', website: 'https://sru.edu.in', avg_pkg: 5.8, max_pkg: 28.0, t_fee: 130000, h_fee: 70000 },
      { name: 'Yeshwantrao Chavan College of Engineering', state: 'Maharashtra', city: 'Nagpur', type: 'Private', nirf_rank: 149, naac_grade: 'A', website: 'https://www.ycce.edu', avg_pkg: 5.2, max_pkg: 26.0, t_fee: 140000, h_fee: 75000 },
      { name: 'G. H. Patel College of Engineering & Technology', state: 'Gujarat', city: 'Vallabh Vidyanagar', type: 'Private', nirf_rank: 150, naac_grade: 'A', website: 'https://www.gcet.ac.in', avg_pkg: 5.0, max_pkg: 24.0, t_fee: 115000, h_fee: 60000 },
      { name: 'Dharmsinh Desai University', state: 'Gujarat', city: 'Nadiad', type: 'Private', nirf_rank: 151, naac_grade: 'A', website: 'https://www.ddu.ac.in', avg_pkg: 6.2, max_pkg: 30.0, t_fee: 160000, h_fee: 65000 },
      { name: 'L.D. College of Engineering', state: 'Gujarat', city: 'Ahmedabad', type: 'Government', nirf_rank: 152, naac_grade: 'A', website: 'https://ldce.ac.in', avg_pkg: 6.0, max_pkg: 28.0, t_fee: 2500, h_fee: 15000 },
      { name: 'Vishwakarma Government Engineering College', state: 'Gujarat', city: 'Ahmedabad', type: 'Government', nirf_rank: 153, naac_grade: 'A', website: 'https://www.vgecg.ac.in', avg_pkg: 5.2, max_pkg: 22.0, t_fee: 2500, h_fee: 15000 },
      { name: 'Birbhum Institute of Technology', state: 'West Bengal', city: 'Birbhum', type: 'Private', nirf_rank: 154, naac_grade: 'B', website: 'http://www.bitbirbhum.ac.in', avg_pkg: 3.8, max_pkg: 15.0, t_fee: 70000, h_fee: 40000 },
      { name: 'Haldia Institute of Technology', state: 'West Bengal', city: 'Haldia', type: 'Private', nirf_rank: 155, naac_grade: 'A', website: 'https://hithaldia.org', avg_pkg: 5.2, max_pkg: 25.0, t_fee: 110000, h_fee: 50000 },
      { name: 'Heritage Institute of Technology', state: 'West Bengal', city: 'Kolkata', type: 'Private', nirf_rank: 156, naac_grade: 'A', website: 'https://www.heritageit.edu', avg_pkg: 5.8, max_pkg: 30.0, t_fee: 110000, h_fee: 65000 },
      { name: 'Kalyani Government Engineering College', state: 'West Bengal', city: 'Kalyani', type: 'Government', nirf_rank: 157, naac_grade: 'A', website: 'https://www.kgec.edu.in', avg_pkg: 6.5, max_pkg: 28.0, t_fee: 12000, h_fee: 15000 },
      { name: 'Government College of Engineering and Ceramic Technology', state: 'West Bengal', city: 'Kolkata', type: 'Government', nirf_rank: 158, naac_grade: 'A', website: 'https://gcect.ac.in', avg_pkg: 5.8, max_pkg: 24.0, t_fee: 14000, h_fee: 18000 },
      { name: 'Jalpaiguri Government Engineering College', state: 'West Bengal', city: 'Jalpaiguri', type: 'Government', nirf_rank: 159, naac_grade: 'A', website: 'https://jgec.ac.in', avg_pkg: 5.5, max_pkg: 22.0, t_fee: 12000, h_fee: 15000 },
      { name: 'Netaji Subhash Engineering College', state: 'West Bengal', city: 'Kolkata', type: 'Private', nirf_rank: 160, naac_grade: 'A', website: 'https://www.nsec.ac.in', avg_pkg: 5.0, max_pkg: 22.0, t_fee: 110000, h_fee: 55000 },
      { name: 'RCC Institute of Information Technology', state: 'West Bengal', city: 'Kolkata', type: 'Private', nirf_rank: 161, naac_grade: 'B++', website: 'https://rcciit.org', avg_pkg: 4.8, max_pkg: 20.0, t_fee: 100000, h_fee: 50000 },
      { name: 'Techno Main Salt Lake', state: 'West Bengal', city: 'Kolkata', type: 'Private', nirf_rank: 162, naac_grade: 'A', website: 'https://technoindiauniversity.ac.in', avg_pkg: 5.2, max_pkg: 25.0, t_fee: 110000, h_fee: 60000 },
      { name: 'Silicon Institute of Technology', state: 'Odisha', city: 'Bhubaneswar', type: 'Private', nirf_rank: 163, naac_grade: 'A', website: 'https://www.silicon.ac.in', avg_pkg: 5.8, max_pkg: 30.0, t_fee: 140000, h_fee: 65000 },
      { name: 'NIST University', state: 'Odisha', city: 'Berhampur', type: 'Private', nirf_rank: 164, naac_grade: 'A', website: 'https://www.nist.edu', avg_pkg: 5.0, max_pkg: 22.0, t_fee: 110000, h_fee: 50000 },
      { name: 'Government College of Engineering', state: 'Odisha', city: 'Keonjhar', type: 'Government', nirf_rank: 165, naac_grade: 'B', website: 'https://gcekjr.ac.in', avg_pkg: 4.2, max_pkg: 18.0, t_fee: 35000, h_fee: 20000 },
      { name: 'Veer Surendra Sai University of Technology', state: 'Odisha', city: 'Burla', type: 'Government', nirf_rank: 166, naac_grade: 'A', website: 'https://www.vssut.ac.in', avg_pkg: 6.0, max_pkg: 28.0, t_fee: 45000, h_fee: 25000 },
      { name: 'Indira Gandhi Institute of Technology', state: 'Odisha', city: 'Sarang', type: 'Government', nirf_rank: 167, naac_grade: 'A', website: 'https://www.igit-sarang.ac.in', avg_pkg: 5.2, max_pkg: 22.0, t_fee: 35000, h_fee: 22000 },
      { name: 'Ajay Kumar Garg Engineering College', state: 'Uttar Pradesh', city: 'Ghaziabad', type: 'Private', nirf_rank: 168, naac_grade: 'A', website: 'https://www.akgec.ac.in', avg_pkg: 5.5, max_pkg: 32.0, t_fee: 125000, h_fee: 75000 },
      { name: 'JSS Academy of Technical Education', state: 'Uttar Pradesh', city: 'Noida', type: 'Private', nirf_rank: 169, naac_grade: 'A', website: 'https://jssaten.ac.in', avg_pkg: 5.8, max_pkg: 30.0, t_fee: 130000, h_fee: 80000 },
      { name: 'IMS Engineering College', state: 'Uttar Pradesh', city: 'Ghaziabad', type: 'Private', nirf_rank: 170, naac_grade: 'A', website: 'https://imsec.ac.in', avg_pkg: 4.8, max_pkg: 22.0, t_fee: 120000, h_fee: 70000 },
      { name: 'ABES Engineering College', state: 'Uttar Pradesh', city: 'Ghaziabad', type: 'Private', nirf_rank: 171, naac_grade: 'B++', website: 'https://www.abes.ac.in', avg_pkg: 5.2, max_pkg: 28.0, t_fee: 130000, h_fee: 75000 },
      { name: 'Kamla Nehru Institute of Technology', state: 'Uttar Pradesh', city: 'Sultanpur', type: 'Government', nirf_rank: 172, naac_grade: 'A', website: 'https://knit.ac.in', avg_pkg: 6.2, max_pkg: 28.0, t_fee: 65000, h_fee: 24000 },
      { name: 'Bundelkhand Institute of Engineering & Technology', state: 'Uttar Pradesh', city: 'Jhansi', type: 'Government', nirf_rank: 173, naac_grade: 'A', website: 'https://bietjhs.ac.in', avg_pkg: 5.8, max_pkg: 24.0, t_fee: 60000, h_fee: 22000 },
      { name: 'Dr. Ambedkar Institute of Technology for Handicapped', state: 'Uttar Pradesh', city: 'Kanpur', type: 'Government', nirf_rank: 174, naac_grade: 'A', website: 'https://aith.ac.in', avg_pkg: 5.0, max_pkg: 22.0, t_fee: 65000, h_fee: 20000 },
      { name: 'G. B. Pant University of Agriculture and Technology', state: 'Uttarakhand', city: 'Pantnagar', type: 'Government', nirf_rank: 175, naac_grade: 'A', website: 'https://gbpuat.ac.in', avg_pkg: 5.5, max_pkg: 20.0, t_fee: 45000, h_fee: 25000 },
      { name: 'Shri Mata Vaishno Devi University', state: 'Jammu and Kashmir', city: 'Katra', type: 'Government', nirf_rank: 176, naac_grade: 'A', website: 'https://www.smvdu.ac.in', avg_pkg: 5.2, max_pkg: 24.0, t_fee: 180000, h_fee: 45000 },
      { name: 'Guru Nanak Dev Engineering College', state: 'Punjab', city: 'Ludhiana', type: 'Government', nirf_rank: 177, naac_grade: 'A', website: 'https://gndec.ac.in', avg_pkg: 5.5, max_pkg: 25.0, t_fee: 85000, h_fee: 25000 },
      { name: 'DAV Institute of Engineering and Technology', state: 'Punjab', city: 'Jalandhar', type: 'Private', nirf_rank: 178, naac_grade: 'A', website: 'https://www.davietjal.org', avg_pkg: 5.0, max_pkg: 22.0, t_fee: 110000, h_fee: 60000 },
      { name: 'Baba Banda Singh Bahadur Engineering College', state: 'Punjab', city: 'Fatehgarh Sahib', type: 'Private', nirf_rank: 179, naac_grade: 'B', website: 'https://bbsbec.ac.in', avg_pkg: 4.5, max_pkg: 18.0, t_fee: 90000, h_fee: 45000 },
      { name: 'Chandigarh University', state: 'Punjab', city: 'Mohali', type: 'Private', nirf_rank: 180, naac_grade: 'A++', website: 'https://www.cuchd.in', avg_pkg: 7.5, max_pkg: 52.0, t_fee: 220000, h_fee: 90000 },
      { name: 'Chitkara University', state: 'Punjab', city: 'Rajpura', type: 'Private', nirf_rank: 181, naac_grade: 'A+', website: 'https://www.chitkara.edu.in', avg_pkg: 6.8, max_pkg: 40.0, t_fee: 200000, h_fee: 85000 },
      { name: 'Lovely Professional University (Deemed)', state: 'Punjab', city: 'Phagwara', type: 'Private', nirf_rank: 182, naac_grade: 'A++', website: 'https://www.lpu.in', avg_pkg: 7.0, max_pkg: 64.0, t_fee: 240000, h_fee: 80000 },
      { name: 'The NorthCap University', state: 'Haryana', city: 'Gurugram', type: 'Private', nirf_rank: 183, naac_grade: 'A', website: 'https://www.ncuindia.edu', avg_pkg: 6.5, max_pkg: 32.0, t_fee: 280000, h_fee: 90000 },
      { name: 'ITM University', state: 'Madhya Pradesh', city: 'Gwalior', type: 'Private', nirf_rank: 184, naac_grade: 'A', website: 'https://itmuniversity.ac.in', avg_pkg: 5.2, max_pkg: 28.0, t_fee: 115000, h_fee: 65000 },
      { name: 'Oriental Institute of Science and Technology', state: 'Madhya Pradesh', city: 'Bhopal', type: 'Private', nirf_rank: 185, naac_grade: 'B', website: 'https://oistbpl.com', avg_pkg: 4.8, max_pkg: 22.0, t_fee: 90000, h_fee: 45000 },
      { name: 'Lakshmi Narain College of Technology', state: 'Madhya Pradesh', city: 'Bhopal', type: 'Private', nirf_rank: 186, naac_grade: 'B', website: 'https://lnct.ac.in', avg_pkg: 5.0, max_pkg: 25.0, t_fee: 105000, h_fee: 50000 },
      { name: 'Jabalpur Engineering College', state: 'Madhya Pradesh', city: 'Jabalpur', type: 'Government', nirf_rank: 187, naac_grade: 'A', website: 'https://www.jecjabalpur.ac.in', avg_pkg: 5.8, max_pkg: 24.0, t_fee: 25000, h_fee: 15000 },
      { name: 'Madhav Institute of Technology and Science', state: 'Madhya Pradesh', city: 'Gwalior', type: 'Government', nirf_rank: 188, naac_grade: 'A', website: 'https://mitsgwalior.in', avg_pkg: 5.5, max_pkg: 26.0, t_fee: 85000, h_fee: 30000 },
      { name: 'Shri Govindram Seksaria Institute of Technology and Science', state: 'Madhya Pradesh', city: 'Indore', type: 'Government', nirf_rank: 189, naac_grade: 'A+', website: 'https://www.sgsits.ac.in', avg_pkg: 7.2, max_pkg: 38.0, t_fee: 95000, h_fee: 35000 },
      { name: 'College of Technology and Engineering', state: 'Rajasthan', city: 'Udaipur', type: 'Government', nirf_rank: 190, naac_grade: 'A', website: 'https://www.ctae.ac.in', avg_pkg: 5.8, max_pkg: 22.0, t_fee: 60000, h_fee: 20000 },
      { name: 'MBM University Jodhpur', state: 'Rajasthan', city: 'Jodhpur', type: 'Government', nirf_rank: 191, naac_grade: 'A', website: 'https://mbm.ac.in', avg_pkg: 6.2, max_pkg: 28.0, t_fee: 50000, h_fee: 22000 },
      { name: 'Government Engineering College Ajmer', state: 'Rajasthan', city: 'Ajmer', type: 'Government', nirf_rank: 192, naac_grade: 'B', website: 'https://www.ecajmer.ac.in', avg_pkg: 4.8, max_pkg: 18.0, t_fee: 60000, h_fee: 20000 },
      { name: 'Swami Keshvanand Institute of Technology, Management & Gramothan', state: 'Rajasthan', city: 'Jaipur', type: 'Private', nirf_rank: 193, naac_grade: 'A', website: 'https://www.skit.ac.in', avg_pkg: 5.2, max_pkg: 25.0, t_fee: 95000, h_fee: 50000 },
      { name: 'Jaipur Engineering College and Research Centre', state: 'Rajasthan', city: 'Jaipur', type: 'Private', nirf_rank: 194, naac_grade: 'A', website: 'https://jecrcuniversity.edu.in', avg_pkg: 5.0, max_pkg: 24.0, t_fee: 110000, h_fee: 55000 },
      { name: 'Sagar Institute of Science and Technology', state: 'Madhya Pradesh', city: 'Bhopal', type: 'Private', nirf_rank: 195, naac_grade: 'A', website: 'https://www.sistec.ac.in', avg_pkg: 4.5, max_pkg: 20.0, t_fee: 80000, h_fee: 40000 },
      { name: 'IIIT Dharwad', state: 'Karnataka', city: 'Dharwad', type: 'IIIT', nirf_rank: 196, naac_grade: 'B', website: 'https://www.iiitdwd.ac.in', avg_pkg: 8.5, max_pkg: 35.0, t_fee: 220000, h_fee: 80000 },
      { name: 'IIIT Kalyani', state: 'West Bengal', city: 'Kalyani', type: 'IIIT', nirf_rank: 197, naac_grade: 'B', website: 'https://iiitkalyani.ac.in', avg_pkg: 8.0, max_pkg: 30.0, t_fee: 180000, h_fee: 70000 },
      { name: 'Government College of Engineering Salem', state: 'Tamil Nadu', city: 'Salem', type: 'Government', nirf_rank: 198, naac_grade: 'A', website: 'https://gcesalem.edu.in', avg_pkg: 5.0, max_pkg: 20.0, t_fee: 15000, h_fee: 20000 },
      { name: 'Government College of Engineering Karad', state: 'Maharashtra', city: 'Karad', type: 'Government', nirf_rank: 199, naac_grade: 'A', website: 'https://www.gcekarad.ac.in', avg_pkg: 5.5, max_pkg: 22.0, t_fee: 85000, h_fee: 30000 },
      { name: 'Government Engineering College Thrissur', state: 'Kerala', city: 'Thrissur', type: 'Government', nirf_rank: 200, naac_grade: 'A', website: 'http://gectcr.ac.in', avg_pkg: 6.8, max_pkg: 28.0, t_fee: 25000, h_fee: 22000 }
    ];

    // Common B.Tech Branches
    const branches = [
      { name: 'Computer Science & Engineering', duration: 4 },
      { name: 'Electronics & Communication Engineering', duration: 4 },
      { name: 'Electrical Engineering', duration: 4 },
      { name: 'Mechanical Engineering', duration: 4 },
      { name: 'Civil Engineering', duration: 4 },
      { name: 'Chemical Engineering', duration: 4 },
      { name: 'Information Technology', duration: 4 }
    ];

    // Categories
    const categories = ['General', 'OBC', 'EWS', 'SC', 'ST'];

    console.log(`Inserting ${colleges.length} colleges...`);
    
    // We execute in an SQL Transaction for absolute speed!
    await db.query('BEGIN');

    const collegeIds = [];

    for (const c of colleges) {
      let tuitionFee = c.t_fee;
      let hostelFee = c.h_fee;
      let isOverridden = false;

      // Update fees to the latest 2025-2026 official announcements
      if (c.type === 'IIT') {
        tuitionFee = 200000.00; // standard General/OBC IIT B.Tech fee
        hostelFee = 35000.00;
        isOverridden = true;
      } else if (c.type === 'NIT') {
        tuitionFee = 125000.00; // standard NIT tuition fee
        hostelFee = 30000.00;
        isOverridden = true;
      } else if (c.name.includes('BITS')) {
        tuitionFee = 550000.00; // BITS B.Tech fee
        hostelFee = 100000.00;
        isOverridden = true;
      } else if (c.name.includes('VIT')) {
        tuitionFee = 198000.00; // VIT fee
        hostelFee = 95000.00;
        isOverridden = true;
      } else if (c.name.includes('Manipal')) {
        tuitionFee = 420000.00; // MIT fee
        hostelFee = 150000.00;
        isOverridden = true;
      } else if (c.name.includes('SRM')) {
        tuitionFee = 300000.00; // SRM fee
        hostelFee = 120000.00;
        isOverridden = true;
      } else if (c.name.includes('Jadavpur')) {
        tuitionFee = 2400.00; // Jadavpur fee
        hostelFee = 3000.00;
        isOverridden = true;
      } else if (c.name.includes('Thapar')) {
        tuitionFee = 440000.00; // Thapar fee
        hostelFee = 120000.00;
        isOverridden = true;
      } else if (c.name.includes('Birla Institute of Technology, Mesra')) {
        tuitionFee = 320000.00; // BIT Mesra fee
        hostelFee = 50000.00;
        isOverridden = true;
      } else if (c.name.includes('Amrita')) {
        tuitionFee = 280000.00; // Amrita fee
        hostelFee = 90000.00;
        isOverridden = true;
      } else if (c.name.includes('RV College')) {
        tuitionFee = 264000.00; // COMEDK fee
        hostelFee = 140000.00;
        isOverridden = true;
      } else if (c.name.includes('BMS College')) {
        tuitionFee = 264000.00; // COMEDK fee
        hostelFee = 130000.00;
        isOverridden = true;
      } else if (c.name.includes('Ramaiah')) {
        tuitionFee = 264000.00; // COMEDK fee
        hostelFee = 130000.00;
        isOverridden = true;
      } else if (c.name.includes('IIIT Bangalore') || c.name.includes('IIITB')) {
        tuitionFee = 320000.00;
        hostelFee = 96000.00;
        isOverridden = true;
      } else if (c.name.includes('Hyderabad') && c.name.includes('IIIT')) {
        tuitionFee = 400000.00; // IIIT Hyderabad fee
        hostelFee = 90000.00;
        isOverridden = true;
      } else if (c.name.includes('LNM')) {
        tuitionFee = 390000.00; // LNMIIT B.Tech fee
        hostelFee = 80000.00;
        isOverridden = true;
      } else if (c.name.includes('DA-IICT')) {
        tuitionFee = 240000.00; // DA-IICT fee
        hostelFee = 60000.00;
        isOverridden = true;
      } else if (c.name.includes('Nirma')) {
        tuitionFee = 230000.00; // Nirma B.Tech fee
        hostelFee = 70000.00;
        isOverridden = true;
      } else if (c.name.includes('PDEU')) {
        tuitionFee = 240000.00; // PDEU fee
        hostelFee = 90000.00;
        isOverridden = true;
      } else if (c.name.includes('KIIT')) {
        tuitionFee = 350000.00; // KIIT fee
        hostelFee = 90000.00;
        isOverridden = true;
      } else if (c.name.includes('SOA') || c.name.includes('Siksha')) {
        tuitionFee = 250000.00; // SOA fee
        hostelFee = 80000.00;
        isOverridden = true;
      } else if (c.name.includes('SASTRA')) {
        tuitionFee = 170000.00; // SASTRA fee
        hostelFee = 60000.00;
        isOverridden = true;
      } else if (c.name.includes('SSN')) {
        tuitionFee = 130000.00; // SSN fee
        hostelFee = 90000.00;
        isOverridden = true;
      } else if (c.name.includes('Sathyabama')) {
        tuitionFee = 200000.00; // Sathyabama fee
        hostelFee = 80000.00;
        isOverridden = true;
      } else if (c.name.includes('Karunya')) {
        tuitionFee = 220000.00; // Karunya fee
        hostelFee = 80000.00;
        isOverridden = true;
      } else if (c.name.includes('PSG')) {
        tuitionFee = 180000.00; // PSG fee
        hostelFee = 75000.00;
        isOverridden = true;
      } else if (c.name.includes('DTU') || c.name.includes('NSUT') || c.name.includes('Technological') || c.name.includes('Delhi')) {
        if (c.type !== 'IIT' && c.type !== 'IIIT') {
          tuitionFee = 248000.00; // DTU/NSUT fee
          hostelFee = 85000.00;
          isOverridden = true;
        }
      } else if (c.name.includes('COEP')) {
        tuitionFee = 135000.00;
        hostelFee = 40000.00;
        isOverridden = true;
      } else if (c.name.includes('VJTI')) {
        tuitionFee = 85000.00;
        hostelFee = 35000.00;
        isOverridden = true;
      }

      // general state/private bounds adjustment (only if not explicitly overridden!)
      if (!isOverridden) {
        if (c.type === 'State Government' && tuitionFee > 150000) {
          tuitionFee = 125000.00;
        }
        if (c.type === 'Private' && tuitionFee < 150000) {
          tuitionFee = 220000.00;
        }
      }

      const res = await db.query(
        `INSERT INTO colleges (
          name, state, city, type, nirf_rank, naac_grade, website, 
          application_link, average_package, highest_package, tuition_fee, hostel_fee
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        [
          c.name, c.state, c.city, c.type, c.nirf_rank, c.naac_grade, c.website,
          c.type === 'IIT' || c.type === 'NIT' || c.type === 'IIIT' ? 'https://josaa.nic.in' : c.website + '/admission',
          c.avg_pkg, c.max_pkg, tuitionFee, hostelFee
        ]
      );
      collegeIds.push({
        id: res.rows[0].id,
        name: c.name,
        type: c.type,
        rank: c.nirf_rank,
        state: c.state
      });
    }

    console.log(`Colleges inserted. Creating branches and generating cutoffs...`);

    // Course insertion block
    for (const col of collegeIds) {
      // Determine applicable exams list
      let examsList = ['JEE Main'];
      if (col.type === 'IIT') {
        examsList = ['JEE Advanced'];
      } else if (col.name.includes('BITS')) {
        examsList = ['BITSAT'];
      } else if (col.name.includes('VIT')) {
        examsList = ['VITEEE'];
      } else if (col.name.includes('SRM')) {
        examsList = ['SRMJEEE'];
      } else if (col.name.includes('Manipal')) {
        examsList = ['MET'];
      } else if (col.name.includes('Amrita')) {
        examsList = ['AEEE', 'JEE Main'];
      } else if (col.type === 'State Government' || col.type === 'Private') {
        if (col.state === 'Maharashtra') examsList = ['MHT-CET', 'JEE Main'];
        else if (col.state === 'Karnataka') examsList = ['KCET', 'COMEDK', 'JEE Main'];
        else if (col.state === 'Telangana' || col.state === 'Andhra Pradesh') examsList = ['EAMCET', 'JEE Main'];
        else if (col.state === 'West Bengal') examsList = ['WBJEE', 'JEE Main'];
        else if (col.state === 'Gujarat') examsList = ['GUJCET', 'JEE Main'];
        else if (col.state === 'Kerala') examsList = ['KEAM', 'JEE Main'];
      }

      // Add specific private university exams
      if (col.name.includes('Lovely Professional') || col.name.includes('LPU')) {
        examsList.push('LPUNEST');
      } else if (col.name.includes('Chandigarh University')) {
        examsList.push('CUCET');
      } else if (col.name.includes('Hindustan Institute')) {
        examsList.push('HITSEEE');
      } else if (col.name.includes('G. L. A. University')) {
        examsList.push('GLAET');
      }

      for (const branch of branches) {
        // Skip IT or Chemical for some colleges to make it feel organic
        if (branch.name === 'Information Technology' && col.type === 'IIT') continue;
        if (branch.name === 'Chemical Engineering' && col.type === 'IIIT') continue;

        const courseRes = await db.query(
          'INSERT INTO courses (college_id, course_name, duration) VALUES ($1, $2, $3) RETURNING id',
          [col.id, branch.name, branch.duration]
        );
        const courseId = courseRes.rows[0].id;

        for (const exam of examsList) {
          // Generate cutoffs procedurally or via high-fidelity map
          // Base rank represents the closing rank for GENERAL CRL.
          let baseClosingRank = 1000;
          const mappedCseRank = getBaseCseRank(col.name, col.type);

          if (mappedCseRank !== null) {
            // Use high-fidelity mapping and apply branch multiplier
            if (branch.name.includes('Computer')) {
              baseClosingRank = mappedCseRank;
            } else if (col.type === 'IIT') {
              if (branch.name.includes('Electrical') || branch.name.includes('Communication')) {
                baseClosingRank = Math.min(15000, Math.round(mappedCseRank * 3.0 + 150));
              } else if (branch.name.includes('Mechanical')) {
                baseClosingRank = Math.min(16500, Math.round(mappedCseRank * 6.0 + 600));
              } else if (branch.name.includes('Chemical')) {
                baseClosingRank = Math.min(17000, Math.round(mappedCseRank * 8.0 + 1000));
              } else { // Civil, etc.
                baseClosingRank = Math.min(17500, Math.round(mappedCseRank * 11.0 + 1500));
              }
            } else if (col.type === 'NIT') {
              if (branch.name.includes('Information')) {
                baseClosingRank = Math.min(45000, Math.round(mappedCseRank * 1.25 + 200));
              } else if (branch.name.includes('Communication')) {
                baseClosingRank = Math.min(50000, Math.round(mappedCseRank * 1.6 + 500));
              } else if (branch.name.includes('Electrical')) {
                baseClosingRank = Math.min(65000, Math.round(mappedCseRank * 2.8 + 1000));
              } else if (branch.name.includes('Mechanical')) {
                baseClosingRank = Math.min(85000, Math.round(mappedCseRank * 4.5 + 2000));
              } else if (branch.name.includes('Chemical')) {
                baseClosingRank = Math.min(95000, Math.round(mappedCseRank * 6.0 + 3000));
              } else { // Civil, etc.
                baseClosingRank = Math.min(110000, Math.round(mappedCseRank * 8.0 + 4000));
              }
            } else if (col.type === 'IIIT' || col.name.includes('IIIT')) {
              if (branch.name.includes('Information')) {
                baseClosingRank = Math.min(35000, Math.round(mappedCseRank * 1.2 + 200));
              } else if (branch.name.includes('Communication')) {
                baseClosingRank = Math.min(45000, Math.round(mappedCseRank * 1.6 + 400));
              } else if (branch.name.includes('Electrical')) {
                baseClosingRank = Math.min(55000, Math.round(mappedCseRank * 2.5 + 800));
              } else if (branch.name.includes('Mechanical')) {
                baseClosingRank = Math.min(75000, Math.round(mappedCseRank * 4.0 + 1500));
              } else { // Civil, Chemical, etc.
                baseClosingRank = Math.min(90000, Math.round(mappedCseRank * 6.5 + 3000));
              }
            }
          } else {
            // High-fidelity private and state exam logic
            baseClosingRank = getPrivateOrStateBaseRank(col, exam, branch.name);
          }

          // Add variance to base rank (simulates realistic shifts between colleges)
          baseClosingRank = Math.round(baseClosingRank * (0.95 + Math.random() * 0.1));

          // Generate cutoff entries for multiple years (2023, 2024, 2025) to show history trends
          const years = [2023, 2024, 2025];
          
          for (const year of years) {
            // Adjust base closing rank slightly per year to simulate realistic yearly shifts
            let yearClosingRank = baseClosingRank;
            if (year === 2023) yearClosingRank = Math.round(baseClosingRank * 0.90);
            else if (year === 2024) yearClosingRank = Math.round(baseClosingRank * 0.95);
            
            const yearOpeningRank = Math.round(yearClosingRank * (0.6 + Math.random() * 0.25));

            for (const cat of categories) {
              let catOpening = yearOpeningRank;
              let catClosing = yearClosingRank;

              if (cat !== 'General') {
                if (exam === 'JEE Advanced') {
                  if (cat === 'OBC') {
                    if (yearClosingRank < 100) {
                      catClosing = Math.round(yearClosingRank * 0.8);
                    } else if (yearClosingRank < 500) {
                      catClosing = Math.round(80 + (yearClosingRank - 100) * 2.8);
                    } else {
                      catClosing = Math.round(1200 + (yearClosingRank - 500) * 0.25);
                    }
                  } else if (cat === 'EWS') {
                    if (yearClosingRank < 100) {
                      catClosing = Math.round(yearClosingRank * 0.3);
                    } else if (yearClosingRank < 500) {
                      catClosing = Math.round(30 + (yearClosingRank - 100) * 1.8);
                    } else {
                      catClosing = Math.round(750 + (yearClosingRank - 500) * 0.04);
                    }
                  } else if (cat === 'SC') {
                    if (yearClosingRank < 100) {
                      catClosing = Math.round(yearClosingRank * 0.45);
                    } else if (yearClosingRank < 500) {
                      catClosing = Math.round(45 + (yearClosingRank - 100) * 1.8);
                    } else {
                      catClosing = Math.round(765 + (yearClosingRank - 500) * 0.1);
                    }
                  } else if (cat === 'ST') {
                    if (yearClosingRank < 100) {
                      catClosing = Math.round(yearClosingRank * 0.28);
                    } else if (yearClosingRank < 500) {
                      catClosing = Math.round(28 + (yearClosingRank - 100) * 3.5);
                    } else {
                      catClosing = Math.round(1428 + (yearClosingRank - 500) * 0.08);
                    }
                  }
                  catOpening = Math.round(catClosing * 0.75);
                } else if (exam === 'JEE Main') {
                  if (cat === 'OBC') {
                    if (yearClosingRank < 5000) {
                      catClosing = Math.round(yearClosingRank * 1.8);
                    } else {
                      catClosing = Math.round(9000 + (yearClosingRank - 5000) * 0.26);
                    }
                  } else if (cat === 'EWS') {
                    if (yearClosingRank < 5000) {
                      catClosing = Math.round(yearClosingRank * 0.08 + 10);
                    } else {
                      catClosing = Math.round(410 + (yearClosingRank - 5000) * 0.15);
                    }
                  } else if (cat === 'SC') {
                    if (yearClosingRank < 5000) {
                      catClosing = Math.round(yearClosingRank * 0.17 + 20);
                    } else {
                      catClosing = Math.round(870 + (yearClosingRank - 5000) * 0.16);
                    }
                  } else if (cat === 'ST') {
                    if (yearClosingRank < 5000) {
                      catClosing = Math.round(yearClosingRank * 0.007 + 5);
                    } else {
                      catClosing = Math.round(40 + (yearClosingRank - 5000) * 0.06);
                    }
                  }
                  catOpening = Math.round(catClosing * 0.75);
                } else {
                  // State/private exams - category ranks qualify with higher rank limits (CRL rank enters)
                  if (cat === 'OBC') {
                    catOpening = Math.round(yearOpeningRank * 1.6);
                    catClosing = Math.round(yearClosingRank * 1.8);
                  } else if (cat === 'EWS') {
                    catOpening = Math.round(yearOpeningRank * 1.3);
                    catClosing = Math.round(yearClosingRank * 1.4);
                  } else if (cat === 'SC') {
                    catOpening = Math.round(yearOpeningRank * 4.0);
                    catClosing = Math.round(yearClosingRank * 4.5);
                  } else if (cat === 'ST') {
                    catOpening = Math.round(yearOpeningRank * 6.5);
                    catClosing = Math.round(yearClosingRank * 7.5);
                  }
                }
              }

              // Cap lower boundary at 1
              catOpening = Math.max(1, catOpening);
              catClosing = Math.max(catOpening + 10, catClosing);

              await db.query(
                `INSERT INTO cutoffs (college_id, course_id, exam, category, year, opening_rank, closing_rank)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [col.id, courseId, exam, cat, year, catOpening, catClosing]
              );
            }
          }
        }
      }
    }

    await db.query('COMMIT');
    console.log('Seeding completed successfully! Transaction committed.');
    console.log(`Successfully seeded ${colleges.length} colleges with courses and cutoffs.`);
    process.exit(0);
  } catch (err) {
    await db.query('ROLLBACK').catch(() => {});
    console.error('Expanded seeding failed with error:', err);
    process.exit(1);
  }
};

seedExpanded();
