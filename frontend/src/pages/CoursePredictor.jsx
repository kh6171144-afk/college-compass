import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, HelpCircle, AlertTriangle, AlertCircle, Award, Search, ChevronDown } from 'lucide-react';

export default function CoursePredictor({ setCurrentPage, setSelectedCollegeId }) {
  const [colleges, setColleges] = useState([]);
  const [inputs, setInputs] = useState({
    collegeId: '',
    rank: '',
    exam: 'JEE Main',
    category: 'General'
  });
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Searchable dropdown states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Click outside handler to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredColleges = colleges.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exams = [
    'JEE Main', 'JEE Advanced', 'MHT-CET', 'KCET', 'EAMCET', 
    'WBJEE', 'GUJCET', 'KEAM', 'COMEDK', 
    'BITSAT', 'VITEEE', 'SRMJEEE', 'MET', 'AEEE',
    'LPUNEST', 'CUCET', 'HITSEEE', 'GLAET'
  ];
  const categories = ['General', 'OBC', 'EWS', 'SC', 'ST'];

  useEffect(() => {
    // Load colleges for dropdown
    fetch('/api/colleges')
      .then(res => res.json())
      .then(data => {
        // Frontend Safety Layer: deduplicate colleges by name + campus_name
        const seen = new Set();
        const deduplicated = [];
        for (const item of data) {
          const key = `${item.name || ''}_${item.campus_name || ''}`.toLowerCase().replace(/\s+/g, '');
          if (!seen.has(key)) {
            seen.add(key);
            deduplicated.push(item);
          }
        }
        setColleges(deduplicated);
        if (deduplicated.length > 0) {
          setInputs(prev => ({ ...prev, collegeId: deduplicated[0].id.toString() }));
        }
      })
      .catch(err => console.error('Error loading colleges:', err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputs.collegeId || !inputs.rank) {
      alert('Please fill out all fields.');
      return;
    }

    setLoading(true);
    setResults(null);

    const queryParams = new URLSearchParams({
      rank: inputs.rank,
      collegeId: inputs.collegeId,
      exam: inputs.exam,
      category: inputs.category
    });

    fetch(`/api/predictor/course?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        // Fail-safe client-side filtering for the latest year (2025)
        const latestData = data.filter(d => d.year === 2025);
        let activeData = [];
        if (latestData.length > 0) {
          activeData = latestData;
        } else if (data.length > 0) {
          const maxYear = Math.max(...data.map(d => d.year));
          activeData = data.filter(d => d.year === maxYear);
        }

        // Frontend Safety Layer: deduplicate by course_name
        const seen = new Set();
        const deduplicated = [];
        for (const item of activeData) {
          const key = (item.course_name || item.branch_name || '').toLowerCase().replace(/\s+/g, '');
          if (!seen.has(key)) {
            seen.add(key);
            deduplicated.push(item);
          }
        }
        setResults(deduplicated);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error running course predictor:', err);
        setLoading(false);
      });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Safe':
        return <span className="badge badge-green">Safe</span>;
      case 'Possible':
        return <span className="badge badge-yellow">Possible</span>;
      case 'Reach':
        return <span className="badge badge-red">Reach</span>;
      default:
        return <span className="badge" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-muted)' }}>Unlikely</span>;
    }
  };

  const selectedCollegeName = colleges.find(c => c.id.toString() === inputs.collegeId)?.name || 'Selected College';

  return (
    <div className="container" style={{ paddingTop: '40px', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Course (Branch) Predictor</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Select a target engineering college and enter your rank to see available branches and your admission chances.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '40px' }}>
        <form onSubmit={handleSubmit}>
          <div className="predictor-grid">
            <div className="form-group" style={{ gridColumn: 'span 2' }} ref={dropdownRef}>
              <label>Select Target College</label>
              <div className="searchable-dropdown">
                <div 
                  className="form-control searchable-dropdown-toggle"
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setSearchTerm('');
                  }}
                >
                  <span>
                    {inputs.collegeId 
                      ? (colleges.find(c => c.id.toString() === inputs.collegeId)
                          ? `${colleges.find(c => c.id.toString() === inputs.collegeId).name} (${colleges.find(c => c.id.toString() === inputs.collegeId).city}, ${colleges.find(c => c.id.toString() === inputs.collegeId).state})`
                          : '-- Choose a College --')
                      : '-- Choose a College --'}
                  </span>
                  <ChevronDown size={18} style={{ color: 'var(--text-secondary)' }} />
                </div>

                {dropdownOpen && (
                  <div className="searchable-dropdown-menu">
                    <div className="searchable-dropdown-search-wrapper">
                      <input
                        type="text"
                        className="searchable-dropdown-search"
                        placeholder="Search by college name, city or state..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="searchable-dropdown-items">
                      {filteredColleges.length === 0 ? (
                        <div className="searchable-dropdown-no-results">No colleges found</div>
                      ) : (
                        filteredColleges.map(c => (
                          <div
                            key={c.id}
                            className={`searchable-dropdown-item ${inputs.collegeId === c.id.toString() ? 'selected' : ''}`}
                            onClick={() => {
                              setInputs(prev => ({ ...prev, collegeId: c.id.toString() }));
                              setDropdownOpen(false);
                            }}
                          >
                            {c.name} ({c.city}, {c.state})
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="rank">Enter Your Rank</label>
              <input
                type="number"
                id="rank"
                name="rank"
                className="form-control"
                placeholder="e.g. 500"
                value={inputs.rank}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="exam">Exam Type</label>
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
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '220px' }}>
              Analyze Branches
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Analyzing branch cutoffs...</p>
        </div>
      )}

      {results && (
        <div className="card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Award color="var(--primary)" /> Branch Analysis for {selectedCollegeName}
          </h2>

          <div className="compare-container" style={{ marginTop: 0 }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Branch / Course Name</th>
                  <th>Duration</th>
                  <th>Category</th>
                  <th>Opening Rank</th>
                  <th>Closing Rank</th>
                  <th>Your Admission Chance</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      No cutoff history found in our database for this exam and category.
                    </td>
                  </tr>
                ) : (
                  results.map(row => (
                    <tr key={row.cutoff_id}>
                      <td style={{ fontWeight: '600' }}>{row.course_name}</td>
                      <td>{row.duration} Years</td>
                      <td><span className="badge badge-blue">{inputs.category}</span></td>
                      <td>{row.opening_rank}</td>
                      <td>{row.closing_rank}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {getStatusBadge(row.status)}
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {row.chancePercent}% Probable
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
