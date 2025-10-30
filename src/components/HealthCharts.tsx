import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { HealthAssessmentData } from '../lib/supabase';
import { generateHealthAnalysis } from '../lib/gemini';
import { Loader } from 'lucide-react';

interface HealthChartsProps {
  assessmentHistory: HealthAssessmentData[];
}

const HealthCharts: React.FC<HealthChartsProps> = ({ assessmentHistory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sortedHistory = [...assessmentHistory].sort(
    (a, b) =>
      new Date(a.assessment_date).getTime() -
      new Date(b.assessment_date).getTime()
  );

  const latestAssessment =
    sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1] : null;

  const trendData = sortedHistory.map((a) => ({
    date: new Date(a.assessment_date + 'T00:00:00').toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
    }),
    'Health Score': a.health_score,
    assessment_date: a.assessment_date,
  }));

  const last7 = sortedHistory.slice(-7);
  const avg7 = last7.length
    ? {
        sleep_hours: last7.reduce((s, a) => s + a.sleep_hours, 0) / last7.length,
        stress_level: last7.reduce((s, a) => s + a.stress_level, 0) / last7.length,
        exercise_frequency: last7.reduce((s, a) => s + a.exercise_frequency, 0) / last7.length,
        diet_quality: last7.reduce((s, a) => s + a.diet_quality, 0) / last7.length,
        social_connection: last7.reduce((s, a) => s + a.social_connection, 0) / last7.length,
        health_score: last7.reduce((s, a) => s + a.health_score, 0) / last7.length,
      }
    : null;

  const last30 = sortedHistory.slice(-30);
  const avg30 = last30.length >= 30
    ? {
        sleep_hours: last30.reduce((s, a) => s + a.sleep_hours, 0) / last30.length,
        stress_level: last30.reduce((s, a) => s + a.stress_level, 0) / last30.length,
        exercise_frequency: last30.reduce((s, a) => s + a.exercise_frequency, 0) / last30.length,
        diet_quality: last30.reduce((s, a) => s + a.diet_quality, 0) / last30.length,
        social_connection: last30.reduce((s, a) => s + a.social_connection, 0) / last30.length,
        health_score: last30.reduce((s, a) => s + a.health_score, 0) / last30.length,
      }
    : null;

  const todayRadarData = latestAssessment ? [
    { subject: 'Sleep', A: latestAssessment.sleep_hours, fullMark: 9 },
    { subject: 'Stress', A: 6 - latestAssessment.stress_level, fullMark: 5 },
    { subject: 'Exercise', A: latestAssessment.exercise_frequency, fullMark: 5 },
    { subject: 'Diet', A: latestAssessment.diet_quality, fullMark: 5 },
    { subject: 'Social', A: latestAssessment.social_connection, fullMark: 5 },
  ] : [];

  const radarData7 = avg7 ? [
    { subject: 'Sleep', A: avg7.sleep_hours, fullMark: 9 },
    { subject: 'Stress', A: 6 - avg7.stress_level, fullMark: 5 },
    { subject: 'Exercise', A: avg7.exercise_frequency, fullMark: 5 },
    { subject: 'Diet', A: avg7.diet_quality, fullMark: 5 },
    { subject: 'Social', A: avg7.social_connection, fullMark: 5 },
  ] : [];

  const fetchInsights = async () => {
    setLoading(true);
    setAiInsights(null);
    try {
      const insights = await generateHealthAnalysis(latestAssessment, avg7, avg30);
      setAiInsights(insights);
    } catch (error) {
      setAiInsights("⚠️ Failed to fetch AI insights.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-5 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {/* Trend Chart */}
        <div
          className="lg:col-span-3 glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg cursor-pointer hover:scale-[1.02] transition"
          onClick={() => setIsModalOpen(true)}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Health Score Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="date" stroke="#4B5563" />
              <YAxis stroke="#4B5563" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Health Score" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Today Overview */}
        <div
          className="lg:col-span-2 glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg cursor-pointer hover:scale-[1.02] transition"
          onClick={() => setIsModalOpen(true)}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Today's Assessment Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={todayRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
              <Radar name="Today" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-5xl w-full p-6 overflow-y-auto max-h-[90vh] shadow-2xl"
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Detailed Insights</h2>
                <button
                  className="text-gray-500 hover:text-gray-800 text-lg font-semibold"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              {/* Full Trend */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Full Health Score Trend</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={trendData}>
                    <CartesianGrid />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Health Score" stroke="#6366F1" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 7-Day Radar */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">7-Day Average Wellness Radar</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData7}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
                    <Radar name="7-Day Avg" dataKey="A" stroke="#6366F1" fill="#6366F1" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* AI Insights */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">AI Health Insights</h3>
                {loading ? (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Analyzing your health data...</span>
                  </div>
                ) : aiInsights ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800 whitespace-pre-line prose prose-sm">
                    {aiInsights}
                  </div>
                ) : (
                  <button
                    onClick={fetchInsights}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
                  >
                    Generate AI Insights
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HealthCharts;
