import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Calendar, Clock, Trash2, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase, type Conversation } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ConversationWithStats extends Conversation {
  message_count: number;
  last_message_time: string;
}

const ConversationHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadConversations = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: convs, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const conversationsWithStats = await Promise.all(
        (convs || []).map(async (conv) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id);

          const { data: lastMessage } = await supabase
            .from('messages')
            .select('created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...conv,
            message_count: count ?? 0,
            last_message_time: lastMessage?.created_at ?? conv.created_at,
          };
        })
      );

      setConversations(conversationsWithStats);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadConversations();

      const channel = supabase
        .channel('public:conversations')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'conversations', filter: `user_id=eq.${user.id}` },
          () => {
            loadConversations();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user!.id);

      if (error) throw error;

      toast.success('Conversation deleted successfully');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const handleClearAllHistory = async () => {
    if (!user) return;
    if (conversations.length === 0) {
      toast.error('There is no history to clear.');
      return;
    }
    if (!confirm('Are you sure you want to delete ALL conversations? This action cannot be undone.')) {
        return;
    }
    try {
        const { error } = await supabase
            .from('conversations')
            .delete()
            .eq('user_id', user.id);

        if (error) throw error;

        toast.success('All conversations have been deleted.');
    } catch (error) {
        console.error('Error clearing history:', error);
        toast.error('Failed to clear conversation history.');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMessages = conversations.reduce((sum, conv) => sum + conv.message_count, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="p-6">
        <motion.div
          className="glass bg-white/30 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 max-w-4xl mx-auto shadow-lg"
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
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">Conversation History</span>
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pb-12">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              className="w-full glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-xl pl-12 pr-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-all duration-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{conversations.length}</h3>
              <p className="text-gray-600">Total Conversations</p>
            </div>
            <div className="glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {Math.floor((new Date().getTime() - new Date(user?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)) + 1}
              </h3>
              <p className="text-gray-600">Days Active</p>
            </div>
            <div className="glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{totalMessages}</h3>
              <p className="text-gray-600">Total Messages</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Start your first conversation with Velym AI!'
                }
              </p>
              {!searchTerm && (
                <motion.button
                  onClick={() => navigate('/chat')}
                  className="glass bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl border border-white/20 transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start New Conversation
                </motion.button>
              )}
            </div>
          ) : (
            filteredConversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                onClick={() => navigate(`/chat/${conversation.id}`)}
                className="glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 cursor-pointer group hover:bg-white/25 transition-all duration-300 shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.01, y: -2 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {conversation.title}
                      </h3>
                      <span className="glass bg-blue-100/40 border border-blue-200/30 text-blue-700 px-2 py-1 rounded-lg text-xs">
                        {conversation.message_count} messages
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-500 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Last active: {formatDate(conversation.last_message_time)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {formatDate(conversation.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <motion.button
                      onClick={(e) => deleteConversation(conversation.id, e)}
                      className="glass bg-red-100/40 hover:bg-red-200/40 text-red-600 p-2 rounded-lg border border-red-200/30 transition-all duration-300 opacity-0 group-hover:opacity-100"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
        {conversations.length > 0 && (
            <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
            >
                <motion.button
                    onClick={handleClearAllHistory}
                    className="flex items-center justify-center mx-auto space-x-2 glass bg-red-100/40 hover:bg-red-200/40 text-red-600 px-6 py-3 rounded-xl border border-red-200/30 transition-all duration-300 shadow-lg font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Trash2 className="w-5 h-5" />
                    <span>Clear All History</span>
                </motion.button>
            </motion.div>
        )}
      </div>
    </div>
  );
};

export default ConversationHistory;
