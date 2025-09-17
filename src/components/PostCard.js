import React from 'react';
import { Link } from 'react-router-dom';
import './PostCard.css';

const PostCard = ({ post }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <article className="post-card">
      <div className="post-card-content">
        <h2 className="post-card-title">
          <Link to={`/post/${post.slug}`}>{post.title}</Link>
        </h2>

        <div className="post-card-meta">
          <div className="author-info">
            {post.profiles?.avatar_url && (
              <img 
                src={post.profiles.avatar_url} 
                alt={post.profiles.full_name}
                className="author-avatar-small"
              />
            )}
            <span className="author-name">
              {post.profiles?.full_name || post.profiles?.username}
            </span>
          </div>
          <span className="post-date">{formatDate(post.created_at)}</span>
        </div>

        {post.excerpt && (
          <p className="post-card-excerpt">{post.excerpt}</p>
        )}

        {post.post_tags?.length > 0 && (
          <div className="post-card-tags">
            {post.post_tags.slice(0, 3).map((tagRelation, index) => (
              <span key={index} className="tag-small">
                {tagRelation.tags?.name}
              </span>
            ))}
            {post.post_tags.length > 3 && (
              <span className="tag-small">+{post.post_tags.length - 3} more</span>
            )}
          </div>
        )}

        <div className="post-card-footer">
          <Link to={`/post/${post.slug}`} className="read-more">
            Read more →
          </Link>
          
          {!post.published && (
            <span className="draft-badge">Draft</span>
          )}
        </div>
      </div>
    </article>
  );
};

export default PostCard;