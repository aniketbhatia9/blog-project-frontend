import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './CommentSection.css';

const CommentSection = ({ comments, loading, onAddComment, canComment }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      alert('Error posting comment: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="comment-section">
      <h3>Comments ({comments?.length || 0})</h3>

      {canComment ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <div className="comment-input">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows="3"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="btn btn-primary"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p className="login-prompt">
          <a href="/login">Sign in</a> to join the discussion
        </p>
      )}

      <div className="comments-list">
        {loading ? (
          <div className="loading">Loading comments...</div>
        ) : comments?.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        ) : (
          comments?.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <div className="comment-author">
                  {comment.profiles?.avatar_url && (
                    <img 
                      src={comment.profiles.avatar_url} 
                      alt={comment.profiles.full_name}
                      className="comment-avatar"
                    />
                  )}
                  <span className="author-name">
                    {comment.profiles?.full_name || comment.profiles?.username}
                  </span>
                </div>
                <span className="comment-date">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="comment-content">
                {comment.content}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default CommentSection;