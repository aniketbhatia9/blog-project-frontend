import { useState, useEffect } from 'react';
import { dataService } from '../lib/dataService';

export const useRealTimeComments = (postId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId) return;

    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dataService.getComments(postId);
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();

    // Subscribe to real-time updates
    const subscription = dataService.subscribeToComments(postId, (payload) => {
      if (payload.eventType === 'INSERT') {
        // Fetch the complete comment data with profile info
        dataService.getComments(postId).then(data => {
          setComments(data);
        }).catch(error => {
          console.error('Error updating comments:', error);
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [postId]);

  const addComment = async (content) => {
    try {
      await dataService.createComment(postId, content);
      // Real-time subscription will handle the update
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await dataService.deleteComment(commentId);
      // Update local state immediately for better UX
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  return { comments, loading, error, addComment, deleteComment };
};
