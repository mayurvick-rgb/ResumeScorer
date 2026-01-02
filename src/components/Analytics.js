import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Target, Award, Users, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { scoringAPI, resumeAPI } from '../services/api';

const Analytics = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const fetchAllData = async () => {
    try {
      const [resumeRes, scoresRes] = await Promise.all([
        resumeAPI.getAnalysis(id),
        scoringAPI.getResumeScores(id).catch(() => ({ data: [] }))
      ]);
      
      setResume(resumeRes.data);
      setScores(scoresRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!scores.length) {
      return {
        totalJobs: 0,
        averageScore: 0,
        bestScore: 0,
        improvement: 0
      };
    }

    const totalJobs = scores.length;
    const averageScore = scores.reduce((sum, score) => sum + score.overall_score, 0) / totalJobs;
    const bestScore = Math.max(...scores.map(score => score.overall_score));
    const worstScore = Math.min(...scores.map(score => score.overall_score));
    const improvement = bestScore - worstScore;

    return {
      totalJobs,
      averageScore: Math.round(averageScore),
      bestScore: Math.round(bestScore),
      improvement: Math.round(improvement)
    };
  };

  const getScoreDistribution = () => {
    if (!scores.length) return [];

    const ranges = [
      { range: 'Poor (0-40%)', min: 0, max: 40, count: 0, color: 'bg-red-500', description: 'Needs significant improvement' },
      { range: 'Fair (41-60%)', min: 41, max: 60, count: 0, color: 'bg-orange-500', description: 'Room for improvement' },
      { range: 'Good (61-80%)', min: 61, max: 80, count: 0, color: 'bg-blue-500', description: 'Strong match' },
      { range: 'Excellent (81-100%)', min: 81, max: 100, count: 0, color: 'bg-green-500', description: 'Perfect match' }
    ];

    scores.forEach(score => {
      const overallScore = score.overall_score;
      ranges.forEach(range => {
        if (overallScore >= range.min && overallScore <= range.max) {
          range.count++;
        }
      });
    });

    return ranges.filter(range => range.count > 0 || scores.length === 0);
  };

  const getTopSkills = () => {
    if (!resume?.analysis?.skills) return [];
    
    // Calculate actual skill frequency based on job matches
    const skillFrequency = {};
    
    // Count how often each skill appears in job requirements
    scores.forEach(score => {
      if (score.job_post?.skills_required) {
        score.job_post.skills_required.forEach(requiredSkill => {
          resume.analysis.skills.forEach(userSkill => {
            if (userSkill.toLowerCase().includes(requiredSkill.toLowerCase()) || 
                requiredSkill.toLowerCase().includes(userSkill.toLowerCase())) {
              skillFrequency[userSkill] = (skillFrequency[userSkill] || 0) + 1;
            }
          });
        });
      }
    });
    
    // If no job matches, show all skills with equal weight
    if (Object.keys(skillFrequency).length === 0) {
      return resume.analysis.skills.slice(0, 8).map(skill => ({
        name: skill,
        frequency: 100
      }));
    }
    
    // Calculate percentage based on total jobs analyzed
    const totalJobs = scores.length;
    return Object.entries(skillFrequency)
      .map(([skill, count]) => ({
        name: skill,
        frequency: Math.round((count / totalJobs) * 100)
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 8);
  };

  const getMissingSkills = () => {
    if (!scores.length) return [];
    
    const allMissingSkills = [];
    scores.forEach(score => {
      if (score.missing_skills) {
        allMissingSkills.push(...score.missing_skills);
      }
    });

    const skillCount = {};
    allMissingSkills.forEach(skill => {
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    });

    return Object.entries(skillCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([skill, count]) => ({ name: skill, jobs: count }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const generateDynamicRecommendations = () => {
    if (!scores.length) {
      return [
        {
          title: 'Start Job Analysis',
          description: 'Search and analyze jobs to get personalized recommendations based on your resume'
        }
      ];
    }

    const recommendations = [];
    const avgATS = scores.reduce((sum, s) => sum + s.ats_score, 0) / scores.length;
    const avgSkills = scores.reduce((sum, s) => sum + s.skill_match_score, 0) / scores.length;
    const avgExp = scores.reduce((sum, s) => sum + s.experience_score, 0) / scores.length;
    const topMissingSkills = getMissingSkills().slice(0, 3).map(s => s.name);

    if (avgATS < 60) {
      recommendations.push({
        title: 'Improve ATS Compatibility',
        description: `Your average ATS score is ${Math.round(avgATS)}%. Add more relevant keywords from job descriptions to your resume.`
      });
    }

    if (avgSkills < 70 && topMissingSkills.length > 0) {
      recommendations.push({
        title: 'Develop Key Skills',
        description: `Focus on learning: ${topMissingSkills.join(', ')}. These skills appear frequently in your target jobs.`
      });
    }

    if (avgExp < 60) {
      recommendations.push({
        title: 'Highlight Experience Better',
        description: `Your experience score is ${Math.round(avgExp)}%. Better showcase your projects, internships, and relevant work experience.`
      });
    }

    if (scores.length < 5) {
      recommendations.push({
        title: 'Analyze More Jobs',
        description: 'Analyze more job postings to get better insights and improve your resume targeting.'
      });
    }

    const bestScore = Math.max(...scores.map(s => s.overall_score));
    if (bestScore > 80) {
      recommendations.push({
        title: 'Apply to High-Match Jobs',
        description: `You have ${scores.filter(s => s.overall_score > 80).length} jobs with 80%+ match. Focus on applying to these positions.`
      });
    }

    return recommendations.length > 0 ? recommendations : [
      {
        title: 'Great Progress!',
        description: 'Your resume shows good alignment with job requirements. Keep analyzing more positions to find the best matches.'
      }
    ];
  };

  const stats = calculateStats();
  const scoreDistribution = getScoreDistribution();
  const topSkills = getTopSkills();
  const missingSkills = getMissingSkills();
  const dynamicRecommendations = generateDynamicRecommendations();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Resume Analytics</h1>
            <Link
              to={`/results/${id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Results
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resume Overview */}
        {resume && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Resume Profile</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Profile</p>
                <p className="font-medium">{resume.resume?.user_email || resume.user_email}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Skills Identified</p>
                <p className="font-medium">{resume.analysis?.skills?.length || 0} skills</p>
                <p className="text-xs text-gray-500">
                  {resume.analysis?.skills?.length > 10 ? 'Comprehensive' : 
                   resume.analysis?.skills?.length > 5 ? 'Good coverage' : 'Limited skills'}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Experience Level</p>
                <p className="font-medium">{resume.analysis?.experience_years || 0} years</p>
                <p className="text-xs text-gray-500">
                  {resume.analysis?.experience_years >= 5 ? 'Senior' : 
                   resume.analysis?.experience_years >= 2 ? 'Mid-level' : 'Entry-level'}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600">Analysis Date</p>
                <p className="font-medium">{new Date(resume.resume?.uploaded_at || resume.uploaded_at).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500">
                  {scores.length} job{scores.length !== 1 ? 's' : ''} analyzed
                </p>
              </div>
            </div>
            
            {/* Resume Insights */}
            {resume.analysis?.skills && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Resume Insights</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-800">
                      <strong>Skill Diversity:</strong> {resume.analysis.skills.length} unique skills detected
                    </p>
                    <p className="text-blue-700 mt-1">
                      Top skills: {resume.analysis.skills.slice(0, 3).join(', ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-800">
                      <strong>Experience Match:</strong> {resume.analysis.experience_years > 0 ? 
                        `${resume.analysis.experience_years} years professional experience` : 
                        'Experience level not clearly specified'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Performance Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-blue-600">{stats.averageScore}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Best Match</p>
                <p className="text-2xl font-bold text-green-600">{stats.bestScore}%</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jobs Analyzed</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalJobs}</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Improvement</p>
                <p className="text-2xl font-bold text-orange-600">+{stats.improvement}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Skills Analysis */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Your Top Skills</h3>
            <div className="space-y-3">
              {topSkills.length > 0 ? topSkills.map((skill, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{skill.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${skill.frequency}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{skill.frequency}%</span>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">No skills found in resume</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Skills to Improve</h3>
            <div className="space-y-2">
              {missingSkills.length > 0 ? missingSkills.map((skill, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-gray-700 capitalize">{skill.name}</span>
                  </div>
                  <span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded">
                    {skill.jobs} job{skill.jobs > 1 ? 's' : ''}
                  </span>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">Analyze some jobs to see missing skills</p>
              )}
            </div>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Performance Distribution</h3>
          {scoreDistribution.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {scoreDistribution.map((range, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                  <div className={`w-16 h-16 ${range.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <span className="text-white font-bold text-xl">{range.count}</span>
                  </div>
                  <p className="font-medium text-gray-900 mb-1">{range.range}</p>
                  <p className="text-xs text-gray-500 mb-2">{range.count} job{range.count !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-gray-600">{range.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No job analysis data available</p>
            </div>
          )}
        </div>

        {/* Recent Job Scores */}
        {scores.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Recent Job Applications</h3>
            <div className="space-y-4">
              {scores.slice(0, 5).map((score, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{score.job_title || 'Job Title'}</h4>
                      <p className="text-gray-600">{score.company || 'Company'}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="text-xl font-bold">{Math.round(score.overall_score)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">ATS Score</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${score.ats_score}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{Math.round(score.ats_score)}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-600">Skills</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-green-600 h-1.5 rounded-full" 
                            style={{ width: `${score.skill_match_score}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{Math.round(score.skill_match_score)}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-600">Experience</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-purple-600 h-1.5 rounded-full" 
                            style={{ width: `${score.experience_score}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{Math.round(score.experience_score)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Recommendations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Personalized Recommendations</h3>
          <div className="space-y-4">
            {dynamicRecommendations.map((rec, index) => {
              const colors = ['border-blue-500', 'border-green-500', 'border-purple-500', 'border-orange-500', 'border-red-500'];
              return (
                <div key={index} className={`border-l-4 ${colors[index % colors.length]} pl-4 py-2`}>
                  <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  <p className="text-gray-600">{rec.description}</p>
                </div>
              );
            })}
            
            {scores.length === 0 && (
              <div className="text-center py-8">
                <Link
                  to={`/results/${id}`}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Analyze Jobs Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;