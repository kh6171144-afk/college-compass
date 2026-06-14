import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BookOpen, Layers, FileSpreadsheet, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('colleges'); // colleges, courses, cutoffs
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  // College Form State
  const [collegeForm, setCollegeForm] = useState({
    id: null,
    name: '',
    state: '',
    city: '',
    type: 'NIT',
    nirf_rank: '',
    naac_grade: 'A+',
    website: '',
    application_link: '',
    average_package: '',
    highest_package: '',
    tuition_fee: '',
    hostel_fee: ''
  });
  const [isEditingCollege, setIsEditingCollege] = useState(false);
  const [showCollegeForm, setShowCollegeForm] = useState(false);

  // Course Form State
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [collegeCourses, setCollegeCourses] = useState([]);
  const [courseForm, setCourseForm] = useState({
    course_name: '',
    duration: 4
  });

  // Cutoff Form State
  const [collegeCutoffs, setCollegeCutoffs] = useState([]);
  const [cutoffForm, setCutoffForm] = useState({
    course_id: '',
    exam: 'JEE Main',
    category: 'General',
    year: new Date().getFullYear() - 1,
    opening_rank: '',
    closing_rank: ''
  });

  const loadColleges = () => {
    setLoading(true);
    fetch('/api/colleges')
      .then(res => res.json())
      .then(data => {
        setColleges(data);
        setLoading(false);
        if (data.length > 0 && !selectedCollegeId) {
          setSelectedCollegeId(data[0].id.toString());
        }
      })
      .catch(err => {
        console.error('Error loading colleges:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadColleges();
  }, []);

  // Fetch Courses & Cutoffs for selected college
  useEffect(() => {
    if (!selectedCollegeId) return;
    
    fetch(`/api/colleges/${selectedCollegeId}`)
      .then(res => res.json())
      .then(data => {
        setCollegeCourses(data.courses || []);
        setCollegeCutoffs(data.cutoffs || []);
        if (data.courses && data.courses.length > 0) {
          setCutoffForm(prev => ({ ...prev, course_id: data.courses[0].id.toString() }));
        } else {
          setCutoffForm(prev => ({ ...prev, course_id: '' }));
        }
      })
      .catch(err => console.error('Error loading college detail details:', err));
  }, [selectedCollegeId]);

  // College Submit Handler
  const handleCollegeSubmit = (e) => {
    e.preventDefault();
    const method = isEditingCollege ? 'PUT' : 'POST';
    const url = isEditingCollege ? `/api/admin/colleges/${collegeForm.id}` : '/api/admin/colleges';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collegeForm)
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || 'Saved successfully!');
        loadColleges();
        setShowCollegeForm(false);
        resetCollegeForm();
      })
      .catch(err => console.error('Error saving college:', err));
  };

  // Delete College Handler
  const handleCollegeDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this college? All courses and cutoffs will be lost.')) return;
    
    fetch(`/api/admin/colleges/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        loadColleges();
      })
      .catch(err => console.error(err));
  };

  const handleEditClick = (college) => {
    setCollegeForm({
      id: college.id,
      name: college.name,
      state: college.state,
      city: college.city,
      type: college.type,
      nirf_rank: college.nirf_rank || '',
      naac_grade: college.naac_grade || 'A+',
      website: college.website || '',
      application_link: college.application_link || '',
      average_package: college.average_package || '',
      highest_package: college.highest_package || '',
      tuition_fee: college.tuition_fee || '',
      hostel_fee: college.hostel_fee || ''
    });
    setIsEditingCollege(true);
    setShowCollegeForm(true);
  };

  const resetCollegeForm = () => {
    setCollegeForm({
      id: null,
      name: '',
      state: '',
      city: '',
      type: 'NIT',
      nirf_rank: '',
      naac_grade: 'A+',
      website: '',
      application_link: '',
      average_package: '',
      highest_package: '',
      tuition_fee: '',
      hostel_fee: ''
    });
    setIsEditingCollege(false);
  };

  // Course Submit Handler
  const handleCourseSubmit = (e) => {
    e.preventDefault();
    if (!selectedCollegeId) return;

    fetch('/api/admin/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...courseForm,
        college_id: selectedCollegeId
      })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        setCourseForm({ course_name: '', duration: 4 });
        // Trigger reload
        setSelectedCollegeId(prev => prev);
      })
      .catch(err => console.error(err));
  };

  // Course Delete Handler
  const handleCourseDelete = (id) => {
    if (!window.confirm('Delete this course branch? This will also remove cutoffs tied to this course.')) return;
    
    fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        setSelectedCollegeId(prev => prev); // trigger reload
      })
      .catch(err => console.error(err));
  };

  // Cutoff Submit Handler
  const handleCutoffSubmit = (e) => {
    e.preventDefault();
    if (!cutoffForm.course_id) {
      alert('Please create a course first.');
      return;
    }

    fetch('/api/admin/cutoffs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...cutoffForm,
        college_id: selectedCollegeId
      })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        setCutoffForm(prev => ({
          ...prev,
          opening_rank: '',
          closing_rank: ''
        }));
        setSelectedCollegeId(prev => prev); // trigger reload
      })
      .catch(err => console.error(err));
  };

  // Cutoff Delete Handler
  const handleCutoffDelete = (id) => {
    if (!window.confirm('Delete this cutoff record?')) return;
    
    fetch(`/api/admin/cutoffs/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        setSelectedCollegeId(prev => prev); // trigger reload
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="container" style={{ paddingTop: '40px', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Admin Database Panel</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage engineering colleges, branches, and opening/closing cutoffs.
        </p>
      </div>

      {/* Tabs */}
      <div className="chance-group-tabs">
        <button className={`tab-btn ${activeTab === 'colleges' ? 'active' : ''}`} onClick={() => setActiveTab('colleges')}>
          <Layers size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-top' }} /> Colleges ({colleges.length})
        </button>
        <button className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
          <BookOpen size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-top' }} /> Manage Courses
        </button>
        <button className={`tab-btn ${activeTab === 'cutoffs' ? 'active' : ''}`} onClick={() => setActiveTab('cutoffs')}>
          <FileSpreadsheet size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-top' }} /> Manage Cutoffs
        </button>
      </div>

      {/* --- TAB 1: COLLEGES PANEL --- */}
      {activeTab === 'colleges' && (
        <div>
          <div className="flex-row-center" style={{ marginBottom: '20px' }}>
            <h3>Colleges Catalogue</h3>
            <button className="btn btn-primary" onClick={() => { resetCollegeForm(); setShowCollegeForm(true); }}>
              <Plus size={16} /> Add New College
            </button>
          </div>

          {showCollegeForm && (
            <div className="card" style={{ marginBottom: '30px', border: '2px dashed var(--primary)' }}>
              <h4 style={{ marginBottom: '20px' }}>{isEditingCollege ? 'Modify College Details' : 'Create New College Entry'}</h4>
              <form onSubmit={handleCollegeSubmit}>
                <div className="predictor-grid">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>College Name</label>
                    <input type="text" className="form-control" value={collegeForm.name} onChange={e => setCollegeForm({...collegeForm, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" className="form-control" value={collegeForm.city} onChange={e => setCollegeForm({...collegeForm, city: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input type="text" className="form-control" value={collegeForm.state} onChange={e => setCollegeForm({...collegeForm, state: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select className="form-control" value={collegeForm.type} onChange={e => setCollegeForm({...collegeForm, type: e.target.value})}>
                      <option value="IIT">IIT</option>
                      <option value="NIT">NIT</option>
                      <option value="IIIT">IIIT</option>
                      <option value="State Government">State Government</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>NIRF Rank</label>
                    <input type="number" className="form-control" value={collegeForm.nirf_rank} onChange={e => setCollegeForm({...collegeForm, nirf_rank: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>NAAC Grade</label>
                    <input type="text" className="form-control" value={collegeForm.naac_grade} onChange={e => setCollegeForm({...collegeForm, naac_grade: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Avg Package (LPA)</label>
                    <input type="number" step="0.01" className="form-control" value={collegeForm.average_package} onChange={e => setCollegeForm({...collegeForm, average_package: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Highest Package (LPA)</label>
                    <input type="number" step="0.01" className="form-control" value={collegeForm.highest_package} onChange={e => setCollegeForm({...collegeForm, highest_package: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Annual Tuition Fee (₹)</label>
                    <input type="number" className="form-control" value={collegeForm.tuition_fee} onChange={e => setCollegeForm({...collegeForm, tuition_fee: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Annual Hostel Fee (₹)</label>
                    <input type="number" className="form-control" value={collegeForm.hostel_fee} onChange={e => setCollegeForm({...collegeForm, hostel_fee: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Official Website</label>
                    <input type="url" className="form-control" value={collegeForm.website} onChange={e => setCollegeForm({...collegeForm, website: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Admission Application Link</label>
                    <input type="url" className="form-control" value={collegeForm.application_link} onChange={e => setCollegeForm({...collegeForm, application_link: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCollegeForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{isEditingCollege ? 'Save Updates' : 'Add College'}</button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <p>Loading catalog...</p>
          ) : (
            <div className="compare-container" style={{ marginTop: 0 }}>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>College Name</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>NIRF</th>
                    <th>Avg Package</th>
                    <th>Fees (Tuition)</th>
                    <th style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {colleges.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: '600' }}>{c.name}</td>
                      <td>{c.city}, {c.state}</td>
                      <td><span className="badge badge-blue">{c.type}</span></td>
                      <td>{c.nirf_rank ? `#${c.nirf_rank}` : 'N/A'}</td>
                      <td>{c.average_package ? `${c.average_package} LPA` : 'N/A'}</td>
                      <td>{c.tuition_fee ? `₹${(c.tuition_fee/100000).toFixed(2)} L/yr` : 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button className="btn-icon" onClick={() => handleEditClick(c)}><Edit size={14} /></button>
                          <button className="btn-icon" onClick={() => handleCollegeDelete(c.id)}><Trash2 size={14} color="var(--chance-reach)" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: COURSES PANEL --- */}
      {activeTab === 'courses' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '30px' }} className="grid-cols-1">
          {/* Left Course Form */}
          <div className="card" style={{ height: 'fit-content' }}>
            <h4 style={{ marginBottom: '20px' }}>Add Branch Course</h4>
            
            <div className="form-group">
              <label>Select College</label>
              <select className="form-control" value={selectedCollegeId} onChange={e => setSelectedCollegeId(e.target.value)}>
                {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <form onSubmit={handleCourseSubmit}>
              <div className="form-group">
                <label>Branch Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Computer Science & Engineering"
                  value={courseForm.course_name}
                  onChange={e => setCourseForm({...courseForm, course_name: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Duration (Years)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={courseForm.duration}
                  onChange={e => setCourseForm({...courseForm, duration: e.target.value})}
                  min="1" max="6"
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Branch</button>
            </form>
          </div>

          {/* Right Courses Table */}
          <div className="card">
            <h4 style={{ marginBottom: '20px' }}>Branch Catalogue</h4>
            <div className="compare-container" style={{ marginTop: 0 }}>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Branch / Course Name</th>
                    <th>Duration</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {collegeCourses.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No courses recorded for this college.</td>
                    </tr>
                  ) : (
                    collegeCourses.map(course => (
                      <tr key={course.id}>
                        <td style={{ fontWeight: '600' }}>{course.course_name}</td>
                        <td>{course.duration} Years</td>
                        <td>
                          <button className="btn-icon" onClick={() => handleCourseDelete(course.id)}>
                            <Trash2 size={14} color="var(--chance-reach)" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: CUTOFFS PANEL --- */}
      {activeTab === 'cutoffs' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '30px' }} className="grid-cols-1">
          {/* Left Form */}
          <div className="card" style={{ height: 'fit-content' }}>
            <h4 style={{ marginBottom: '20px' }}>Add Cutoff Entry</h4>
            
            <div className="form-group">
              <label>Select College</label>
              <select className="form-control" value={selectedCollegeId} onChange={e => setSelectedCollegeId(e.target.value)}>
                {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <form onSubmit={handleCutoffSubmit}>
              <div className="form-group">
                <label>Select Branch / Course</label>
                <select 
                  className="form-control" 
                  value={cutoffForm.course_id} 
                  onChange={e => setCutoffForm({...cutoffForm, course_id: e.target.value})}
                  required
                >
                  {collegeCourses.length === 0 && <option value="">-- Add a course first --</option>}
                  {collegeCourses.map(co => (
                    <option key={co.id} value={co.id}>{co.course_name}</option>
                  ))}
                </select>
              </div>

              <div className="predictor-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Entrance Exam</label>
                  <select className="form-control" value={cutoffForm.exam} onChange={e => setCutoffForm({...cutoffForm, exam: e.target.value})}>
                    <option value="JEE Main">JEE Main</option>
                    <option value="JEE Advanced">JEE Advanced</option>
                    <option value="MHT-CET">MHT-CET</option>
                    <option value="KCET">KCET</option>
                    <option value="EAMCET">EAMCET</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Category</label>
                  <select className="form-control" value={cutoffForm.category} onChange={e => setCutoffForm({...cutoffForm, category: e.target.value})}>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="EWS">EWS</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Year</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={cutoffForm.year} 
                  onChange={e => setCutoffForm({...cutoffForm, year: parseInt(e.target.value)})}
                  required 
                />
              </div>

              <div className="predictor-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Opening Rank</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={cutoffForm.opening_rank}
                    onChange={e => setCutoffForm({...cutoffForm, opening_rank: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Closing Rank</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={cutoffForm.closing_rank}
                    onChange={e => setCutoffForm({...cutoffForm, closing_rank: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Cutoff Record</button>
            </form>
          </div>

          {/* Right Cutoffs Table */}
          <div className="card">
            <h4 style={{ marginBottom: '20px' }}>Cutoff Rankings Catalogue</h4>
            <div className="compare-container" style={{ marginTop: 0 }}>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Exam</th>
                    <th>Category</th>
                    <th>Closing Rank</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {collegeCutoffs.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No cutoffs cataloged.</td>
                    </tr>
                  ) : (
                    collegeCutoffs.map(cu => (
                      <tr key={cu.id}>
                        <td style={{ fontWeight: '600' }}>{cu.course_name}</td>
                        <td><span className="badge badge-blue">{cu.exam}</span></td>
                        <td>{cu.category}</td>
                        <td style={{ fontWeight: '700' }}>{cu.closing_rank}</td>
                        <td>
                          <button className="btn-icon" onClick={() => handleCutoffDelete(cu.id)}>
                            <Trash2 size={14} color="var(--chance-reach)" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
