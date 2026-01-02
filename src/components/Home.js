import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Target, BarChart3, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Resume Scorer</h1>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered ATS Resume Analysis
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Optimize your resume for the Indian job market with intelligent scoring, 
            job matching, and personalized recommendations.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Resume Analysis</h3>
            <p className="text-gray-600">Upload and analyze your resume with AI-powered text extraction</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">ATS Scoring</h3>
            <p className="text-gray-600">Get detailed compatibility scores for job applications</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Job Matching</h3>
            <p className="text-gray-600">Search jobs from multiple platforms and analyze fit</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <BarChart3 className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">View comprehensive insights and improvement suggestions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;