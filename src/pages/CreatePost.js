import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../lib/dataService';
import MarkdownEditor from '../components/MarkdownEditor';
import TagInput from '../components/TagInput';
import './PostForm.css';

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: [],
    published: false
  });
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="container">
        <div className="auth-required">
          <h2>Please log in to create a post</h2>
          <p>You need to be logged in to write blog posts.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    try {
      setLoading(true);
      const post = await dataService.createPost(formData);
      navigate(`/post/${post.slug}`);
    } catch (error) {
      alert('Error creating post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container">
      <div className="post-form">
        <h1>Create New Post</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter post title..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">Excerpt</label>
            <textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              placeholder="Brief description of your post..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <TagInput
              tags={formData.tags}
              onChange={(tags) => handleChange('tags', tags)}
            />
          </div>

          <div className="form-group">
            <label>Content *</label>
            <MarkdownEditor
              value={formData.content}
              onChange={(content) => handleChange('content', content)}
            />
          </div>

          <div className="form-actions">
            <div className="publish-toggle">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => handleChange('published', e.target.checked)}
                />
                Publish immediately
              </label>
            </div>

            <div className="buttons">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Creating...' : (formData.published ? 'Publish' : 'Save Draft')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;