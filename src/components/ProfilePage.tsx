import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase, type Profile } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { User, Mail, Save, Camera, LogOut, ArrowLeft } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string | null }>({
    full_name: '',
    avatar_url: null,
  });
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user!.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({ full_name: data.full_name || '', avatar_url: data.avatar_url });
        setFullName(data.full_name || '');
      }
    } catch (error) {
      toast.error('Failed to load profile.');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();

      const profileChannel = supabase
        .channel(`profile-page-updates:${user.id}`)
        .on<Profile>(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            const newProfile = payload.new;
            setProfile({ full_name: newProfile.full_name || '', avatar_url: newProfile.avatar_url });
            setFullName(newProfile.full_name || '');
            toast.success('Your profile was updated in another tab.');
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(profileChannel);
      };
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user!.id);

      if (error) throw error;
      setProfile((prev) => ({ ...prev, full_name: fullName }));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile.');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    try {
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user!.id);

      if (updateError) throw updateError;

      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      toast.success('Avatar updated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar.');
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

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
              <span className="text-xl font-bold text-gray-800">My Profile</span>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-12">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Left Column - Avatar and Actions */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center shadow-lg">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <img
                  src={
                    profile.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=random`
                  }
                  alt="Profile Avatar"
                  className="w-full h-full rounded-full object-cover border-4 border-white/50 shadow-md"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      fullName || 'User'
                    )}&background=random`;
                  }}
                />
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center border-2 border-white/50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={uploading}
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </motion.button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{fullName}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
            <div className="glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl p-4 space-y-2 shadow-lg">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 text-left p-3 rounded-lg hover:bg-red-100/40 transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="text-red-600 font-medium">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Right Column - Profile Form */}
          <div className="md:col-span-2 space-y-6">
            <form
              onSubmit={handleUpdateProfile}
              className="glass bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl p-8 space-y-6 shadow-lg"
            >
              <h3 className="text-2xl font-bold text-gray-800 border-b border-white/20 pb-4">
                Account Details
              </h3>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full glass bg-white/20 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full glass bg-gray-200/20 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  disabled={loading || fullName === profile.full_name}
                  className="flex items-center space-x-2 glass bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl border border-white/20 transition-all duration-300 font-medium shadow-lg"
                  whileHover={{
                    scale: loading || fullName === profile.full_name ? 1 : 1.05,
                  }}
                  whileTap={{
                    scale: loading || fullName === profile.full_name ? 1 : 0.95,
                  }}
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;
