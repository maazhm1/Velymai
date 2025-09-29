import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase, type MentalHealthResource } from '../lib/supabase';
import toast from 'react-hot-toast';
import { ArrowLeft, BookOpen, Film, Wind, Link as LinkIcon, Search } from 'lucide-react';

const categoryIcons = {
  Article: BookOpen,
  Exercise: Wind,
  Video: Film,
};

const MentalHealth: React.FC = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<MentalHealthResource[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ New states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mental_health_resources')
        .select('*')
        .order('category');
      
      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      toast.error('Failed to load resources.');
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Apply search + filter
  const filteredResources = resources.filter((res) => {
    const matchesCategory = selectedCategory === "All" || res.category === selectedCategory;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (res.content && res.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // ✅ Group filtered data by category
  const groupedResources = filteredResources.reduce((acc, resource) => {
    const category = resource.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(resource);
    return acc;
  }, {} as Record<string, MentalHealthResource[]>);

  return (
    <div className="min-h-screen">
      <title>Mental Health Resources | Articles, Videos & Exercises</title>
      <meta name="description" content="Explore trusted mental health resources including expert articles, guided videos, and daily exercises to improve your well-being." />

      <header className="p-6">
        <motion.div 
          className="glass bg-white/30 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 max-w-5xl mx-auto shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="glass bg-white/20 hover:bg-white/30 text-gray-700 p-2 rounded-xl border border-white/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <span className="text-xl font-bold text-gray-800">Mental Health & Well-being</span>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-12">
        {/* ✅ Beautiful Glassmorphism Search + Filter */}
<div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
  {/* Search Bar */}
  <div className="relative w-full md:w-1/2">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
    <input
      type="text"
      placeholder="Search resources..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-12 pr-4 py-3 w-full rounded-2xl glass bg-white/20 backdrop-blur-md 
                 border border-white/30 shadow-md 
                 text-gray-800 placeholder-gray-500
                 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                 transition-all duration-300"
    />
  </div>

  {/* Category Dropdown */}
  <select
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
    className="px-5 py-3 rounded-2xl glass bg-white/20 backdrop-blur-md 
               border border-white/30 shadow-md text-gray-800
               focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent
               transition-all duration-300"
  >
    <option value="All">All Categories</option>
    <option value="Article">Articles</option>
    <option value="Video">Videos</option>
    <option value="Exercise">Exercises</option>
  </select>
</div>

        {loading ? (
          <div className="text-center py-10">Loading resources...</div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No resources found.</div>
        ) : (
          <div className="space-y-12">
            {["Article", "Video", "Exercise"].map((category, catIndex) =>
              groupedResources[category] ? (
                <motion.div 
                  key={category}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + catIndex * 0.2 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    {React.createElement(categoryIcons[category as keyof typeof categoryIcons], { className: "w-8 h-8 text-gray-700" })}
                    <h2 className="text-2xl font-bold text-gray-800">{category}s</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {groupedResources[category].map((item, itemIndex) => (
                      <motion.div
                        key={item.id}
                        className="glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg flex flex-col"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * itemIndex }}
                      >
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                        <p className="text-gray-600 leading-relaxed flex-grow">{item.description || item.content}</p>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors font-medium self-start"
                          >
                            <LinkIcon className="w-4 h-4" />
                            <span>{item.category === 'Video' ? 'Watch Video' : 'Read More'}</span>
                          </a>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : null
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MentalHealth;
