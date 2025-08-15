export interface Database {
  public: {
    Tables: {
      follows: {
        Row: {
          id: number
          follower_id: string
          followed_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          follower_id: string
          followed_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          follower_id?: string
          followed_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          follower_count: number
          following_count: number
          created_at: string
        }
        Insert: {
          id: string
          follower_count?: number
          following_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          follower_count?: number
          following_count?: number
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          website: string | null
          follower_count: number
          following_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          follower_count?: number
          following_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          follower_count?: number
          following_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 