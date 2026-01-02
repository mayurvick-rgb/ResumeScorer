import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, MapPin, Building, Star, BarChart3 } from 'lucide-react';
import { resumeAPI, jobsAPI, scoringAPI } from '../services/api';

const Results = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [scores, setScores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchResumeData();
  }, [id]);

  const fetchResumeData = async () => {
    try {
      const response = await resumeAPI.getAnalysis(id);
      setResume(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch resume data:', error);
      setLoading(false);
    }
  };

  const searchJobs = async () => {
    if (!searchQuery) return;
    
    setSearching(true);
    try {
      const response = await jobsAPI.search(searchQuery, location);
      setJobs(response.data.results || response.data.jobs || []);
    } catch (error) {
      console.error('Job search failed:', error);
      alert('Job search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const calculateScores = async () => {
    if (selectedJobs.length === 0) return;

    try {
      const response = await scoringAPI.calculate(id, selectedJobs);
      setScores(response.data.scores || []);
    } catch (error) {
      console.error('Score calculation failed:', error);
    }
  };

  const toggleJobSelection = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resume analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Resume Analysis Results</h1>
            <div className="flex gap-3">
              <Link
                to="/"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Home
              </Link>
              <Link
                to={`/analytics/${id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Analytics
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resume Summary */}
        {resume && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Resume Summary</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{resume.resume?.user_email || resume.user_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Skills Found</p>
                <p className="font-medium">{resume.analysis?.skills?.length || 0} skills</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Upload Date</p>
                <p className="font-medium">{new Date(resume.resume?.uploaded_at || resume.uploaded_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Job Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Search Jobs</h2>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Job title or keywords"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={searchJobs}
              disabled={searching}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
            >
              {searching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Searching...
                </>
              ) : (
                'Search Jobs'
              )}
            </button>
          </div>

          {/* Job Results */}
          {jobs.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Select jobs to analyze ({selectedJobs.length} selected):</h3>
                {selectedJobs.length > 0 && (
                  <button
                    onClick={() => setSelectedJobs([])}
                    className="text-sm text-red-600 hover:text-red-700 underline"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedJobs.includes(job.id) 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleJobSelection(job.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedJobs.includes(job.id)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedJobs.includes(job.id) && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <h4 className="font-semibold text-lg text-gray-900">{job.title}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-gray-600 ml-8">
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                      </div>
                      {job.salary_range && (
                        <p className="text-sm text-green-600 ml-8 mt-1">💰 {job.salary_range}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        job.platform === 'naukri' ? 'bg-blue-100 text-blue-700' :
                        job.platform === 'linkedin' ? 'bg-blue-100 text-blue-700' :
                        job.platform === 'indeed' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {job.platform}
                      </span>
                      {selectedJobs.includes(job.id) && (
                        <span className="text-xs text-blue-600 font-medium">✓ Selected</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {selectedJobs.length > 0 && (
                <div className="flex gap-4">
                  <button
                    onClick={calculateScores}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Calculate ATS Scores ({selectedJobs.length} jobs)
                  </button>
                  {scores.length > 0 && (
                    <Link
                      to={`/analytics/${id}`}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                    >
                      View Analytics
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ATS Scores Results */}
        {scores.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">ATS Analysis Results</h2>
              <Link
                to={`/analytics/${id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Complete Analytics
              </Link>
            </div>
            
            <div className="space-y-6">
              {scores.map((score, index) => (
                <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{score.job_title || 'Job Title'}</h4>
                      <p className="text-gray-600 flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {score.company || 'Company'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-6 h-6 text-yellow-500" />
                        <span className="text-3xl font-bold text-gray-900">{Math.round(score.overall_score)}%</span>
                      </div>
                      <p className="text-sm text-gray-500">Overall Match</p>
                    </div>
                  </div>
                  
                  {/* Detailed Score Breakdown */}
                  <div className="grid md:grid-cols-3 gap-6 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <p className="font-medium text-gray-700">ATS Compatibility</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${score.ats_score}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-blue-600">{Math.round(score.ats_score)}%</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Keyword matching & format</p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <p className="font-medium text-gray-700">Skills Match</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-green-600 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${score.skill_match_score}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-green-600">{Math.round(score.skill_match_score)}%</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Required skills alignment</p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                        <p className="font-medium text-gray-700">Experience Level</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-purple-600 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${score.experience_score}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-purple-600">{Math.round(score.experience_score)}%</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Experience requirements</p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {score.recommendations && score.recommendations.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">💡 Recommendations</h5>
                      <ul className="space-y-1">
                        {score.recommendations.slice(0, 2).map((rec, idx) => (
                          <li key={idx} className="text-sm text-gray-700">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {score.missing_skills && score.missing_skills.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">🎯 Skills to Develop</h5>
                      <div className="flex flex-wrap gap-2">
                        {score.missing_skills.slice(0, 5).map((skill, idx) => (
                          <span key={idx} className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm capitalize">
                            {skill}
                          </span>
                        ))}
                        {score.missing_skills.length > 5 && (
                          <span className="text-red-600 text-sm">+{score.missing_skills.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Summary Stats */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{Math.round(scores.reduce((sum, s) => sum + s.overall_score, 0) / scores.length)}%</p>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{Math.max(...scores.map(s => Math.round(s.overall_score)))}%</p>
                  <p className="text-sm text-gray-600">Best Match</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{scores.length}</p>
                  <p className="text-sm text-gray-600">Jobs Analyzed</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;