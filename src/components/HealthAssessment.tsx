import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  ArrowLeft,
  Save,
  Heart,
  Activity,
  Brain,
  Users,
  Moon,
  Calendar as CalendarIcon,
  Trash2,
} from 'lucide-react';

const questions = [
  {
    id: 'sleep_hours',
    text: 'How many hours of sleep do you get on average?',
    icon: Moon,
    options: [
      { label: '< 5 hours', value: 4 },
      { label: '5-6 hours', value: 5 },
      { label: '7-8 hours', value: 8 },
      { label: 'More than 8 hours', value: 9 },
    ],
  },
  {
    id: 'stress_level',
    text: 'On a scale of 1-5, how would you rate your average stress level?',
    icon: Brain,
    options: [
      { label: '1 (Very Low)', value: 1 },
      { label: '2 (Low)', value: 2 },
      { label: '3 (Moderate)', value: 3 },
      { label: '4 (High)', value: 4 },
      { label: '5 (Very High)', value: 5 },
    ],
  },
  {
    id: 'exercise_frequency',
    text: 'How often do you engage in moderate exercise per week?',
    icon: Activity,
    options: [
      { label: 'Never', value: 0 },
      { label: '1-2 times', value: 1 },
      { label: '3-4 times', value: 3 },
      { label: '5 or more times', value: 5 },
    ],
  },
  {
    id: 'diet_quality',
    text: 'On a scale of 1-5, how would you rate the quality of your diet?',
    icon: Heart,
    options: [
      { label: '1 (Poor)', value: 1 },
      { label: '2 (Fair)', value: 2 },
      { label: '3 (Good)', value: 3 },
      { label: '4 (Very Good)', value: 4 },
      { label: '5 (Excellent)', value: 5 },
    ],
  },
  {
    id: 'social_connection',
    text: 'On a scale of 1-5, how socially connected do you feel?',
    icon: Users,
    options: [
      { label: '1 (Isolated)', value: 1 },
      { label: '2 (Slightly Isolated)', value: 2 },
      { label: '3 (Moderately Connected)', value: 3 },
      { label: '4 (Connected)', value: 4 },
      { label: '5 (Very Connected)', value: 5 },
    ],
  },
];

const HealthAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [assessmentDate, setAssessmentDate] = useState<Date>(today);
  const [answers, setAnswers] = useState<Record<string, number | null>>({
    sleep_hours: null,
    stress_level: null,
    exercise_frequency: null,
    diet_quality: null,
    social_connection: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const calculateHealthScore = (): number => {
    const { sleep_hours, stress_level, exercise_frequency, diet_quality, social_connection } = answers;
    if (Object.values(answers).some((a) => a === null)) return 0;

    const sleepScore = sleep_hours! >= 7 && sleep_hours! <= 9 ? 20 : sleep_hours! >= 5 ? 10 : 5;
    const stressScore = (5 - stress_level!) * 5;
    const exerciseScore = exercise_frequency! * 4;
    const dietScore = diet_quality! * 4;
    const socialScore = social_connection! * 4;

    return Math.min(100, Math.round(sleepScore + stressScore + exerciseScore + dietScore + socialScore));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(answers).some((a) => a === null)) {
      toast.error('Please answer all questions.');
      return;
    }
    setLoading(true);

    try {
      // ✅ Format in local time (fixes previous day issue)
      const formattedDate = assessmentDate.toLocaleDateString('en-CA');

      const { data: existing, error: fetchError } = await supabase
        .from('health_assessments')
        .select('id')
        .eq('user_id', user!.id)
        .eq('assessment_date', formattedDate)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      const health_score = calculateHealthScore();
      const payload = {
        ...answers,
        health_score,
      };

      if (existing) {
        const { error } = await supabase
          .from('health_assessments')
          .update(payload)
          .eq('id', existing.id);
        if (error) throw error;
        toast.success(`Assessment for ${formattedDate} updated! New score: ${health_score}`);
      } else {
        const insertPayload = {
          ...payload,
          user_id: user!.id,
          assessment_date: formattedDate,
        };
        const { error } = await supabase.from('health_assessments').insert(insertPayload);
        if (error) throw error;
        toast.success(`Health assessment saved! Your score is ${health_score}`);
      }

      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save assessment.');
      console.error('Error saving assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete ALL your health assessment data? This will clear all chart history and cannot be undone.')) {
        return;
    }
    setLoading(true);
    try {
        const { error } = await supabase
            .from('health_assessments')
            .delete()
            .eq('user_id', user.id);

        if (error) throw error;
        toast.success('All health assessment data has been deleted.');
        navigate('/dashboard');
    } catch (error) {
        toast.error('Failed to clear health data.');
        console.error('Error clearing data:', error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="p-6">
        <motion.div
          className="glass bg-white/30 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 max-w-4xl mx-auto shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="glass bg-white/20 hover:bg-white/30 text-gray-700 p-2 rounded-xl border border-white/20 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <span className="text-xl font-bold text-gray-800">Health Assessment</span>
          </div>
        </motion.div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div
            className="glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg relative z-50"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Assessment Date</h3>
            </div>
            <DatePicker
              selected={assessmentDate}
              onChange={(date: Date) => setAssessmentDate(date)}
              dateFormat="yyyy-MM-dd"
              popperClassName="z-50"
              portalId="root"
              className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/40 text-gray-800 font-medium shadow-sm focus:ring focus:ring-green-300"
            />
          </motion.div>

          {questions.map((q, index) => (
            <motion.div
              key={q.id}
              className="glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <q.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{q.text}</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {q.options.map((opt) => (
                  <motion.button
                    key={opt.value}
                    type="button"
                    onClick={() => handleAnswerChange(q.id, opt.value)}
                    className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                      answers[q.id] === opt.value
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                        : 'bg-white/30 hover:bg-white/50 border-white/30 text-gray-700'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}

          <motion.div
            className="flex flex-col sm:flex-row justify-end gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.button
              type="button"
              onClick={handleClearAllData}
              disabled={loading}
              className="flex items-center justify-center space-x-2 glass bg-red-100/40 hover:bg-red-200/40 text-red-600 py-3 px-6 rounded-xl border border-red-200/30 transition-all duration-300 font-medium shadow-lg"
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              <Trash2 className="w-5 h-5" />
              <span>Clear All Data</span>
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center space-x-2 glass bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl border border-white/20 transition-all duration-300 font-medium shadow-lg"
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : 'Save Assessment'}</span>
            </motion.button>
          </motion.div>
        </form>
      </main>
    </div>
  );
};

export default HealthAssessment;
