import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Lock, Eye, EyeOff, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    const handleAuthChange = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        setTokenValid(true);
      } else if (!authLoading) {
        setTokenValid(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setTokenValid(true);
      }
    });

    handleAuthChange();

    return () => {
      subscription.unsubscribe();
    };
  }, [authLoading]);


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success('Password updated successfully! Please log in with your new password.');
      await supabase.auth.signOut(); // Sign out to force re-login with new password
      navigate('/auth');
    } catch (err: any) {
      console.error('Error updating password:', err);
      toast.error(err.message || 'Failed to update password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading || tokenValid === null) {
    return <LoadingSpinner />;
  }

  if (!tokenValid) {
     return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <motion.div
          className="glass bg-white/30 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid or Expired Link</h2>
          <p className="text-gray-600 mb-6">
            The password reset link is either invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center justify-center space-x-2 glass bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-xl border border-white/20 font-medium shadow-lg"
          >
            <span>Request New Link</span>
          </Link>
        </motion.div>
      </div>
    );
  }

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

          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Reset Your Password</h2>
          <p className="text-gray-600 mb-8 text-center">
            Please enter your new password below.
          </p>

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass bg-white/20 border border-white/20 rounded-xl pl-12 pr-12 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full glass bg-white/20 border border-white/20 rounded-xl pl-12 pr-12 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full glass bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white py-3 px-6 rounded-xl border border-white/20 font-medium shadow-lg"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
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
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
