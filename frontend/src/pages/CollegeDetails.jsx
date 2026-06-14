import React, { useState, useEffect } from 'react';
import { Globe, FileText, MapPin, Trophy, Landmark, Briefcase, Award, ArrowLeft, X, Check } from 'lucide-react';

export default function CollegeDetails({ collegeId, setCurrentPage, onCompareToggle, isCompared, user, token, onSignInTrigger }) {
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cutoffs filter states
  const [selectedExam, setSelectedExam] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewCompleteHistory, setViewCompleteHistory] = useState(false);

  // Rating modal states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [hostelRating, setHostelRating] = useState(0);
  const [campusRating, setCampusRating] = useState(0);
  const [infraRating, setInfraRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fee state
  const [selectedFeeIndex, setSelectedFeeIndex] = useState(0);

  useEffect(() => {
    if (!collegeId) return;
    
    setLoading(true);
    setSelectedFeeIndex(0); // Reset fee selector on college change
    fetch(`/api/colleges/${collegeId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load college details.');
        return res.json();
      })
      .then(data => {
        setCollege(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [collegeId]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center', minHeight: '80vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading college profile...</p>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center', minHeight: '80vh' }}>
        <h3 color="var(--chance-reach)">Error loading college details</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'College not found.'}</p>
        <button className="btn btn-secondary" onClick={() => setCurrentPage('search')} style={{ marginTop: '20px' }}>
          Back to Search
        </button>
      </div>
    );
  }

  // Formatting helpers
  const formatLPA = (val) => (val ? `${val} LPA` : 'N/A');
  const formatINR = (val) => (val ? `₹${val.toLocaleString('en-IN')}` : 'N/A');

  // Filter Cutoffs
  const uniqueExams = ['All', ...new Set(college.cutoffs.map(c => c.exam))];
  const uniqueCategories = ['All', ...new Set(college.cutoffs.map(c => c.category))];

  const filteredCutoffs = college.cutoffs.filter(c => {
    const matchesExam = selectedExam === 'All' || c.exam === selectedExam;
    if (!viewCompleteHistory) {
      const catLower = (c.category || '').toLowerCase();
      const isGeneral = catLower === 'general' || catLower === 'gen-op' || catLower === 'open';
      const is2025 = c.year === 2025;
      return matchesExam && isGeneral && is2025;
    }
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesExam && matchesCategory;
  });

  const handleRateCollegeClick = () => {
    if (!user) {
      alert('You must be signed in to submit a rating.');
      onSignInTrigger();
    } else {
      setSubmitError('');
      // Pre-fill user review if they already submitted one
      const existingReview = college.reviews.find(r => r.user_id === user.id);
      if (existingReview) {
        setHostelRating(existingReview.rating_hostels);
        setCampusRating(existingReview.rating_campus);
        setInfraRating(existingReview.rating_infra);
        setReviewText(existingReview.review_text || '');
      } else {
        setHostelRating(0);
        setCampusRating(0);
        setInfraRating(0);
        setReviewText('');
      }
      setReviewModalOpen(true);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (hostelRating === 0 || campusRating === 0 || infraRating === 0) {
      setSubmitError('Please rate all three categories.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    fetch(`/api/colleges/${collegeId}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        rating_hostels: hostelRating,
        rating_campus: campusRating,
        rating_infra: infraRating,
        review_text: reviewText
      })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      return data;
    })
    .then(() => {
      return fetch(`/api/colleges/${collegeId}`);
    })
    .then(res => res.json())
    .then(data => {
      setCollege(data);
      setReviewModalOpen(false);
      setSubmitting(false);
    })
    .catch(err => {
      setSubmitError(err.message);
      setSubmitting(false);
    });
  };

  const overallRating = hostelRating && campusRating && infraRating 
    ? ((hostelRating + campusRating + infraRating) / 3).toFixed(1) 
    : '0.0';

  const renderStarSelector = (value, onChange) => {
    return (
      <div className="star-rating-selector">
        {[1, 2, 3, 4, 5].map((star) => (
          <button 
            key={star} 
            type="button" 
            onClick={() => onChange(star)} 
            className={star <= value ? 'active' : ''}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="container" style={{ paddingTop: '30px', minHeight: '80vh' }}>
      {/* Back link */}
      <button 
        onClick={() => setCurrentPage('search')} 
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          color: 'var(--primary)', 
          fontWeight: '600', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          marginBottom: '24px'
        }}
      >
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      {/* College Title Block */}
      <div className="card" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="badge badge-blue">{college.type}</span>
            {college.nirf_rank && (
              <span className="badge badge-purple" style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                <Trophy size={10} /> NIRF #{college.nirf_rank}
              </span>
            )}
            {college.naac_grade && (
              <span className="badge" style={{ backgroundColor: 'var(--chance-safe-bg)', color: 'var(--chance-safe)' }}>
                NAAC Grade {college.naac_grade}
              </span>
            )}
          </div>
          
          <h1 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>{college.name}</h1>
          
          {college.ratings_summary && college.ratings_summary.total_reviews > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div className="star-display" style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#fbbf24' }} className={i >= Math.round(college.ratings_summary.avg_overall) ? 'empty' : ''}>
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                ))}
              </div>
              <strong style={{ fontSize: '1.1rem' }}>{college.ratings_summary.avg_overall}</strong>
              <span style={{ color: 'var(--text-muted)' }}>({college.ratings_summary.total_reviews} {college.ratings_summary.total_reviews === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {college.city}, {college.state}</span>
            {college.website && (
              <a href={college.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
                <Globe size={16} /> Visit Website
              </a>
            )}
          </div>

          {college.verification_status === 'Verified' && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '4px',
              marginTop: '15px', 
              padding: '12px 16px', 
              backgroundColor: 'var(--chance-safe-bg)', 
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              width: 'fit-content'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: 'var(--chance-safe)', fontSize: '0.95rem' }}>
                <Check size={16} color="var(--chance-safe)" style={{ strokeWidth: 3 }} />
                Officially Verified
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '22px' }}>
                <div>Source: <strong>{college.verification_source || 'Official Admission Authority'}</strong></div>
                <div>Last Verified: <strong>{new Date(college.last_verified_at).toLocaleDateString('en-GB')}</strong></div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {college.application_link && (
            <a href={college.application_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex' }}>
              Apply Now <Globe size={14} />
            </a>
          )}
          <button className={`btn ${isCompared ? 'btn-primary' : 'btn-secondary'}`} onClick={() => onCompareToggle(college)}>
            {isCompared ? 'Comparing' : 'Add to Compare'}
          </button>
        </div>
      </div>

      {/* Highlight Stats Panels */}
      <div className="grid-cols-3" style={{ marginBottom: '30px' }}>
        {/* Placement statistics */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={18} color="var(--primary)" /> Placement Packages</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'center' }}>
            <div className="placement-stat-card">
              <div className="placement-stat-val">{formatLPA(college.average_package)}</div>
              <div className="placement-stat-lbl">Average Package</div>
            </div>
            <div className="placement-stat-card">
              <div className="placement-stat-val">{formatLPA(college.highest_package)}</div>
              <div className="placement-stat-lbl">Highest Package</div>
            </div>
          </div>
        </div>

        {/* Fees Info */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Landmark size={18} color="var(--secondary)" /> Fee Structure (Annual)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'center' }}>
            <div className="placement-stat-card">
              <div className="placement-stat-val" style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>{formatINR(college.tuition_fee)}</div>
              <div className="placement-stat-lbl">Tuition Fee</div>
            </div>
            <div className="placement-stat-card">
              <div className="placement-stat-val" style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>{formatINR(college.hostel_fee)}</div>
              <div className="placement-stat-lbl">Hostel Fee</div>
            </div>
          </div>
        </div>

        {/* Academic Profile */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Award size={18} color="#10b981" /> Institute Profile</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
            <div className="flex-row-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>NIRF Ranking</span>
              <strong>{college.nirf_rank ? `#${college.nirf_rank} in India` : 'N/A'}</strong>
            </div>
            <div className="flex-row-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>NAAC Accreditation</span>
              <strong>{college.naac_grade || 'Not Accredited'}</strong>
            </div>
            <div className="flex-row-center">
              <span style={{ color: 'var(--text-secondary)' }}>Campus Location</span>
              <strong>{college.city}, {college.state}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings summary breakdown card */}
      {college.ratings_summary && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Student Ratings</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Based on {college.ratings_summary.total_reviews} verified student ratings
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleRateCollegeClick}>
              {college.reviews.some(r => r.user_id === user?.id) ? 'Edit Your Review' : 'Rate College'}
            </button>
          </div>

          <div className="grid-cols-4" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div className="placement-stat-card" style={{ padding: '15px', textAlign: 'center' }}>
              <div className="placement-stat-val" style={{ color: '#fbbf24', fontSize: '2rem' }}>
                {college.ratings_summary.avg_overall > 0 ? `${college.ratings_summary.avg_overall} ★` : 'N/A'}
              </div>
              <div className="placement-stat-lbl">Overall Quality</div>
            </div>
            <div className="placement-stat-card" style={{ padding: '15px', textAlign: 'center' }}>
              <div className="placement-stat-val" style={{ color: 'var(--primary)', fontSize: '2rem' }}>
                {college.ratings_summary.avg_hostels > 0 ? `${college.ratings_summary.avg_hostels} ★` : 'N/A'}
              </div>
              <div className="placement-stat-lbl">Hostels & Mess</div>
            </div>
            <div className="placement-stat-card" style={{ padding: '15px', textAlign: 'center' }}>
              <div className="placement-stat-val" style={{ color: '#10b981', fontSize: '2rem' }}>
                {college.ratings_summary.avg_campus > 0 ? `${college.ratings_summary.avg_campus} ★` : 'N/A'}
              </div>
              <div className="placement-stat-lbl">Campus Environment</div>
            </div>
            <div className="placement-stat-card" style={{ padding: '15px', textAlign: 'center' }}>
              <div className="placement-stat-val" style={{ color: 'var(--secondary)', fontSize: '2rem' }}>
                {college.ratings_summary.avg_infra > 0 ? `${college.ratings_summary.avg_infra} ★` : 'N/A'}
              </div>
              <div className="placement-stat-lbl">Infrastructure</div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Fee Structure Section */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <div className="flex-row-center" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Landmark size={22} color="var(--primary)" /> Detailed Fee Structure
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Official campus-specific fee components and estimated total costs.
            </p>
          </div>

          {/* Branch Selector if multiple structures exist */}
          {college.fees && college.fees.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Select Branch:</span>
              <select 
                className="form-control"
                value={selectedFeeIndex}
                onChange={(e) => setSelectedFeeIndex(parseInt(e.target.value))}
                style={{ padding: '6px 12px', fontSize: '0.85rem', minWidth: '200px' }}
              >
                {college.fees.map((f, i) => (
                  <option key={f.id || i} value={i}>
                    {f.course_name || 'Common Fee Structure'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {college.fees && college.fees.length > 0 ? (
          (() => {
            const activeFee = college.fees[selectedFeeIndex] || college.fees[0];
            const formatFeeVal = (val) => (val !== null && val !== undefined ? `₹${val.toLocaleString('en-IN')}` : 'N/A');
            return (
              <div>
                {/* Status bar */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 16px', 
                  backgroundColor: activeFee.verification_status === 'Verified' ? 'var(--chance-safe-bg)' : 'var(--primary-light)', 
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div>
                    Academic Year: <strong>{activeFee.academic_year || '2025'}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge ${activeFee.verification_status === 'Verified' ? 'badge-green' : 'badge-yellow'}`}>
                      {activeFee.verification_status === 'Verified' ? 'Verified' : 'Fee data not verified'}
                    </span>
                    {activeFee.source_url && (
                      <a href={activeFee.source_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'underline' }}>
                        View Official Source Brochure ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* Grid breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                  {/* Annual Costs column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', fontSize: '1rem', color: 'var(--primary)' }}>Annual Recurring Charges</h4>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Tuition Fee (Per Year):</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{formatFeeVal(activeFee.tuition_fee_per_year)}</strong>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Hostel Charges (Per Year):</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{formatFeeVal(activeFee.hostel_fee_per_year)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Mess Charges (Per Year):</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{formatFeeVal(activeFee.mess_fee_per_year)}</strong>
                    </div>
                  </div>

                  {/* One time & other costs column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', fontSize: '1rem', color: 'var(--secondary)' }}>One-time & Other Charges</h4>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>One-time Admission Fee:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{formatFeeVal(activeFee.one_time_charges)}</strong>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Refundable Caution Deposit:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{formatFeeVal(activeFee.caution_deposit)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Annual Examination Fees:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{formatFeeVal(activeFee.exam_fees)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Other Mandatory Charges:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{formatFeeVal(activeFee.other_charges)}</strong>
                    </div>
                  </div>

                  {/* Total Cost Column */}
                  <div style={{ 
                    backgroundColor: 'var(--primary-light)', 
                    padding: '20px', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    textAlign: 'center',
                    border: '1px solid rgba(var(--primary-rgb), 0.1)'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estimated 4-Year B.Tech Cost</span>
                    <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', margin: '10px 0' }}>
                      {formatFeeVal(activeFee.estimated_total_4years)}
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                      Calculated based on standard recurring tuition, hostel, mess, one-time fees, and deposits over a 4-year duration.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px', margin: 0 }}>
            Fee data not verified for this institution.
          </p>
        )}
      </div>

      {/* Courses & Cutoffs Content sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }} className="grid-cols-2">
        {/* Left Side: Offered Courses */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="var(--primary)" /> Offered Courses
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {college.courses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No courses cataloged.</p>
            ) : (
              college.courses.map(course => (
                <div key={course.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{course.course_name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Duration: {course.duration} Years (B.Tech / B.E.)</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Historical Cutoffs */}
        <div className="card">
          <div className="flex-row-center" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="var(--secondary)" /> Cutoff History
            </h2>
            
            {/* Cutoff filter selectors */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={viewCompleteHistory} 
                  onChange={(e) => {
                    setViewCompleteHistory(e.target.checked);
                    setSelectedCategory('All');
                  }} 
                  style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                />
                View Complete History
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <select 
                  className="form-control" 
                  value={selectedExam} 
                  onChange={(e) => setSelectedExam(e.target.value)}
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  {uniqueExams.map(ex => <option key={ex} value={ex}>{ex} (Exam)</option>)}
                </select>
                
                {viewCompleteHistory && (
                  <select 
                    className="form-control" 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat} (Category)</option>)}
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="compare-container" style={{ marginTop: 0 }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Course Branch</th>
                  <th>Exam / Mode</th>
                  <th>Category</th>
                  <th>Year</th>
                  <th>Opening Rank</th>
                  <th>Closing Rank</th>
                  <th>Official Source</th>
                </tr>
              </thead>
              <tbody>
                {filteredCutoffs.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No matching cutoffs found. Try resetting the filters.
                    </td>
                  </tr>
                ) : (
                  filteredCutoffs.map(cutoff => (
                    <tr key={cutoff.id}>
                      <td style={{ fontWeight: '600' }}>{cutoff.course_name}</td>
                      <td><span className="badge badge-blue">{cutoff.exam}</span></td>
                      <td>{cutoff.category}</td>
                      <td>{cutoff.year}</td>
                      <td>{cutoff.opening_rank}</td>
                      <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{cutoff.closing_rank}</td>
                      <td>
                        {cutoff.source_url ? (
                          <a href={cutoff.source_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--chance-safe)', textDecoration: 'underline', fontSize: '0.85rem' }}>
                            Verify ↗
                          </a>
                        ) : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reviews list section */}
      <div className="card" style={{ marginTop: '30px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Student Reviews & Feedback</h2>
        {college.reviews && college.reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '30px' }}>
            No reviews yet. Be the first to share your experience!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {college.reviews && college.reviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div>
                    <span className="review-user-name">{review.user_name}</span>
                    <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>•</span>
                    <span className="review-date">{new Date(review.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="star-display">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#fbbf24' }} className={i >= Math.round(review.rating_overall) ? 'empty' : ''}>
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                    ))}
                    <strong style={{ marginLeft: '6px', fontSize: '0.9rem' }}>{review.rating_overall}</strong>
                  </div>
                </div>

                <div className="rating-badge-grid">
                  <div className="rating-badge">
                    <span style={{ color: 'var(--text-secondary)' }}>Hostels & Mess:</span>
                    <strong>{review.rating_hostels} ★</strong>
                  </div>
                  <div className="rating-badge">
                    <span style={{ color: 'var(--text-secondary)' }}>Campus Environment:</span>
                    <strong>{review.rating_campus} ★</strong>
                  </div>
                  <div className="rating-badge">
                    <span style={{ color: 'var(--text-secondary)' }}>Infrastructure:</span>
                    <strong>{review.rating_infra} ★</strong>
                  </div>
                </div>

                {review.review_text && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '10px', whiteSpace: 'pre-line' }}>
                    {review.review_text}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Dialog Modal */}
      {reviewModalOpen && (
        <div className="modal-overlay" onClick={() => setReviewModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <button className="modal-close" onClick={() => setReviewModalOpen(false)}>
              <X size={20} />
            </button>
            
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Rate & Review</h2>
            <h4 style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '25px', fontWeight: '500' }}>
              {college.name}
            </h4>

            {submitError && <div style={{ color: 'var(--chance-reach)', background: 'var(--chance-reach-bg)', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>{submitError}</div>}

            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontWeight: '600', fontSize: '0.95rem', display: 'block' }}>Hostels & Mess Quality</label>
                {renderStarSelector(hostelRating, setHostelRating)}
              </div>

              <div>
                <label style={{ fontWeight: '600', fontSize: '0.95rem', display: 'block' }}>Campus Environment & Life</label>
                {renderStarSelector(campusRating, setCampusRating)}
              </div>

              <div>
                <label style={{ fontWeight: '600', fontSize: '0.95rem', display: 'block' }}>Infrastructure & Facilities</label>
                {renderStarSelector(infraRating, setInfraRating)}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700' }}>Calculated Overall Rating:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fbbf24' }}>
                    {overallRating} ★
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Overall rating is automatically calculated as the average of the three categories.
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="review_text">Written Review (Optional)</label>
                <textarea
                  id="review_text"
                  className="form-control"
                  rows="4"
                  placeholder="Share your personal experience regarding campus hostels, environment, food, academics, etc..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Rating & Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
