import { useState, useEffect } from 'react';
import { dataService } from '../lib/dataService';

export const useProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [profileData, userPosts, userStats] = await Promise.all([
          dataService.getProfile(userId),
          dataService.getUserPosts(userId, true), // Only published posts for public view
          dataService.getAuthorStats(userId)
        ]);

        setProfile(profileData);
        setPosts(userPosts);
        setStats(userStats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const updateProfile = async (updateData) => {
    try {
      const updatedProfile = await dataService.updateProfile(userId, updateData);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      throw error;
    }
  };

  return { 
    profile, 
    posts, 
    stats, 
    loading, 
    error, 
    updateProfile 
  };
};
