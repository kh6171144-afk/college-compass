import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EduGuideChatbot from './components/EduGuideChatbot';
import Home from './pages/Home';
import CollegePredictor from './pages/CollegePredictor';
import CoursePredictor from './pages/CoursePredictor';
import CompareColleges from './pages/CompareColleges';
import SearchColleges from './pages/SearchColleges';
import CollegeDetails from './pages/CollegeDetails';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';

export default function App() {
  const [currentPage, setCurrentPageState] = useState('home');
  const [selectedCollegeId, setSelectedCollegeId] = useState(null);
  const [compareList, setCompareList] = useState([]);
  
  // Authentication states
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Load and validate session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      
      // Verify token with backend
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Session expired');
        return res.json();
      })
      .then(data => {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      })
      .catch(() => {
        handleLogout();
      });
    }
  }, []);

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.hash = '#home';
  };

  const triggerSignIn = () => {
    window.location.hash = '#auth';
  };

  // Hash-based client routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#home';
      
      if (hash.startsWith('#details/')) {
        const id = hash.split('/')[1];
        setSelectedCollegeId(id);
        setCurrentPageState('details');
      } else {
        const page = hash.replace('#', '');
        const validPages = ['home', 'predictor', 'course', 'compare', 'search', 'about', 'admin', 'auth', 'onboarding'];
        if (validPages.includes(page)) {
          if (page === 'admin') {
            const localUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
            if (!localUser || localUser.role !== 'admin') {
              window.location.hash = '#home';
              return;
            }
          }
          setCurrentPageState(page);
        } else {
          setCurrentPageState('home');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Custom setter to update URL hash
  const setCurrentPage = (pageId) => {
    if (pageId === 'details' && selectedCollegeId) {
      window.location.hash = `details/${selectedCollegeId}`;
    } else {
      window.location.hash = pageId;
    }
    setCurrentPageState(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectCollegeForDetails = (id) => {
    setSelectedCollegeId(id);
    window.location.hash = `details/${id}`;
    setCurrentPageState('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Render Page Selection
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home
            setCurrentPage={setCurrentPage}
            setSelectedCollegeId={selectCollegeForDetails}
            compareList={compareList}
            setCompareList={setCompareList}
          />
        );
      case 'predictor':
        return (
          <CollegePredictor
            setCurrentPage={setCurrentPage}
            setSelectedCollegeId={selectCollegeForDetails}
          />
        );
      case 'course':
        return (
          <CoursePredictor
            setCurrentPage={setCurrentPage}
            setSelectedCollegeId={selectCollegeForDetails}
          />
        );
      case 'compare':
        return (
          <CompareColleges
            compareList={compareList}
            setCompareList={setCompareList}
            setCurrentPage={setCurrentPage}
            setSelectedCollegeId={selectCollegeForDetails}
          />
        );
      case 'search':
        return (
          <SearchColleges
            setCurrentPage={setCurrentPage}
            setSelectedCollegeId={selectCollegeForDetails}
            compareList={compareList}
            setCompareList={setCompareList}
          />
        );
      case 'details':
        return (
          <CollegeDetails
            collegeId={selectedCollegeId}
            setCurrentPage={setCurrentPage}
            onCompareToggle={handleCompareToggle}
            isCompared={!!compareList.find(c => c.id?.toString() === selectedCollegeId?.toString())}
            user={user}
            token={token}
            onSignInTrigger={triggerSignIn}
          />
        );
      case 'admin':
        return <AdminDashboard />;
      case 'about':
        return <About />;
      case 'auth':
        return <AuthPage onLoginSuccess={handleLoginSuccess} />;
      case 'onboarding':
        return (
          <OnboardingPage
            token={token}
            onPreferencesSaved={(updatedUser) => {
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }}
          />
        );
      default:
        return (
          <Home
            setCurrentPage={setCurrentPage}
            setSelectedCollegeId={selectCollegeForDetails}
            compareList={compareList}
            setCompareList={setCompareList}
          />
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        user={user} 
        onLogout={handleLogout} 
        onSignInClick={triggerSignIn} 
      />
      
      <main style={{ flex: '1 0 auto' }}>
        {renderPage()}
      </main>

      <Footer setCurrentPage={setCurrentPage} />
      
      <EduGuideChatbot />
    </div>
  );
}
