import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          toast.error('Too many requests. Please wait a minute before trying again.');
        } else {
          throw error;
        }
      } else {
        setMessageSent(true);
      }
    } catch (err: any) {
      console.error('Error sending reset link:', err);
      toast.error(err.message || 'Failed to send reset link. Please check the email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <motion.div
          className="glass bg-white/30 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">Velym AI</span>
          </div>

          {messageSent ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-6">
                A password reset link has been sent to <strong>{email}</strong>. Please follow the instructions in the email to reset your password.
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center space-x-2 text-blue-600 hover:underline font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Forgot Password?</h2>
              <p className="text-gray-600 mb-8 text-center">
                No problem. Enter your email address below and we'll send you a link to reset it.
              </p>
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full glass bg-white/20 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-all duration-300"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full glass bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl border border-white/20 transition-all duration-300 font-medium shadow-lg"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </motion.button>
              </form>
              <div className="text-center mt-6">
                <Link
                  to="/auth"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:underline font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
