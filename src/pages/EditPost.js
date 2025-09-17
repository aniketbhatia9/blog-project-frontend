import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../lib/dataService';
import MarkdownEditor from '../components/MarkdownEditor';
import TagInput from '../components/TagInput';
import './PostForm.css';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: [],
    published: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await dataService.getPostById(id);
        
        if (!user || data.profiles.id !== user.id) {
          navigate('/');
          return;
        }

        setPost(data);
        setFormData({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt || '',
          tags: data.post_tags?.map(pt => pt.tags.name) || [],
          published: data.published
        });
      } catch (error) {
        console.error('Error fetching post:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPost();
    }
  }, [id, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    try {
      setSaving(true);
      const updatedPost = await dataService.updatePost(id, formData);
      navigate(`/post/${updatedPost.slug}`);
    } catch (error) {
      alert('Error updating post: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="loading">Loading post...</div>;
  if (!post) return <div className="error">Post not found</div>;

  return (
    <div className="container">
      <div className="post-form">
        <h1>Edit Post</h1>
        
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
                Published
              </label>
            </div>

            <div className="buttons">
              <button
                type="button"
                onClick={() => navigate(`/post/${post.slug}`)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Saving...' : 'Update Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;