import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  History,
  User,
  LogOut,
  Heart,
  Activity,
  BrainCircuit,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase, type HealthAssessmentData, type Profile } from '../lib/supabase';
import toast from 'react-hot-toast';
import Footer from './Footer';
import HealthCharts from './HealthCharts';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [assessmentHistory, setAssessmentHistory] = useState<HealthAssessmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState<string | null>(null);

  const loadProfile = async () => {
    if (!user) return;
    try {
      setProfileName(null);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) setProfileName(data.full_name);
    } catch (err) {
      console.error('Error loading profile name:', err);
    }
  };

  const loadAssessmentData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('health_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAssessmentHistory(data || []);
    } catch (error) {
      console.error('Error loading assessment data:', error);
      toast.error('Failed to load health data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
      loadAssessmentData();

      const healthChannel = supabase
        .channel('public:health_assessments')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'health_assessments', filter: `user_id=eq.${user.id}` },
          () => {
            loadAssessmentData();
          }
        )
        .subscribe();

      const profileChannel = supabase
        .channel(`profile-dashboard-updates:${user.id}`)
        .on<Profile>(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            setProfileName(payload.new.full_name);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(healthChannel);
        supabase.removeChannel(profileChannel);
      };
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const latestAssessment =
    assessmentHistory.length > 0 ? assessmentHistory[assessmentHistory.length - 1] : null;

  const generateSuggestion = (metric: string, value: number | null) => {
    if (value === null) return 'No data yet';

    switch (metric) {
      case 'health_score':
        if (value >= 80) return 'Excellent health score — keep it up!';
        if (value >= 60) return 'Good, but room for improvement.';
        return 'Focus on healthier habits to boost your score.';
      case 'exercise_frequency':
        if (value >= 4) return 'Great exercise routine!';
        if (value >= 2) return 'Try to be more consistent.';
        return 'Aim for regular physical activity.';
      case 'sleep_hours':
        if (value >= 7 && value <= 9) return 'Optimal sleep range.';
        if (value < 6) return 'Consider improving sleep quality.';
        return 'Good, but avoid oversleeping.';
      case 'stress_level':
        if (value <= 2) return 'Stress well managed.';
        if (value === 3) return 'Moderate stress, stay mindful.';
        return 'High stress — consider relaxation techniques.';
      default:
        return 'Keep tracking your progress.';
    }
  };

  const statsData = [
    {
      icon: Heart,
      label: 'Health Score',
      value: latestAssessment ? `${latestAssessment.health_score}` : 'N/A',
      trend: generateSuggestion('health_score', latestAssessment?.health_score ?? null),
    },
    {
      icon: Activity,
      label: 'Exercise',
      value: latestAssessment ? `${latestAssessment.exercise_frequency}x/week` : 'N/A',
      trend: generateSuggestion('exercise_frequency', latestAssessment?.exercise_frequency ?? null),
    },
    {
      icon: ShieldCheck,
      label: 'Sleep',
      value: latestAssessment ? `${latestAssessment.sleep_hours} hrs` : 'N/A',
      trend: generateSuggestion('sleep_hours', latestAssessment?.sleep_hours ?? null),
    },
    {
      icon: BrainCircuit,
      label: 'Stress Level',
      value: latestAssessment ? `${latestAssessment.stress_level}/5` : 'N/A',
      trend: generateSuggestion('stress_level', latestAssessment?.stress_level ?? null),
    },
  ];

  const quickActions = [
    {
      title: 'Start New Conversation',
      description: 'Ask about fitness, nutrition, mental health, or wellness',
      icon: MessageCircle,
      action: () => navigate('/chat'),
      gradient: 'from-blue-500 to-cyan-500',
      highlight: true,
    },
    {
      title: 'Take Health Assessment',
      description: 'Complete a quick check-up to update your health score and track progress.',
      icon: Heart,
      action: () => navigate('/assessment'),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Explore Health Tools',
      description: 'Discover apps and platforms for affordable healthcare, fitness, and nutrition.',
      icon: Smartphone,
      action: () => navigate('/tools'),
      gradient: 'from-teal-500 to-green-500',
    },
    {
      title: 'Mental Health & Well-being',
      description: 'Access articles, exercises, and resources for your well-being.',
      icon: BrainCircuit,
      action: () => navigate('/mental-health'),
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'View Chat History',
      description: 'Review your previous conversations with our AI assistant.',
      icon: History,
      action: () => navigate('/history'),
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="min-h-screen">
      <nav className="p-6">
        <motion.div
          className="glass bg-white/30 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 max-w-7xl mx-auto shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">Velym AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigate('/profile')}
                className="glass bg-white/20 hover:bg-white/30 text-gray-700 p-2 rounded-xl border border-white/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <User className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={handleSignOut}
                className="glass bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-xl border border-red-200 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Welcome back{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {profileName ?? '...'}
            </span>
          </h1>
          <p className="text-xl text-gray-600">Your personalised health journey continues here.</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
              <p className="text-green-600 text-xs">{stat.trend}</p>
            </motion.div>
          ))}
        </motion.div>

        {loading ? (
          <div className="text-center py-10">Loading health data...</div>
        ) : assessmentHistory.length > 0 ? (
          <HealthCharts assessmentHistory={assessmentHistory} />
        ) : (
          <motion.div
            className="text-center py-12 glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Start Your Health Journey</h3>
            <p className="text-gray-600 mb-6">
              Take your first health assessment to see your score and track your progress.
            </p>
            <motion.button
              onClick={() => navigate('/assessment')}
              className="glass bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl border border-white/20 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Take Assessment Now
            </motion.button>
          </motion.div>
        )}

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              onClick={action.action}
              className={`glass backdrop-blur-lg border border-white/20 rounded-2xl p-6 cursor-pointer group shadow-lg relative transition-all ${
                action.highlight
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-400/40 animate-pulse'
                  : 'bg-white/20'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`${
                  action.highlight ? 'w-16 h-16' : 'w-12 h-12'
                } bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <action.icon className="w-7 h-7 text-white" />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  action.highlight ? 'text-white' : 'text-gray-800'
                }`}
              >
                {action.title}
              </h3>
              <p
                className={`${
                  action.highlight ? 'text-white/90' : 'text-gray-600'
                } leading-relaxed`}
              >
                {action.description}
              </p>
              {action.highlight && (
                <span className="absolute top-3 right-3 text-xs bg-white/30 text-white px-2 py-1 rounded-full shadow-md">
                  AI Assistance
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
