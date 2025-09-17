import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.getPosts();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  return (
    <div className="home">
      <div className="container">
        <h1>Latest Blog Posts</h1>
        
        {posts.length === 0 ? (
          <p>No posts found. <Link to="/create">Write the first one!</Link></p>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <article key={post.id} className="post-card">
                <div className="post-card-content">
                <h2 className='post-card-title'>
                  <Link to={`/post/${post.slug}`}>{post.title}</Link>
                </h2>
                
                <div className="post-card-meta">
                  <span>By {post.profiles?.full_name || post.profiles?.username}</span>
                  <span className="post-date">{formatDate(post.created_at)}</span>
                  {/* <span>{new Date(post.created_at).toLocaleDateString()}</span> */}
                </div>
                
                {post.excerpt && (
                  <p className="post-card-excerpt">{post.excerpt}</p>
                )}
                
                {post.post_tags?.length > 0 && (
                  <div className="post-card-tags">
                    {post.post_tags.map((tagRelation, index) => (
                      <span key={index} className="tag-small">
                        {tagRelation.tags.name}
                      </span>
                    ))}
                  </div>
                )}
                
                <Link to={`/post/${post.slug}`} className="read-more">
                  Read more →
                </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;