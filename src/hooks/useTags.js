import { useState, useEffect } from 'react';
import { dataService } from '../lib/dataService';

export const useTags = () => {
  const [tags, setTags] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [allTags, popular] = await Promise.all([
          dataService.getTags(),
          dataService.getPopularTags(10)
        ]);

        setTags(allTags);
        setPopularTags(popular);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  return { tags, popularTags, loading, error };
};
