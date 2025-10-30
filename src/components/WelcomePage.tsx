import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Brain, Activity, Shield, ArrowRight, Sparkles, Flame} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Footer from './Footer';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Get personalised health advice powered by advanced AI technology'
    },
    {
      icon: Heart,
      title: 'Holistic Wellness',
      description: 'Focus on mental, physical, and emotional well-being'
    },
    {
      icon: Activity,
      title: 'Fitness Guidance',
      description: 'Customised workout plans and nutrition advice'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your health data is secure and completely private'
    }
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="relative z-10 p-6">
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
            <motion.button
              onClick={handleGetStarted}
              className="glass bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-xl border border-white/20 transition-all duration-300 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {user ? 'Dashboard' : 'Get Started'}
            </motion.button>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="inline-flex items-center glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-full px-4 py-2 mb-6 shadow-lg">
              <Flame className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-gray-700 text-sm">Powered by Trio Alchemy</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
              Your Intelligent
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Health Companion
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Empowering you to improve your health and well-being through personalised AI-driven insights, 
              expert guidance, and a supportive community.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <motion.button
              onClick={handleGetStarted}
              className="glass bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl border border-white/20 transition-all duration-300 flex items-center justify-center group shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/about-website')}
              className="glass bg-white/20 hover:bg-white/30 text-gray-700 px-8 py-4 rounded-xl border border-white/30 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WelcomePage;
