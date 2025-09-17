import { useState, useCallback } from 'react';
import { dataService } from '../lib/dataService';

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const search = useCallback(async (searchQuery, options = {}) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setQuery('');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setQuery(searchQuery);
      
      const data = await dataService.searchPostsSimple(searchQuery, options);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = () => {
    setResults([]);
    setQuery('');
    setError(null);
  };

  return {
    results,
    loading,
    error,
    query,
    search,
    clearSearch
  };
};
