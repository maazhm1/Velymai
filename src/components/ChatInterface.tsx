import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, ArrowLeft, Heart, Bot, User, Loader, History, Volume2, Pause, Play } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase, type Message, type Conversation } from '../lib/supabase';
import { generateHealthResponse } from '../lib/gemini';
import toast from 'react-hot-toast';

const ChatInterface: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversationId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    if (conversationId) {
      loadConversation(conversationId, user.id);
      
      const channel = supabase.channel(`chat:${conversationId}`)
        .on<Message>(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            setMessages((currentMessages) => {
              if (currentMessages.find(m => m.id === payload.new.id)) {
                return currentMessages;
              }
              return [...currentMessages, payload.new as Message].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      createNewConversation(user.id);
    }
  }, [conversationId, user]);

  const loadConversation = async (id: string, userId: string) => {
    try {
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (convError || !conversation) {
        setCurrentConversation(null);
        setMessages([]);
        toast.error("No conversation data found");
        navigate('/dashboard');
        return;
      }

      setCurrentConversation(conversation);

      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData ?? []);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
      navigate('/dashboard');
    }
  };

  const createNewConversation = async (userId: string) => {
    try {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          title: 'New Health Conversation'
        })
        .select()
        .single();

      if (error) throw error;
      
      const welcomeMessage = {
        id: crypto.randomUUID(),
        conversation_id: conversation.id,
        content: `Hello! I'm your Velym AI assistant. I'm here to help you with health-related questions, fitness advice, nutrition guidance, and wellness tips. What would you like to know about today?`,
        is_user: false,
        created_at: new Date().toISOString()
      };

      const { error: messageError } = await supabase
        .from('messages')
        .insert(welcomeMessage);

      if (messageError) throw messageError;
      
      navigate(`/chat/${conversation.id}`, { replace: true });
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const updateConversationTitle = async (firstUserMessage: string) => {
    if (!currentConversation) return;
    try {
      const title = firstUserMessage.length > 50
        ? firstUserMessage.substring(0, 47) + '...'
        : firstUserMessage;

      const { error } = await supabase
        .from('conversations')
        .update({ title })
        .eq('id', currentConversation.id);

      if (error) throw error;
      setCurrentConversation({ ...currentConversation, title });
    } catch (error) {
      console.error('Error updating conversation title:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentConversation || !user) return;

    const isFirstUserMessage = messages.filter(m => m.is_user).length === 0;
    const currentInput = inputValue;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: currentConversation.id,
      content: currentInput,
      is_user: true,
      created_at: new Date().toISOString(),
    };

    setInputValue('');
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { error: userError } = await supabase.from('messages').insert({
        conversation_id: userMessage.conversation_id,
        content: userMessage.content,
        is_user: userMessage.is_user,
      });
      if (userError) throw userError;

      const aiResponseContent = await generateHealthResponse(currentInput);

      const { error: aiError } = await supabase.from('messages').insert({
        conversation_id: currentConversation.id,
        content: aiResponseContent,
        is_user: false,
      });
      if (aiError) throw aiError;

      if (isFirstUserMessage) {
        updateConversationTitle(currentInput);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      setInputValue(currentInput);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSpeech = (message: Message) => {
    if (speakingId === message.id) {
      if (isPaused) {
        speechSynthesis.resume();
        setIsPaused(false);
      } else {
        speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.lang = "en-US";
      utterance.onend = () => {
        setSpeakingId(null);
        setIsPaused(false);
      };
      utteranceRef.current = utterance;
      setSpeakingId(message.id);
      setIsPaused(false);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
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
                <div>
                  <span className="text-xl font-bold text-gray-800">Velym AI</span>
                  {currentConversation && (
                    <p className="text-sm text-gray-600">{currentConversation.title}</p>
                  )}
                </div>
              </div>
            </div>
            <motion.button
              onClick={() => navigate('/history')}
              className="glass bg-white/20 hover:bg-white/30 text-gray-700 p-2 rounded-xl border border-white/20 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <History className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 pb-6">
        <motion.div
          className="glass bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-6 h-[60vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AnimatePresence>
            {messages.length > 0 ? (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  layout
                  className={`flex items-start space-x-4 mb-6 ${
                    message.is_user ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.is_user
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}
                  >
                    {message.is_user ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {message.is_user ? (
                    <div className="glass backdrop-blur-lg border border-white/20 rounded-2xl p-4 max-w-[80%] shadow-lg bg-blue-100/40 border-blue-200/30">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 max-w-[80%]">
                      <div className="flex items-start gap-2">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap flex-1">
                          {message.content}
                        </p>
                        <button
                          onClick={() => toggleSpeech(message)}
                          className="p-2 hover:bg-gray-200 rounded-full transition"
                        >
                          {speakingId === message.id ? (
                            isPaused ? <Play className="w-5 h-5 text-gray-600" /> : <Pause className="w-5 h-5 text-gray-600" />
                          ) : (
                            <Volume2 className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-center mt-10">No messages yet.</p>
            )}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-4 mb-6"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Loader className="w-4 h-4 text-gray-600 animate-spin" />
                  <span className="text-gray-600">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </motion.div>

        <motion.div
          className="mt-6 glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about health, fitness, nutrition, or wellness..."
                className="w-full bg-transparent text-gray-800 placeholder-gray-500 resize-none focus:outline-none min-h-[60px] max-h-[120px]"
                rows={2}
              />
            </div>
            <motion.button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="glass bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl border border-white/20 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatInterface;
