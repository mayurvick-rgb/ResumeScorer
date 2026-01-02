import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Upload from './components/Upload';
import Results from './components/Results';
import Analytics from './components/Analytics';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/analytics/:id" element={<Analytics />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;