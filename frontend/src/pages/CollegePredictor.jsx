import React, { useState } from 'react';
import { Search, Info, ShieldCheck, HelpCircle, AlertTriangle, Trophy, Calendar } from 'lucide-react';

export default function CollegePredictor({ setCurrentPage, setSelectedCollegeId }) {
  const [inputs, setInputs] = useState({
    rank: '',
    exam: 'JEE Main',
    category: 'General',
    state: ''
  });
  
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Safe'); // Safe, Possible, Reach

  const exams = [
    'JEE Main', 'JEE Advanced', 'MHT-CET', 'KCET', 'EAMCET', 
    'WBJEE', 'GUJCET', 'KEAM', 'COMEDK', 
    'BITSAT', 'VITEEE', 'SRMJEEE', 'MET', 'AEEE',
    'LPUNEST', 'CUCET', 'HITSEEE', 'GLAET'
  ];
  const categories = ['General', 'OBC', 'EWS', 'SC', 'ST'];
  const states = [
    'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Delhi', 'Andhra Pradesh'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputs.rank || parseInt(inputs.rank) <= 0) {
      alert('Please enter a valid rank.');
      return;
    }

    setLoading(true);
    setPredictions(null);

    const queryParams = new URLSearchParams({
      rank: inputs.rank,
      exam: inputs.exam,
      category: inputs.category
    });

    if (inputs.state) {
      queryParams.append('state', inputs.state);
    }

    fetch(`/api/predictor/college?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        // Fail-safe client-side filtering for the latest year (2025)
        const latestData = data.filter(p => p.year === 2025);
        let activeData = data;
        
        if (latestData.length > 0) {
          activeData = latestData;
        } else if (data.length > 0) {
          const maxYear = Math.max(...data.map(d => d.year));
          activeData = data.filter(p => p.year === maxYear);
        } else {
          activeData = [];
        }
        
        // Frontend Safety Layer: Remove duplicates using college_name + campus_name + branch_name
        const seen = new Set();
        const uniquePredictions = [];
        for (const item of activeData) {
          const branchName = item.course_name || item.branch_name || '';
          const key = `${item.college_name || ''}_${item.campus_name || ''}_${branchName}`.toLowerCase().replace(/\s+/g, '');
          if (!seen.has(key)) {
            seen.add(key);
            uniquePredictions.push(item);
          }
        }
        
        setPredictions(uniquePredictions);
        setLoading(false);
        
        // Auto select the tab that has elements
        const safeCount = uniquePredictions.filter(p => p.status === 'Safe').length;
        const possibleCount = uniquePredictions.filter(p => p.status === 'Possible').length;
        const reachCount = uniquePredictions.filter(p => p.status === 'Reach').length;
        
        if (safeCount > 0) setActiveTab('Safe');
        else if (possibleCount > 0) setActiveTab('Possible');
        else if (reachCount > 0) setActiveTab('Reach');
      })
      .catch(err => {
        console.error('Error fetching college predictions:', err);
        setLoading(false);
      });
  };

  const filteredPredictions = predictions 
    ? predictions.filter(p => p.status === activeTab) 
    : [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Safe': return <ShieldCheck size={20} color="var(--chance-safe)" />;
      case 'Possible': return <HelpCircle size={20} color="var(--chance-possible)" />;
      case 'Reach': return <AlertTriangle size={20} color="var(--chance-reach)" />;
      default: return null;
    }
  };

  return (
    <div className="container" style={{ paddingTop: '40px', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>College Predictor</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Enter your entrance exam rank and category details to view colleges you are likely to get admission into.
        </p>
      </div>

      {/* Predictor Form */}
      <div className="card" style={{ marginBottom: '40px' }}>
        <form onSubmit={handleSubmit}>
          <div className="predictor-grid">
            <div className="form-group">
              <label htmlFor="rank">Enter Rank / Merit No.</label>
              <input
                type="number"
                id="rank"
                name="rank"
                className="form-control"
                placeholder="e.g. 15000"
                value={inputs.rank}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="exam">Entrance Exam</label>
              <select
                id="exam"
                name="exam"
                className="form-control"
                value={inputs.exam}
                onChange={handleInputChange}
              >
                {exams.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                className="form-control"
                value={inputs.category}
                onChange={handleInputChange}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="state">Preferred State (Optional)</label>
              <select
                id="state"
                name="state"
                className="form-control"
                value={inputs.state}
                onChange={handleInputChange}
              >
                <option value="">All States</option>
                {states.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '200px' }} disabled={loading}>
              {loading ? 'Calculating...' : 'Predict Colleges'}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
            Processing cutoff algorithms...
          </div>
        </div>
      )}

      {predictions && (
        <div>
          {/* Tabs header */}
          <div className="chance-group-tabs">
            {['Safe', 'Possible', 'Reach'].map(status => {
              const count = predictions.filter(p => p.status === status).length;
              let badgeColor = 'var(--text-secondary)';
              if (status === 'Safe') badgeColor = 'var(--chance-safe)';
              if (status === 'Possible') badgeColor = 'var(--chance-possible)';
              if (status === 'Reach') badgeColor = 'var(--chance-reach)';

              return (
                <button
                  key={status}
                  className={`tab-btn ${activeTab === status ? 'active' : ''}`}
                  onClick={() => setActiveTab(status)}
                >
                  <span style={{ marginRight: '6px', color: badgeColor }}>●</span>
                  {status} Options ({count})
                </button>
              );
            })}
          </div>

          {/* Guidelines info */}
          <div 
            style={{ 
              display: 'flex', 
              gap: '12px', 
              backgroundColor: 'var(--primary-light)', 
              padding: '12px 16px', 
              borderRadius: 'var(--border-radius-sm)', 
              marginBottom: '24px',
              fontSize: '0.9rem',
              alignItems: 'center'
            }}
          >
            <Info size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
            <div>
              {activeTab === 'Safe' && <span><strong>Safe options</strong>: Your rank is substantially below the previous cutoff. Very high probability of admission.</span>}
              {activeTab === 'Possible' && <span><strong>Possible options</strong>: Your rank is highly competitive and aligns closely with previous cutoffs. Good probability of admission.</span>}
              {activeTab === 'Reach' && <span><strong>Reach options</strong>: Stretch branches. Your rank is slightly above the previous cutoff. Worth applying for later counselling rounds.</span>}
            </div>
          </div>

          {/* Cards List */}
          {filteredPredictions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '45px', color: 'var(--text-muted)' }}>
              No {activeTab} colleges found matching your rank. Try adjusting filters or category.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredPredictions.map(item => (
                <div 
                  key={item.cutoff_id} 
                  className="card" 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '3fr 1.5fr 1fr', 
                    alignItems: 'center', 
                    gap: '20px',
                    padding: '20px'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>{item.college_name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.95rem', marginBottom: '8px' }}>
                      {item.course_name}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span>NIRF: #{item.nirf_rank || 'N/A'}</span>
                      <span>•</span>
                      <span>State: {item.state}</span>
                      <span>•</span>
                      <span>Type: {item.college_type}</span>
                      <span>•</span>
                      <span>Category: <strong style={{ color: 'var(--primary)' }}>{item.category}</strong></span>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      {getStatusIcon(item.status)}
                      <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{item.chancePercent}%</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Chance</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-top' }} />
                      2025 Cutoff: {item.opening_rank} - {item.closing_rank}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        setSelectedCollegeId(item.college_id);
                        setCurrentPage('details');
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
