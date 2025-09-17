const API_BASE = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('supabase.auth.token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Posts
  getPosts: async (limit = 10, offset = 0) => {
    const response = await fetch(`${API_BASE}/posts?limit=${limit}&offset=${offset}`);
    return response.json();
  },

  getPost: async (slug) => {
    const response = await fetch(`${API_BASE}/posts/${slug}`);
    return response.json();
  },

  createPost: async (postData) => {
    const response = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(postData)
    });
    return response.json();
  },

  updatePost: async (postId, postData) => {
    const response = await fetch(`${API_BASE}/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(postData)
    });
    return response.json();
  },

  deletePost: async (postId) => {
    const response = await fetch(`${API_BASE}/posts/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Comments
  getComments: async (postId) => {
    const response = await fetch(`${API_BASE}/posts/${postId}/comments`);
    return response.json();
  },

  createComment: async (postId, content) => {
    const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ content })
    });
    return response.json();
  }
};