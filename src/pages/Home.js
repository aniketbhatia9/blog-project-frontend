import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
                <h2>
                  <Link to={`/post/${post.slug}`}>{post.title}</Link>
                </h2>
                
                <div className="post-meta">
                  <span>By {post.profiles?.full_name || post.profiles?.username}</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                
                {post.excerpt && (
                  <p className="post-excerpt">{post.excerpt}</p>
                )}
                
                {post.post_tags?.length > 0 && (
                  <div className="post-tags">
                    {post.post_tags.map((tagRelation, index) => (
                      <span key={index} className="tag">
                        {tagRelation.tags.name}
                      </span>
                    ))}
                  </div>
                )}
                
                <Link to={`/post/${post.slug}`} className="read-more">
                  Read more →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;