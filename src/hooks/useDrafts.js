// import { useState, useEffect } from 'react';
// import { dataService } from '../lib/dataService';
// import { useAuth } from '../contexts/AuthContext';

// export const useDrafts = () => {
//   const { user } = useAuth();
//   const [drafts, setDrafts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!user) {
//       setDrafts([]);
//       setLoading(false);
//       return;
//     }

//     const fetchDrafts = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const data = await dataService.getDrafts();
//         setDrafts(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDrafts();
//   }, [user]);

//   const publishDraft = async (postId) => {
//     try {
//       await dataService.publishPost(postId);
//       // Remove from drafts list
//       setDrafts(prev => prev.filter(draft => draft.id !== postId));
//     } catch (error) {
//       throw error;
//     }
//   };

//   const deleteDraft = async (postId) => {
//     try {
//       await dataService.deletePost(postId);
//       // Remove from drafts list
//       setDrafts(prev => prev.filter(draft => draft.id !== postId));
//     } catch (error) {
//       throw error;
//     }
//   };

//   return {
//     drafts,
//     loading,
//     error,
//     publishDraft,
//     deleteDraft,
//     refetch: () => fetchDrafts()
//   };
// };
