import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, CheckCircle, MessageCircle, Mail, Linkedin, ArrowLeft, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const skills = [
  'HTML, CSS, JavaScript',
  'Node.js & Express',
  'Supabase & Firebase',
  'TailwindCSS',
  'Netlify Deployment',
  'React & TypeScript',
];

const socialLinks = [
  {
    icon: MessageCircle,
    href: 'https://wa.me/919363902104',
    label: 'WhatsApp',
  },
  {
    icon: Mail,
    href: 'mailto:maazhm1436@gmail.com',
    label: 'Email',
  },
  {
    icon: Linkedin,
    href: 'https://www.linkedin.com/in/maaz-hm',
    label: 'LinkedIn',
  },
];

export function AboutMe() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto px-6 py-12"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-medium mb-6"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {/* Main Card */}
      <div className="glass bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8 md:p-12">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row items-center gap-10 mb-10">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 rounded-full glass bg-white/30 border border-white/30 flex items-center justify-center shadow-lg">
              <User className="w-16 h-16 text-gray-800" />
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Hi, I'm <span className="bg-gradient-to-r from-gray-800 to-gray-600 text-transparent bg-clip-text">Maaz HM</span>
            </h1>
            <p className="text-gray-700 leading-relaxed mb-5">
              I'm passionate about building modern web applications, integrating real-time features, 
              and exploring AI tools. Currently working on web projects with Supabase 
              and deploying them on Netlify.
            </p>

            {/* Education Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-5 py-2 glass bg-white/30 border border-white/30 rounded-full shadow-md"
            >
              <GraduationCap className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-semibold text-gray-800">
                Student at <span className="text-gray-900">Islamiah College (Autonomous)</span> • B.Sc Computer Science
              </span>
            </motion.div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Skills */}
          <div className="glass bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-5">Skills & Expertise</h2>
            <ul className="space-y-3">
              {skills.map((skill, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{skill}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="glass bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-5">Connect With Me</h2>
            <div className="space-y-4">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-4 py-3 glass bg-white/30 border border-white/30 rounded-xl hover:bg-white/40 transition-all group shadow-md"
                  whileHover={{ scale: 1.05 }}
                >
                  <link.icon className="w-6 h-6 text-gray-800" />
                  <span className="font-medium text-gray-800 group-hover:text-gray-900 transition-colors">
                    {link.label}
                  </span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
export default AboutMe;
