import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../lib/dataService';
import PostCard from '../components/PostCard';
import './Profile.css';

const Profile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    avatar_url: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // In a real app, you'd fetch by username, but for simplicity using user ID
        const profileData = await dataService.getProfile(user?.id);
        const userPosts = await dataService.getUserPosts(user?.id);
        
        setProfile(profileData);
        setPosts(userPosts);
        setEditForm({
          full_name: profileData.full_name || '',
          bio: profileData.bio || '',
          avatar_url: profileData.avatar_url || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [username, user]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updatedProfile = await dataService.updateProfile(user.id, editForm);
      setProfile(updatedProfile);
      setEditing(false);
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!profile) return <div className="error">Profile not found</div>;

  const isOwnProfile = user && profile.id === user.id;

  return (
    <div className="profile">
      <div className="container">
        <div className="profile-header">
          <div className="profile-info">
            {profile.avatar_url && (
              <img 
                src={profile.avatar_url} 
                alt={profile.full_name}
                className="profile-avatar"
              />
            )}
            
            <div className="profile-details">
              {editing ? (
                <form onSubmit={handleEditSubmit} className="edit-profile-form">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  />
                  <textarea
                    placeholder="Bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    rows="3"
                  />
                  <input
                    type="url"
                    placeholder="Avatar URL"
                    value={editForm.avatar_url}
                    onChange={(e) => setEditForm({...editForm, avatar_url: e.target.value})}
                  />
                  <div className="form-buttons">
                    <button type="submit" className="btn btn-primary">Save</button>
                    <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h1>{profile.full_name || profile.username}</h1>
                  <p className="username">@{profile.username}</p>
                  {profile.bio && <p className="bio">{profile.bio}</p>}
                  
                  {isOwnProfile && (
                    <button onClick={() => setEditing(true)} className="btn btn-secondary">
                      Edit Profile
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="profile-content">
          <h2>{isOwnProfile ? 'Your Posts' : `Posts by ${profile.username}`}</h2>
          
          {posts.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            <div className="posts-grid">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;