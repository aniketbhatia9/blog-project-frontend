import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../lib/dataService';
import { useRealTimeComments } from '../hooks/useRealTimeComments';
import MarkdownRenderer from '../components/MarkdownRenderer';
import CommentSection from '../components/CommentSection';
import './PostDetail.css';

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { comments, loading: commentsLoading, addComment } = useRealTimeComments(post?.id);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await dataService.getPostBySlug(slug);
        setPost(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await dataService.deletePost(post.id);
      navigate('/');
    } catch (err) {
      alert('Error deleting post: ' + err.message);
    }
  };

  if (loading) return <div className="loading">Loading post...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!post) return <div className="error">Post not found</div>;

  const isAuthor = user && post.profiles?.id === user.id;

  return (
    <div className="post-detail">
      <div className="container">
        <article className="post">
          <header className="post-header">
            <h1 className="post-title">{post.title}</h1>
            
            <div className="post-meta">
              <div className="author-info">
                {post.profiles?.avatar_url && (
                  <img 
                    src={post.profiles.avatar_url} 
                    alt={post.profiles.full_name}
                    className="author-avatar"
                  />
                )}
                <div>
                  <Link to={`/profile/${post.profiles?.username}`} className="author-name">
                    {post.profiles?.full_name || post.profiles?.username}
                  </Link>
                  <div className="post-date">
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    {post.updated_at !== post.created_at && (
                      <span className="updated"> (Updated: {new Date(post.updated_at).toLocaleDateString()})</span>
                    )}
                  </div>
                </div>
              </div>

              {isAuthor && (
                <div className="post-actions">
                  <Link to={`/edit/${post.id}`} className="btn btn-secondary">
                    Edit
                  </Link>
                  <button onClick={handleDelete} className="btn btn-danger">
                    Delete
                  </button>
                </div>
              )}
            </div>

            {post.post_tags?.length > 0 && (
              <div className="post-tags">
                {post.post_tags.map((tagRelation, index) => (
                  <span key={index} className="tag">
                    {tagRelation.tags.name}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="post-content">
            <MarkdownRenderer content={post.content} />
          </div>
        </article>

        <CommentSection 
          comments={comments}
          loading={commentsLoading}
          onAddComment={addComment}
          canComment={!!user}
        />
      </div>
    </div>
  );
};

export default PostDetail;