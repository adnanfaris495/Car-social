export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          follower_count: number;
          following_count: number;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          follower_count?: number;
          following_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          follower_count?: number;
          following_count?: number;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          followed_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          followed_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          followed_id?: string;
          created_at?: string;
        };
      };
      cars: {
        Row: {
          id: string;
          user_id: string;
          make: string;
          model: string;
          year: number;
          image_url: string;
          mods: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          make: string;
          model: string;
          year: number;
          image_url: string;
          mods?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          make?: string;
          model?: string;
          year?: number;
          image_url?: string;
          mods?: string[];
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          car_id: string | null;
          image_url: string;
          caption: string;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          car_id?: string | null;
          image_url: string;
          caption: string;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          car_id?: string | null;
          image_url?: string;
          caption?: string;
          tags?: string[];
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      forum_posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          content: string;
          brand: string;
          tags: string[];
          is_pinned: boolean;
          is_hot: boolean;
          likes_count: number;
          replies_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          content: string;
          brand: string;
          tags?: string[];
          is_pinned?: boolean;
          is_hot?: boolean;
          likes_count?: number;
          replies_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          content?: string;
          brand?: string;
          tags?: string[];
          is_pinned?: boolean;
          is_hot?: boolean;
          likes_count?: number;
          replies_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      forum_comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      forum_likes: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          created_at?: string;
        };
      };
      marketplace_listings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          price: number;
          condition: string;
          location: string;
          image_urls: string[];
          compatible_makes: string[];
          compatible_models: string[];
          compatible_years: number[];
          is_trade_available: boolean;
          is_sold: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          price: number;
          condition: string;
          location: string;
          image_urls?: string[];
          compatible_makes?: string[];
          compatible_models?: string[];
          compatible_years?: number[];
          is_trade_available?: boolean;
          is_sold?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          price?: number;
          condition?: string;
          location?: string;
          image_urls?: string[];
          compatible_makes?: string[];
          compatible_models?: string[];
          compatible_years?: number[];
          is_trade_available?: boolean;
          is_sold?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      marketplace_offers: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          amount: number;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          amount: number;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          buyer_id?: string;
          seller_id?: string;
          amount?: number;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
      };
      marketplace_favorites: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string;
          created_at?: string;
        };
      };
      meets: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          location: string;
          date: string;
          time: string;
          image_url: string | null;
          attendees: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          location: string;
          date: string;
          time: string;
          image_url?: string | null;
          attendees?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          location?: string;
          date?: string;
          time?: string;
          image_url?: string | null;
          attendees?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      brand_follows: {
        Row: {
          id: string;
          user_id: string;
          brand_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          brand_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          brand_name?: string;
          created_at?: string;
        };
      };
    };
  };
};

export type User = Database['public']['Tables']['users']['Row'];
export type Car = Database['public']['Tables']['cars']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Like = Database['public']['Tables']['likes']['Row'];
export type ForumPost = Database['public']['Tables']['forum_posts']['Row'];
export type ForumComment = Database['public']['Tables']['forum_comments']['Row'];
export type ForumLike = Database['public']['Tables']['forum_likes']['Row'];
export type MarketplaceListing = Database['public']['Tables']['marketplace_listings']['Row'];
export type MarketplaceOffer = Database['public']['Tables']['marketplace_offers']['Row'];
export type MarketplaceFavorite = Database['public']['Tables']['marketplace_favorites']['Row'];
export type Meet = Database['public']['Tables']['meets']['Row'];
export type Follow = Database['public']['Tables']['follows']['Row'];
export type BrandFollow = Database['public']['Tables']['brand_follows']['Row']; 