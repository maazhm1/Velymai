import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Linkedin, HeartPulse, ArrowLeft, ShieldCheck, Stethoscope, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AboutWebsite() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Stethoscope,
      title: 'AI Health Assistant',
      description: 'Get instant, AI-powered answers to your health-related queries, available 24/7.',
    },
    {
      icon: ShieldCheck,
      title: 'Private & Secure',
      description: 'Your health data stays private with secure storage and encrypted conversations.',
    },
    {
      icon: Smartphone,
      title: 'Accessible Anywhere',
      description: 'Mobile-friendly design ensures you can use Velym AI on any device.',
    },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto px-6 py-12 space-y-12"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-medium mb-6"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {/* Hero Section */}
      <div className="glass bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-10 text-center">
        <div className="inline-block p-4 glass bg-white/30 border border-white/30 rounded-2xl mb-6 shadow-md">
          <HeartPulse className="w-10 h-10 text-gray-800" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About Velym AI</h1>
        <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed mb-6">
          Velym AI is your personal digital health companion — designed to answer your health questions, 
          guide your wellness journey, and support better decision-making in daily life.
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          Our mission is to make healthcare guidance more accessible, proactive, and user-friendly. 
          Whether it’s fitness, nutrition, or mental wellness, Velym AI is here to assist you.
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Mission:</strong> To provide reliable, AI-driven health support accessible to everyone.
        </p>
        <p className="text-gray-700">
          <strong>Vision:</strong> A healthier world where proactive wellness guidance is just a click away.
        </p>
      </div>

      {/* Features Section */}
      <div>
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-8">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="glass bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-center shadow-md"
            >
              <feature.icon className="w-10 h-10 text-gray-800 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-gray-700 text-sm mt-2">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">What Powers Velym AI</h2>
        <div className="flex justify-center gap-4 flex-wrap">
          {['React', 'TailwindCSS', 'Supabase', 'Netlify'].map((tech, index) => (
            <span
              key={index}
              className="px-4 py-2 glass bg-white/30 border border-white/30 text-gray-800 font-semibold rounded-lg shadow-md"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Developer Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex justify-center mt-10"
      >
        <div className="inline-flex items-center gap-2 px-5 py-2 glass bg-white/30 border border-white/30 rounded-full shadow-md">
          <HeartPulse className="w-5 h-5 text-gray-700" />
          <span className="text-sm font-semibold text-gray-900">
            Developed by <span className="text-gray-800">Maaz HM</span>
          </span>
        </div>
      </motion.div>

      {/* Contact Links */}
      <div className="text-center space-y-5">
        <h3 className="text-xl font-semibold text-gray-900">Connect With Me</h3>
        <div className="flex justify-center gap-6 flex-wrap">
          <a
            href="https://wa.me/919363902104"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 glass bg-white/30 border border-white/30 rounded-xl hover:bg-white/40 transition-all shadow-md"
          >
            <MessageCircle className="w-5 h-5 text-gray-800" /> WhatsApp
          </a>
          <a
            href="mailto:maazhm1436@gmail.com"
            className="flex items-center gap-2 px-4 py-2 glass bg-white/30 border border-white/30 rounded-xl hover:bg-white/40 transition-all shadow-md"
          >
            <Mail className="w-5 h-5 text-gray-800" /> Email
          </a>
          <a
            href="https://www.linkedin.com/in/maaz-hm"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 glass bg-white/30 border border-white/30 rounded-xl hover:bg-white/40 transition-all shadow-md"
          >
            <Linkedin className="w-5 h-5 text-gray-800" /> LinkedIn
          </a>
        </div>
      </div>
    </motion.div>
  );
}
export default AboutWebsite;
