import { useState, useEffect } from 'react';
import { dataService } from '../lib/dataService';

export const usePosts = (limit = 10, publishedOnly = true) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchPosts = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentOffset = reset ? 0 : offset;
      const data = await dataService.getPosts(limit, currentOffset, publishedOnly);
      
      if (reset) {
        setPosts(data);
        setOffset(data.length);
      } else {
        setPosts(prev => [...prev, ...data]);
        setOffset(prev => prev + data.length);
      }
      
      setHasMore(data.length === limit);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(true);
  }, [limit, publishedOnly]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(false);
    }
  };

  const refetch = () => {
    setOffset(0);
    fetchPosts(true);
  };

  return { 
    posts, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refetch 
  };
};
