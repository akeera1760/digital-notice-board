export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: 'student' | 'teacher';
          department_id: string | null;
          year: number | null;
          branch: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          role?: 'student' | 'teacher';
          department_id?: string | null;
          year?: number | null;
          branch?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          full_name?: string;
          role?: 'student' | 'teacher';
          department_id?: string | null;
          year?: number | null;
          branch?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      departments: {
        Row: { id: string; name: string; code: string; created_at: string };
        Insert: { name: string; code: string };
        Update: { name?: string; code?: string };
      };
      categories: {
        Row: { id: string; name: string; color: string; icon: string; image_url: string | null; emoji: string | null; created_at: string };
        Insert: { name: string; color?: string; icon?: string; image_url?: string | null; emoji?: string | null };
        Update: { name?: string; color?: string; icon?: string; image_url?: string | null; emoji?: string | null };
      };
      notices: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id: string;
          department_id: string | null;
          category_id: string | null;
          target_years: number[] | null;
          priority: 'low' | 'normal' | 'high' | 'urgent';
          is_published: boolean;
          is_archived: boolean;
          expires_at: string | null;
          attachment_urls: string[];
          attachment_names: string[];
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          content?: string;
          author_id: string;
          department_id?: string | null;
          category_id?: string | null;
          target_years?: number[] | null;
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          is_published?: boolean;
          expires_at?: string | null;
          attachment_urls?: string[];
          attachment_names?: string[];
        };
        Update: {
          title?: string;
          content?: string;
          department_id?: string | null;
          category_id?: string | null;
          target_years?: number[] | null;
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          is_published?: boolean;
          is_archived?: boolean;
          expires_at?: string | null;
          attachment_urls?: string[];
          attachment_names?: string[];
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: { id: string; user_id: string; category_id: string; created_at: string };
        Insert: { user_id: string; category_id: string };
        Update: never;
      };
      read_logs: {
        Row: { id: string; user_id: string; notice_id: string; read_at: string };
        Insert: { user_id: string; notice_id: string };
        Update: never;
      };
      bookmarks: {
        Row: { id: string; user_id: string; notice_id: string; created_at: string };
        Insert: { user_id: string; notice_id: string };
        Update: never;
      };
      read_later: {
        Row: { id: string; user_id: string; notice_id: string; created_at: string };
        Insert: { user_id: string; notice_id: string };
        Update: never;
      };
      student_archives: {
        Row: { id: string; user_id: string; notice_id: string; created_at: string };
        Insert: { user_id: string; notice_id: string };
        Update: never;
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Department = Database['public']['Tables']['departments']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Notice = Database['public']['Tables']['notices']['Row'];

export interface NoticeWithDetails extends Notice {
  profiles: { full_name: string; role: string } | null;
  departments: { name: string; code: string } | null;
  categories: { name: string; color: string; icon: string; image_url: string | null; emoji: string | null } | null;
}
