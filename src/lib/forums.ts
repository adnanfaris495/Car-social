import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { ForumPost, ForumComment, ForumLike } from '@/lib/supabase/types'

interface ForumState {
  posts: (ForumPost & { authorName: string; isLiked: boolean })[]
  comments: (ForumComment & { authorName: string })[]
  isLoading: boolean
  error: string | null
  createPost: (post: { title: string; content: string; brand: string; tags: string[] }) => Promise<void>
  createComment: (postId: string, content: string) => Promise<void>
  deleteComment: (commentId: string, postId: string) => Promise<void>
  likePost: (postId: string) => Promise<void>
  unlikePost: (postId: string) => Promise<void>
  deletePost: (postId: string) => Promise<void>
  fetchPosts: (brand?: string) => Promise<void>
  fetchComments: (postId: string) => Promise<void>
  refreshPost: (postId: string) => Promise<void>
}

export const useForums = create<ForumState>((set, get) => ({
  posts: [],
  comments: [],
  isLoading: false,
  error: null,
  
  createPost: async (postData) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: post, error } = await supabase
        .from('forum_posts')
        .insert({
          author_id: user.id,
          title: postData.title,
          content: postData.content,
          brand: postData.brand,
          tags: postData.tags,
          likes_count: 0,
          replies_count: 0,
          is_pinned: false,
          is_hot: false,
        })
        .select()
        .single()

      if (error) throw error

      // Fetch the post with author name
      await get().fetchPosts(postData.brand)
    } catch (error) {
      console.error('Create forum post error:', error, JSON.stringify(error))
      set({ error: error instanceof Error ? error.message : JSON.stringify(error), isLoading: false })
    }
  },

  createComment: async (postId, content) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('forum_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content,
        })

      if (error) throw error

      // Update reply count
      const currentPost = get().posts.find(p => p.id === postId)
      if (currentPost) {
        await supabase
          .from('forum_posts')
          .update({ replies_count: currentPost.replies_count + 1 })
          .eq('id', postId)
      }

      // Refresh comments to show the new comment immediately
      await get().fetchComments(postId)
      
      // Refresh posts to update reply count
      await get().fetchPosts()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create comment' })
    }
  },

  deleteComment: async (commentId, postId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('forum_comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id)

      if (error) throw error

      // Update reply count
      const currentPost = get().posts.find(p => p.id === postId)
      if (currentPost) {
        await supabase
          .from('forum_posts')
          .update({ replies_count: Math.max(0, currentPost.replies_count - 1) })
          .eq('id', postId)
      }

      // Remove comment from local state
      set((state) => ({
        comments: state.comments.filter((comment) => comment.id !== commentId),
      }))

      // Refresh posts to update reply count
      await get().fetchPosts()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete comment' })
    }
  },

  likePost: async (postId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('forum_likes')
        .select()
        .eq('post_id', postId)
        .eq('author_id', user.id)
        .single()

      if (existingLike) return

      const { error } = await supabase
        .from('forum_likes')
        .insert({
          post_id: postId,
          author_id: user.id,
        })

      if (error) throw error

      // Update like count
      const currentPost = get().posts.find(p => p.id === postId)
      if (currentPost) {
        await supabase
          .from('forum_posts')
          .update({ likes_count: currentPost.likes_count + 1 })
          .eq('id', postId)
      }

      // Update local state
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId 
            ? { ...post, likes_count: post.likes_count + 1, isLiked: true }
            : post
        ),
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to like post' })
    }
  },

  unlikePost: async (postId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('forum_likes')
        .delete()
        .eq('post_id', postId)
        .eq('author_id', user.id)

      if (error) throw error

      // Update like count
      const currentPost = get().posts.find(p => p.id === postId)
      if (currentPost) {
        await supabase
          .from('forum_posts')
          .update({ likes_count: Math.max(0, currentPost.likes_count - 1) })
          .eq('id', postId)
      }

      // Update local state
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId 
            ? { ...post, likes_count: Math.max(0, post.likes_count - 1), isLiked: false }
            : post
        ),
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to unlike post' })
    }
  },

  deletePost: async (postId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id)

      if (error) throw error

      set((state) => ({
        posts: state.posts.filter((post) => post.id !== postId),
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete post' })
    }
  },

  fetchPosts: async (brand) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      let query = supabase
        .from('forum_posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (brand) {
        query = query.eq('brand', brand)
      }

      const { data: posts, error } = await query

      if (error) {
        console.error('Fetch posts error:', error)
        throw error
      }

      // Get user likes for posts
      let userLikes: string[] = []
      if (user) {
        const { data: likes } = await supabase
          .from('forum_likes')
          .select('post_id')
          .eq('author_id', user.id)
        
        userLikes = likes?.map((like: { post_id: string }) => like.post_id) || []
      }

      // Get author usernames for posts
      const authorIds = Array.from(new Set(posts?.map((post: any) => post.author_id) || []))
      const { data: users } = await supabase
        .from('users')
        .select('id, username')
        .in('id', authorIds)

      const userMap = new Map(users?.map((user: any) => [user.id, user.username]) || [])

      const postsWithAuthor = posts?.map((post: any) => ({
        ...post,
        authorName: userMap.get(post.author_id) || 'Anonymous',
        isLiked: userLikes.includes(post.id),
      })) || []

      set({ posts: postsWithAuthor, isLoading: false })
    } catch (error) {
      console.error('Fetch posts error:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to fetch posts', isLoading: false })
    }
  },

  fetchComments: async (postId) => {
    try {
      const { data: comments, error } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Fetch comments error:', error)
        throw error
      }

      // Get author usernames for comments
      const authorIds = Array.from(new Set(comments?.map((comment: any) => comment.author_id) || []))
      const { data: users } = await supabase
        .from('users')
        .select('id, username')
        .in('id', authorIds)

      const userMap = new Map(users?.map((user: any) => [user.id, user.username]) || [])

      const commentsWithAuthor = comments?.map((comment: any) => ({
        ...comment,
        authorName: userMap.get(comment.author_id) || 'Anonymous',
      })) || []

      set({ comments: commentsWithAuthor })
    } catch (error) {
      console.error('Fetch comments error:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to fetch comments' })
    }
  },

  refreshPost: async (postId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: post, error } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (error) throw error

      // Get user likes for posts
      let userLikes: string[] = []
      if (user) {
        const { data: likes } = await supabase
          .from('forum_likes')
          .select('post_id')
          .eq('author_id', user.id)
        
        userLikes = likes?.map((like: { post_id: string }) => like.post_id) || []
      }

      // Update local state
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId 
            ? { ...post, likes_count: post.likes_count, isLiked: userLikes.includes(post.id) }
            : post
        ),
      }))
    } catch (error) {
      console.error('Refresh post error:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to refresh post' })
    }
  },
})) 