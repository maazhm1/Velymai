import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Heart, Brain, ExternalLink } from 'lucide-react';

const healthcareTools = [
  {
    name: 'Teladoc Health',
    description: '24/7 virtual doctor visits, therapy, and dermatology online.',
    link: 'https://www.teladoc.com/',
    icon: Stethoscope,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Practo',
    description: 'Book affordable doctor appointments and consult specialists online.',
    link: 'https://www.practo.com/',
    icon: Stethoscope,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'GoodRx',
    description: 'Find discounts and affordable alternatives for prescription medicines in the U.S.',
    link: 'https://www.goodrx.com/',
    icon: Stethoscope,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Ada Health',
    description: 'AI-powered symptom checker to understand health concerns before visiting a doctor.',
    link: 'https://ada.com/',
    icon: Stethoscope,
    gradient: 'from-blue-500 to-cyan-500',
  },
];

const lifestyleApps = [
  {
    name: 'MyFitnessPal',
    description: 'Calorie tracker and nutrition app with personalized meal logging.',
    link: 'https://www.myfitnesspal.com/',
    icon: Heart,
    gradient: 'from-teal-500 to-green-500',
  },
  {
    name: 'Fitbit',
    description: 'Track steps, workouts, heart rate, and sleep patterns with wearables.',
    link: 'https://www.fitbit.com/global/us/home',
    icon: Heart,
    gradient: 'from-teal-500 to-green-500',
  },
  {
    name: 'Headspace',
    description: 'Meditation and mindfulness app for stress-relief and focus.',
    link: 'https://www.headspace.com/',
    icon: Brain,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Habitica',
    description: 'Gamified habit-building app that turns routines into an adventure.',
    link: 'https://habitica.com/',
    icon: Brain,
    gradient: 'from-purple-500 to-pink-500',
  },
];

const Tools: React.FC = () => {
  const navigate = useNavigate();

  // ✅ Always start at top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 relative">
      {/* Back button */}
      <motion.button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center space-x-2 glass bg-white/30 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 text-gray-700 shadow-lg hover:bg-white/40 transition-all duration-300 fixed top-6 left-6 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </motion.button>

      {/* Header */}
      <motion.div
        className="text-center pt-24 pb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
          Curated Health & Lifestyle Tools
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore trusted healthcare platforms and lifestyle apps to support a healthier, more balanced life.
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        {/* Healthcare Tools Section */}
        <section className="mb-20">
          <motion.h2 
            className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Stethoscope className="w-8 h-8 text-blue-600" />
            Affordable Healthcare
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {healthcareTools.map((tool) => (
              <motion.div key={tool.name} variants={itemVariants}>
                <a
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full glass bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
                >
                  <div className={`w-14 h-14 bg-gradient-to-r ${tool.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform`}>
                    <tool.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{tool.name}</h3>
                  <p className="text-gray-600">{tool.description}</p>
                  <div className="flex items-center text-blue-600 mt-4 font-medium">
                    Visit Site <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Lifestyle Apps Section */}
        <section>
          <motion.h2 
            className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Heart className="w-8 h-8 text-pink-600" />
            Fitness & Well-being Apps
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {lifestyleApps.map((tool) => (
              <motion.div key={tool.name} variants={itemVariants}>
                <a
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full glass bg-white/40 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
                >
                  <div className={`w-14 h-14 bg-gradient-to-r ${tool.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform`}>
                    <tool.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{tool.name}</h3>
                  <p className="text-gray-600">{tool.description}</p>
                  <div className="flex items-center text-blue-600 mt-4 font-medium">
                    Visit Site <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Tools;
