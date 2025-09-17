import { useState, useEffect, useCallback } from 'react';

export const useInfiniteScroll = (callback, hasMore = true) => {
  const [loading, setLoading] = useState(false);

  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    if (window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 1000) {
      setLoading(true);
      callback().finally(() => setLoading(false));
    }
  }, [callback, loading, hasMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return loading;
};
