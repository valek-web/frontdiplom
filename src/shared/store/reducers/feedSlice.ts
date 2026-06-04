import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { AppDispatch } from "../store"
import api from "../../api/axiosInstance"

interface User {
  id: number
  name: string
  email: string
}

interface Image {
  id: number
  path: string
}

interface Video {
  id: number
  path: string
}

interface Comment {
  id: number
  content: string
  postId: number
  userId: number
  user: User
  createdAt: string
}

interface Post {
  id: number
  content: string
  authorId: number
  author: User
  imageId?: number
  images?: Image
  videoId?: number
  videos?: Video
  likes: any[]
  comments: Comment[]
  commentsCount: number
  viewCount: number
  publishedAt: string
  createdAt: string
  updatedAt: string
}

interface FeedState {
  posts: Post[]
  total: number
  loading: boolean
  error: string | null
  currentPage: number
  pageSize: number
  commentsLoading: { [key: number]: boolean }
}

const initialState: FeedState = {
  posts: [],
  total: 0,
  loading: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  commentsLoading: {},
}

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setPosts: (state, action: PayloadAction<{ posts: Post[]; total: number }>) => {
      state.posts = action.payload.posts
      state.total = action.payload.total
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload)
    },
    updatePost: (state, action: PayloadAction<Post>) => {
      const index = state.posts.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.posts[index] = action.payload
      }
    },
    removePost: (state, action: PayloadAction<number>) => {
      state.posts = state.posts.filter((p) => p.id !== action.payload)
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    setCommentsLoading: (state, action: PayloadAction<{ postId: number; loading: boolean }>) => {
      state.commentsLoading[action.payload.postId] = action.payload.loading
    },
    addCommentState: (state, action: PayloadAction<{ postId: number; comment: Comment }>) => {
      const post = state.posts.find((p) => p.id === action.payload.postId)
      if (post) {
        post.comments = post.comments || []
        post.comments.unshift(action.payload.comment)
        post.commentsCount = (post.commentsCount || 0) + 1
      }
    },
    updateComment: (state, action: PayloadAction<{ postId: number; comment: Comment }>) => {
      const post = state.posts.find((p) => p.id === action.payload.postId)
      if (post && post.comments) {
        const index = post.comments.findIndex((c) => c.id === action.payload.comment.id)
        if (index !== -1) {
          post.comments[index] = action.payload.comment
        }
      }
    },
    deleteCommentState: (state, action: PayloadAction<{ postId: number; commentId: number }>) => {
      const post = state.posts.find((p) => p.id === action.payload.postId)
      if (post && post.comments) {
        post.comments = post.comments.filter((c) => c.id !== action.payload.commentId)
        post.commentsCount = Math.max(0, (post.commentsCount || 0) - 1)
      }
    },
    updateCommentState: (state, action: PayloadAction<{ postId: number; comment: Comment }>) => {
      const post = state.posts.find((p) => p.id === action.payload.postId)
      if (post && post.comments) {
        const index = post.comments.findIndex((c) => c.id === action.payload.comment.id)
        if (index !== -1) {
          post.comments[index] = action.payload.comment
        }
      }
    },
  },
})

export const {
  setLoading,
  setError,
  setPosts,
  addPost,
  updatePost,
  removePost,
  setPage,
  setCommentsLoading,
  addCommentState,
  updateCommentState,
  deleteCommentState,
} = feedSlice.actions
export default feedSlice.reducer

// Thunks
export const fetchPosts = (page: number = 1, limit: number = 10) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    try {
      const { data } = await api.get(`/posts?page=${page}&limit=${limit}`)
      dispatch(setPosts({ posts: data.posts, total: data.total }))
      dispatch(setPage(page))
      return { success: true, data }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Ошибка загрузки постов"
      dispatch(setError(errorMsg))
      return { success: false, error: errorMsg }
    } finally {
      dispatch(setLoading(false))
    }
  }
}

export const createPost = (postData: { content: string; imageId?: number; videoId?: number }) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    try {
      const { data } = await api.post("/posts", postData)
      dispatch(addPost(data))
      return { success: true, post: data }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Ошибка создания поста"
      dispatch(setError(errorMsg))
      return { success: false, error: errorMsg }
    } finally {
      dispatch(setLoading(false))
    }
  }
}

export const likePost = (postId: number) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data } = await api.post(`/posts/${postId}/like`)
      dispatch(fetchPosts(1, 10))
      return { success: true, data }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Ошибка"
      return { success: false, error: errorMsg }
    }
  }
}

export const unlikePost = (postId: number) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data } = await api.delete(`/posts/${postId}/like`)
      dispatch(fetchPosts(1, 10))
      return { success: true, data }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Ошибка"
      return { success: false, error: errorMsg }
    }
  }
}

export const deletePost = (postId: number) => {
  return async (dispatch: AppDispatch) => {
    try {
      await api.delete(`/posts/${postId}`)
      dispatch(removePost(postId))
      return { success: true }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Ошибка удаления"
      return { success: false, error: errorMsg }
    }
  }
}

// Комментарии
export const addComment = (postId: number, content: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setCommentsLoading({ postId, loading: true }))
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { content })
      dispatch(feedSlice.actions.addCommentState({ postId, comment: data }))
      return { success: true, comment: data }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Ошибка добавления комментария"
      return { success: false, error: errorMsg }
    } finally {
      dispatch(setCommentsLoading({ postId, loading: false }))
    }
  }
}

export const deleteComment = (postId: number, commentId: number) => {
  return async (dispatch: AppDispatch) => {
    try {
      await api.delete(`/posts/comments/${commentId}`)
      dispatch(feedSlice.actions.deleteCommentState({ postId, commentId }))
      return { success: true }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Ошибка удаления комментария"
      return { success: false, error: errorMsg }
    }
  }
}

export const updateComment = (commentId: number, content: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      const { data } = await api.put(`/posts/comments/${commentId}`, { content })
      // Нужно найти пост, к которому относится комментарий
      // Временно обновляем все посты (можно оптимизировать)
      dispatch(fetchPosts(1, 10))
      return { success: true, comment: data }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Ошибка обновления комментария"
      return { success: false, error: errorMsg }
    }
  }
}
