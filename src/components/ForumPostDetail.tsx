'use client'

import { useState, useEffect } from 'react'
import { IconMessageCircle, IconClock, IconPin, IconFlame, IconHeart, IconTrash, IconArrowLeft } from '@tabler/icons-react'
import { useForums } from '@/lib/forums'
import { useSession } from '@supabase/auth-helpers-react';

interface ForumPostDetailProps {
  postId: string
  onBack: () => void
}

export default function ForumPostDetail({ postId, onBack }: ForumPostDetailProps) {
  const [newComment, setNewComment] = useState('')
  const { posts, comments, fetchComments, createComment, deleteComment, likePost, unlikePost, deletePost, refreshPost, isLoading } = useForums()
  const user = useSession()?.user;
  
  const post = posts.find(p => p.id === postId)

  useEffect(() => {
    if (postId) {
      fetchComments(postId)
    }
  }, [postId, fetchComments])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await createComment(postId, newComment.trim())
      setNewComment('')
    } catch (error) {
      console.error('Failed to create comment:', error)
    }
  }

  const handleLike = async () => {
    if (!post) return
    
    try {
      if (post.isLiked) {
        await unlikePost(postId)
      } else {
        await likePost(postId)
      }
      await refreshPost(postId)
    } catch (error) {
      console.error('Failed to like/unlike post:', error)
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    try {
      await deletePost(postId)
      onBack()
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    
    try {
      await deleteComment(commentId, postId)
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted">Post not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
      >
        <IconArrowLeft size={20} />
        Back to Forums
      </button>

      {/* Post content */}
      <div className="content-card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="page-heading mb-4 racing-font">{post.title}</h1>
            <p className="text-muted whitespace-pre-wrap leading-relaxed">{post.content}</p>
          </div>
          {user && post.author_id === user.id && (
            <button
              onClick={handleDeletePost}
              className="text-accent-secondary hover:text-accent-secondary/80 transition-colors ml-4"
              title="Delete post"
            >
              <IconTrash size={20} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted mb-6">
          <span className="flex items-center gap-1">
            <IconMessageCircle size={16} />
            {post.replies_count} replies
          </span>
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1 transition-all duration-200 like-animation ${
              post.isLiked ? 'text-accent-secondary' : 'hover:text-accent-secondary'
            }`}
          >
            <IconHeart size={16} />
            {post.likes_count}
          </button>
          <span className="flex items-center gap-1">
            <IconClock size={16} />
            {new Date(post.created_at).toLocaleDateString()}
          </span>
          {post.is_hot && (
            <span className="flex items-center gap-1 text-orange-500">
              <IconFlame size={16} />
              Hot
            </span>
          )}
          {post.is_pinned && (
            <span className="flex items-center gap-1 text-accent-primary">
              <IconPin size={16} />
              Pinned
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">by {post.authorName}</span>
          <div className="flex gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-accent-primary/10 text-accent-primary px-3 py-1 rounded-lg"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div className="space-y-6">
        <h2 className="section-heading racing-font">Comments ({comments.length})</h2>
        
        {/* Add comment form */}
        {user && (
          <form onSubmit={handleSubmitComment} className="content-card">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="form-textarea min-h-[100px] resize-y"
              placeholder="Write a comment..."
              required
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={!newComment.trim() || isLoading}
                className="button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        )}

        {/* Comments list */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="content-card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">
                  {comment.authorName || 'Anonymous'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                  {user && comment.author_id === user.id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-accent-secondary hover:text-accent-secondary/80 transition-colors"
                      title="Delete comment"
                    >
                      <IconTrash size={16} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-muted whitespace-pre-wrap leading-relaxed">{comment.content}</p>
            </div>
          ))}
          
          {comments.length === 0 && (
            <div className="text-center text-muted py-8">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 