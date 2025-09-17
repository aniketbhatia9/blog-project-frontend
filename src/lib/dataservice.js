import { supabase } from './supabase';

const API_BASE = 'http://localhost:8000/api';

class DataService {
  // Get auth headers for FastAPI calls
  async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token 
      ? { Authorization: `Bearer ${session.access_token}` }
      : {};
  }

  // POSTS - Use Supabase DataAPI for simple operations
  async getPosts(limit = 10, offset = 0, publishedOnly = true) {
    let query = supabase
      .from('posts')
      .select(`
        id, title, slug, excerpt, created_at, published,
        profiles!posts_author_id_fkey(id, username, full_name, avatar_url),
        post_tags(tags(id, name))
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (publishedOnly) {
      query = query.eq('published', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getPostBySlug(slug) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, title, slug, content, excerpt, created_at, updated_at, published,
        profiles!posts_author_id_fkey(id, username, full_name, bio, avatar_url),
        post_tags(tags(id, name))
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  }

  async getPostById(id) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, title, slug, content, excerpt, created_at, updated_at, published,
        profiles!posts_author_id_fkey(id, username, full_name, bio, avatar_url),
        post_tags(tags(id, name))
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createPost(postData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const slug = this.createSlug(postData.title);

    const { data, error } = await supabase
      .from('posts')
      .insert([{
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        published: postData.published,
        slug: slug,
        author_id: user.id
      }])
      .select(`
        id, title, slug, content, excerpt, created_at, updated_at, published,
        profiles!posts_author_id_fkey(id, username, full_name, bio, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Handle tags separately
    if (postData.tags && postData.tags.length > 0) {
      await this.addTagsToPost(data.id, postData.tags);
    }

    return data;
  }

  async updatePost(postId, postData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user owns the post
    const { data: existingPost } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (!existingPost || existingPost.author_id !== user.id) {
      throw new Error('Not authorized to edit this post');
    }

    const updateData = { updated_at: new Date().toISOString() };

    if (postData.title !== undefined) {
      updateData.title = postData.title;
      updateData.slug = this.createSlug(postData.title);
    }
    if (postData.content !== undefined) updateData.content = postData.content;
    if (postData.excerpt !== undefined) updateData.excerpt = postData.excerpt;
    if (postData.published !== undefined) updateData.published = postData.published;

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select(`
        id, title, slug, content, excerpt, created_at, updated_at, published,
        profiles!posts_author_id_fkey(id, username, full_name, bio, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Handle tag updates if provided
    if (postData.tags !== undefined) {
      // Remove existing tags
      await supabase.from('post_tags').delete().eq('post_id', postId);
      
      // Add new tags
      if (postData.tags.length > 0) {
        await this.addTagsToPost(postId, postData.tags);
      }
    }

    return data;
  }

  async deletePost(postId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user owns the post
    const { data: existingPost } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (!existingPost || existingPost.author_id !== user.id) {
      throw new Error('Not authorized to delete this post');
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    return { message: 'Post deleted successfully' };
  }

  async getUserPosts(userId, publishedOnly = false) {
    let query = supabase
      .from('posts')
      .select(`
        id, title, slug, excerpt, created_at, published,
        profiles!posts_author_id_fkey(id, username, full_name, avatar_url),
        post_tags(tags(id, name))
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (publishedOnly) {
      query = query.eq('published', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // COMPLEX OPERATIONS - Use FastAPI
  async getTrendingPosts(daysBack = 7) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/posts/trending?days_back=${daysBack}`, {
      headers
    });
    
    if (!response.ok) throw new Error('Failed to fetch trending posts');
    return response.json();
  }

  async getPostAnalytics(postId) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/posts/${postId}/analytics`, {
      headers
    });
    
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  }

  async searchPosts(query, filters = {}) {
    const headers = await this.getAuthHeaders();
    const searchParams = new URLSearchParams({
      q: query,
      ...filters
    });
    
    const response = await fetch(`${API_BASE}/posts/search?${searchParams}`, {
      headers
    });
    
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  }

  // COMMENTS - Use Supabase DataAPI (simple CRUD)
  async getComments(postId) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id, content, created_at,
        profiles!comments_author_id_fkey(username, full_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async createComment(postId, content) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_id: postId,
        content,
        author_id: user.id
      }])
      .select(`
        id, content, created_at,
        profiles!comments_author_id_fkey(username, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteComment(commentId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user owns the comment
    const { data: existingComment } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', commentId)
      .single();

    if (!existingComment || existingComment.author_id !== user.id) {
      throw new Error('Not authorized to delete this comment');
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
    return { message: 'Comment deleted successfully' };
  }

  // Real-time subscriptions - Only possible with Supabase
  subscribeToComments(postId, callback) {
    return supabase
      .channel(`comments:${postId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`
      }, callback)
      .subscribe();
  }

  subscribeToPostUpdates(postId, callback) {
    return supabase
      .channel(`post:${postId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'posts',
        filter: `id=eq.${postId}`
      }, callback)
      .subscribe();
  }

  // TAGS - Use Supabase DataAPI
  async getTags() {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name')
      .order('name');

    if (error) throw error;
    return data;
  }

  async addTagsToPost(postId, tagNames) {
    for (const tagName of tagNames) {
      // Get or create tag
      let { data: tag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName.toLowerCase().trim())
        .single();

      if (!tag) {
        const { data: newTag, error: tagError } = await supabase
          .from('tags')
          .insert([{ name: tagName.toLowerCase().trim() }])
          .select('id')
          .single();
        
        if (tagError) throw tagError;
        tag = newTag;
      }

      // Link post to tag (ignore if already exists)
      await supabase
        .from('post_tags')
        .upsert([{
          post_id: postId,
          tag_id: tag.id
        }], { 
          onConflict: 'post_id,tag_id',
          ignoreDuplicates: true 
        });
    }
  }

  async getPopularTags(limit = 20) {
    const { data, error } = await supabase
      .from('tags')
      .select(`
        id, name,
        post_tags(count)
      `)
      .order('post_tags.count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // PROFILES - Use Supabase DataAPI
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async getProfileByUsername(username) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data;
  }

  async createProfile(profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(userId, profileData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      throw new Error('Not authorized to update this profile');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // UTILITY FUNCTIONS
  createSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // SEARCH FUNCTIONALITY (Simple text search using Supabase)
  async searchPostsSimple(searchQuery, options = {}) {
    const { publishedOnly = true, limit = 20, offset = 0 } = options;

    let query = supabase
      .from('posts')
      .select(`
        id, title, slug, excerpt, created_at, published,
        profiles!posts_author_id_fkey(id, username, full_name, avatar_url),
        post_tags(tags(id, name))
      `)
      .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (publishedOnly) {
      query = query.eq('published', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // DRAFT OPERATIONS
  async getDrafts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, title, slug, excerpt, created_at, updated_at,
        post_tags(tags(id, name))
      `)
      .eq('author_id', user.id)
      .eq('published', false)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async publishPost(postId) {
    return this.updatePost(postId, { published: true });
  }

  async unpublishPost(postId) {
    return this.updatePost(postId, { published: false });
  }

  // STATS AND ANALYTICS (Simple implementation)
  async getAuthorStats(userId) {
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, published, created_at')
      .eq('author_id', userId);

    if (postsError) throw postsError;

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id, created_at')
      .eq('author_id', userId);

    if (commentsError) throw commentsError;

    const publishedPosts = posts.filter(p => p.published);
    const draftPosts = posts.filter(p => !p.published);

    return {
      totalPosts: posts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      totalComments: comments.length,
      joinedDate: Math.min(...posts.map(p => new Date(p.created_at).getTime()))
    };
  }

  // RECENT ACTIVITY
  async getRecentActivity(limit = 10) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get recent posts and comments
    const { data: recentPosts } = await supabase
      .from('posts')
      .select('id, title, slug, created_at')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data: recentComments } = await supabase
      .from('comments')
      .select(`
        id, content, created_at,
        posts!inner(id, title, slug)
      `)
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Combine and sort by date
    const activities = [
      ...(recentPosts || []).map(post => ({
        type: 'post',
        date: post.created_at,
        data: post
      })),
      ...(recentComments || []).map(comment => ({
        type: 'comment',
        date: comment.created_at,
        data: comment
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);

    return activities;
  }
}

export const dataService = new DataService();