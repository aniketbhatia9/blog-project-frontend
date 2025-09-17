// import { useState, useEffect } from 'react';
// import { dataService } from '../lib/dataService';

// export const usePost = (slug) => {
//   const [post, setPost] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!slug) return;

//     const fetchPost = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const data = await dataService.getPostBySlug(slug);
//         setPost(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPost();

//     // Subscribe to real-time updates for this post
//     const subscription = dataService.subscribeToPostUpdates(slug, (payload) => {
//       if (payload.eventType === 'UPDATE') {
//         fetchPost(); // Refetch post data when updated
//       }
//     });

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, [slug]);

//   return { post, loading, error, refetch: () => fetchPost() };
// };

