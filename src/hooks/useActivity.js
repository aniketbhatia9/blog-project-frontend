import { useState, useEffect } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../contexts/AuthContext';

export const useActivity = (limit = 10) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dataService.getRecentActivity(limit);
        setActivities(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [user, limit]);

  return { activities, loading, error };
};
