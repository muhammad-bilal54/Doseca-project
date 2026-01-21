

import api from './axios';

export const postApi = {
  // Create new post
  create: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  // Get all posts with pagination and filters
  getAll: async (params = {}) => {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  // Get single post by ID
  getById: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // Update post
  update: async (id, postData) => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },

  // Delete post
  delete: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
};
