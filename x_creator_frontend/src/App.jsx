import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import PostGenerator from './components/PostGenerator';
import Dashboard from './components/Dashboard';
import './App.css';




function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token') || '');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">
          <Routes>
            <Route path="/" element={<PostGenerator setToken={setToken} />} />
            <Route
              path="/dashboard"
              element={token ? <Dashboard setToken={setToken} /> : <Navigate to="/" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-white py-8 mt-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-gray-400">
              © 2025 X-Creator. Propulsé par l'intelligence artificielle.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;