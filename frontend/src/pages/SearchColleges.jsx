import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ListFilter } from 'lucide-react';
import CollegeCard from '../components/CollegeCard';

export default function SearchColleges({ setCurrentPage, setSelectedCollegeId, compareList, setCompareList }) {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter options loaded from API
  const [filterOptions, setFilterOptions] = useState({ states: [], types: [] });
  
  // Filter and search states
  const [filters, setFilters] = useState({
    search: '',
    state: '',
    type: '',
    minPackage: '',
    maxFee: '',
    sortBy: ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const loadColleges = () => {
    setLoading(true);
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.state) queryParams.append('state', filters.state);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.minPackage) queryParams.append('minPackage', filters.minPackage);
    if (filters.maxFee) queryParams.append('maxFee', filters.maxFee);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);

    fetch(`/api/colleges?${queryParams.toString()}`)
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
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load search colleges:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    // Load filter options (states, types) on mount
    fetch('/api/colleges/filters')
      .then(res => res.json())
      .then(data => setFilterOptions(data))
      .catch(err => console.error('Error fetching filter lists:', err));
  }, []);

  // Reload colleges whenever filters change
  useEffect(() => {
    loadColleges();
  }, [filters]);

  const handleCompareToggle = (college) => {
    setCompareList(prev => {
      const exists = prev.find(c => c.id === college.id);
      if (exists) {
        return prev.filter(c => c.id !== college.id);
      }
      if (prev.length >= 3) {
        alert('You can compare up to 3 colleges at a time.');
        return prev;
      }
      return [...prev, college];
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      state: '',
      type: '',
      minPackage: '',
      maxFee: '',
      sortBy: ''
    });
  };

  return (
    <div className="container" style={{ paddingTop: '40px', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Search Engineering Colleges</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Browse our complete catalog of Indian engineering colleges. Filter by location, fees, packages, and type.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '30px' }} className="grid-cols-2">
        {/* Left Side: Filter Form Panel */}
        <div className="card" style={{ height: 'fit-content', position: 'sticky', top: '90px' }}>
          <div className="flex-row-center" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={18} /> Filters
            </h3>
            <button 
              onClick={clearFilters} 
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
            >
              Clear All
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="search">Search Name / City</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                id="search"
                name="search"
                className="form-control"
                placeholder="e.g. Bombay"
                value={filters.search}
                onChange={handleFilterChange}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="state">State</label>
            <select
              id="state"
              name="state"
              className="form-control"
              value={filters.state}
              onChange={handleFilterChange}
            >
              <option value="">All States</option>
              {filterOptions.states.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="type">College Type</label>
            <select
              id="type"
              name="type"
              className="form-control"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              {filterOptions.types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="minPackage">Min Average Package</label>
            <select
              id="minPackage"
              name="minPackage"
              className="form-control"
              value={filters.minPackage}
              onChange={handleFilterChange}
            >
              <option value="">Any Package</option>
              <option value="6">6+ LPA</option>
              <option value="10">10+ LPA</option>
              <option value="15">15+ LPA</option>
              <option value="20">20+ LPA</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="maxFee">Max Tuition Fee (Annual)</label>
            <select
              id="maxFee"
              name="maxFee"
              className="form-control"
              value={filters.maxFee}
              onChange={handleFilterChange}
            >
              <option value="">Any Fee</option>
              <option value="100000">Under ₹1.0 Lakh</option>
              <option value="150000">Under ₹1.5 Lakh</option>
              <option value="200000">Under ₹2.0 Lakh</option>
              <option value="300000">Under ₹3.0 Lakh</option>
            </select>
          </div>
        </div>

        {/* Right Side: College Listing Grid */}
        <div>
          {/* Header Controls */}
          <div className="flex-row-center" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Showing <strong>{colleges.length}</strong> institutions
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ListFilter size={16} color="var(--text-muted)" />
              <select
                name="sortBy"
                className="form-control"
                value={filters.sortBy}
                onChange={handleFilterChange}
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                <option value="">Sort: Alphabetical</option>
                <option value="nirf_rank">Sort: NIRF Rank</option>
                <option value="average_package">Sort: Avg Package (High to Low)</option>
                <option value="highest_package">Sort: Highest Package (High to Low)</option>
                <option value="tuition_fee">Sort: Tuition Fee (Low to High)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              Querying database catalog...
            </div>
          ) : colleges.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              No colleges found matching these filter criteria. Try clearing some selections.
            </div>
          ) : (
            <div className="grid-cols-2">
              {colleges.map(college => (
                <CollegeCard
                  key={college.id}
                  college={college}
                  onViewDetails={() => {
                    setSelectedCollegeId(college.id);
                  }}
                  onCompare={() => handleCompareToggle(college)}
                  isCompared={!!compareList.find(c => c.id === college.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
