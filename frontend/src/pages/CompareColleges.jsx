import React, { useState, useEffect } from 'react';
import { Trash2, Plus, ArrowRightLeft, DollarSign, Trophy, MapPin, Globe } from 'lucide-react';

export default function CompareColleges({ compareList, setCompareList, setCurrentPage, setSelectedCollegeId }) {
  const [allColleges, setAllColleges] = useState([]);

  useEffect(() => {
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
        setAllColleges(deduplicated);
      })
      .catch(err => console.error('Error loading colleges for compare:', err));
  }, []);

  const handleRemove = (id) => {
    setCompareList(prev => prev.filter(c => c.id !== id));
  };

  const handleSelectCollege = (index, collegeId) => {
    if (!collegeId) {
      // Remove college at this slot
      setCompareList(prev => {
        const copy = [...prev];
        copy.splice(index, 1);
        return copy;
      });
      return;
    }

    const college = allColleges.find(c => c.id.toString() === collegeId);
    if (!college) return;

    // Check if already selected
    if (compareList.find(c => c.id === college.id)) {
      alert('This college is already selected for comparison.');
      return;
    }

    setCompareList(prev => {
      const copy = [...prev];
      copy[index] = college;
      // Filter out any undefined/null elements
      return copy.filter(Boolean);
    });
  };

  // Helper to determine highlight status
  // 1. Lowest Tuition Fee
  const lowestFee = Math.min(...compareList.map(c => c.tuition_fee || Infinity));
  // 2. Highest Average Package
  const highestAvgPkg = Math.max(...compareList.map(c => c.average_package || 0));
  // 3. Highest Placement Package
  const highestMaxPkg = Math.max(...compareList.map(c => c.highest_package || 0));
  // 4. Best NIRF Rank (lowest positive number)
  const bestNirf = Math.min(...compareList.map(c => c.nirf_rank || Infinity));

  const formatLPA = (val) => (val ? `${val} LPA` : 'N/A');
  const formatINR = (val) => (val ? `₹${val.toLocaleString('en-IN')}` : 'N/A');

  // Fill array up to 3 slots
  const compareSlots = [
    compareList[0] || null,
    compareList[1] || null,
    compareList[2] || null
  ];

  return (
    <div className="container" style={{ paddingTop: '40px', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Compare Colleges</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Compare up to 3 engineering colleges side-by-side on parameters like placements, rankings, fees, and location.
        </p>
      </div>

      {/* Compare table */}
      <div className="compare-container">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="compare-col-header" style={{ width: '25%' }}>Parameters</th>
              {compareSlots.map((college, idx) => (
                <th key={idx} style={{ width: '25%', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Slot {idx + 1}</span>
                      {college && (
                        <button 
                          className="btn-icon" 
                          onClick={() => handleRemove(college.id)}
                          style={{ padding: '4px', border: 'none', backgroundColor: 'transparent' }}
                        >
                          <Trash2 size={14} color="var(--chance-reach)" />
                        </button>
                      )}
                    </div>
                    
                    <select
                      className="form-control"
                      value={college ? college.id : ''}
                      onChange={(e) => handleSelectCollege(idx, e.target.value)}
                      style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                    >
                      <option value="">-- Select College --</option>
                      {allColleges.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>

                    {college && (
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className="badge badge-blue" style={{ alignSelf: 'flex-start' }}>{college.type}</span>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem', alignSelf: 'flex-start' }}
                          onClick={() => {
                            setSelectedCollegeId(college.id);
                            setCurrentPage('details');
                          }}
                        >
                          View Full Profile
                        </button>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>NIRF Rank</strong></td>
              {compareSlots.map((college, idx) => {
                if (!college) return <td key={idx} style={{ color: 'var(--text-muted)' }}>-</td>;
                const isBest = college.nirf_rank && college.nirf_rank === bestNirf;
                return (
                  <td key={idx}>
                    <span className={isBest ? 'compare-highlight' : ''}>
                      {college.nirf_rank ? `#${college.nirf_rank}` : 'N/A'}
                    </span>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td><strong>NAAC Grade</strong></td>
              {compareSlots.map((college, idx) => (
                <td key={idx}>{college ? college.naac_grade || 'N/A' : '-'}</td>
              ))}
            </tr>
            <tr>
              <td><strong>Average Package</strong></td>
              {compareSlots.map((college, idx) => {
                if (!college) return <td key={idx} style={{ color: 'var(--text-muted)' }}>-</td>;
                const isBest = college.average_package && college.average_package === highestAvgPkg;
                return (
                  <td key={idx} style={{ fontWeight: '600' }}>
                    <span className={isBest ? 'compare-highlight' : ''}>
                      {formatLPA(college.average_package)}
                    </span>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td><strong>Highest Package</strong></td>
              {compareSlots.map((college, idx) => {
                if (!college) return <td key={idx} style={{ color: 'var(--text-muted)' }}>-</td>;
                const isBest = college.highest_package && college.highest_package === highestMaxPkg;
                return (
                  <td key={idx}>
                    <span className={isBest ? 'compare-highlight' : ''}>
                      {formatLPA(college.highest_package)}
                    </span>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td><strong>Tuition Fee (Annual)</strong></td>
              {compareSlots.map((college, idx) => {
                if (!college) return <td key={idx} style={{ color: 'var(--text-muted)' }}>-</td>;
                const isBest = college.tuition_fee && college.tuition_fee === lowestFee;
                return (
                  <td key={idx}>
                    <span className={isBest ? 'compare-highlight' : ''}>
                      {formatINR(college.tuition_fee)}
                    </span>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td><strong>Hostel Fee (Annual)</strong></td>
              {compareSlots.map((college, idx) => (
                <td key={idx}>{college ? formatINR(college.hostel_fee) : '-'}</td>
              ))}
            </tr>
            <tr>
              <td><strong>Location</strong></td>
              {compareSlots.map((college, idx) => (
                <td key={idx}>{college ? `${college.city}, ${college.state}` : '-'}</td>
              ))}
            </tr>
            <tr>
              <td><strong>Official Links</strong></td>
              {compareSlots.map((college, idx) => {
                if (!college) return <td key={idx} style={{ color: 'var(--text-muted)' }}>-</td>;
                return (
                  <td key={idx}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                      {college.website && (
                        <a href={college.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Globe size={12} /> Website
                        </a>
                      )}
                      {college.application_link && (
                        <a href={college.application_link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          Application Link →
                        </a>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
