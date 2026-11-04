-- ========================================================================
-- VIRTUABOOTH: Supabase Database Schema, Storage & Realtime Setup
-- ========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. THEMES TABLE
CREATE TABLE IF NOT EXISTS public.themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  bg_color TEXT NOT NULL,
  ink_color TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  filter_css TEXT DEFAULT 'none',
  frame_style TEXT DEFAULT 'classic',
  border_radius INTEGER DEFAULT 0,
  watermark_text TEXT DEFAULT 'VIRTUABOOTH',
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PHOTO ROOMS (For Multiplayer Remote Photobooth)
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code VARCHAR(12) UNIQUE NOT NULL,
  host_id TEXT NOT NULL,
  theme_id TEXT NOT NULL DEFAULT 'classic-strip',
  layout TEXT NOT NULL DEFAULT 'duo-split', -- 'duo-split', 'duo-alternating', '4-cut', '2-cut', '2x2'
  total_shots INTEGER DEFAULT 4,
  countdown_seconds INTEGER DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'lobby', -- 'lobby', 'countdown', 'shooting', 'review', 'completed'
  current_shot_index INTEGER DEFAULT 0,
  sync_timestamp BIGINT, -- unix timestamp for synchronized countdown trigger
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ROOM PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.room_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL, -- persistent client token / user id
  display_name TEXT NOT NULL,
  avatar TEXT,
  peer_id TEXT, -- WebRTC Peer ID for direct video/audio streaming
  is_host BOOLEAN DEFAULT FALSE,
  is_ready BOOLEAN DEFAULT FALSE,
  current_slot INTEGER, -- 0 for left/first, 1 for right/second
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_identifier)
);

-- 6. PHOTO SESSIONS
CREATE TABLE IF NOT EXISTS public.photo_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  theme_id TEXT NOT NULL,
  layout TEXT NOT NULL,
  created_by TEXT,
  final_image_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CAPTURED PHOTOS / INDIVIDUAL SHOTS
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.photo_sessions(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  participant_slot INTEGER DEFAULT 0, -- 0 for Host/You, 1 for Friend
  shot_index INTEGER NOT NULL, -- 0, 1, 2, 3...
  photo_url TEXT NOT NULL,
  filter_applied TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Allow public read & write for guest-friendly photobooth experience
CREATE POLICY "Public themes access" ON public.themes FOR SELECT USING (true);
CREATE POLICY "Public rooms access" ON public.rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public room_participants access" ON public.room_participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public photo_sessions access" ON public.photo_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public photos access" ON public.photos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public profiles access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 9. ENABLE SUPABASE REALTIME REPLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;

-- 10. STORAGE BUCKET CONFIGURATION (Run in Supabase Storage UI or via CLI)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photobooth-photos', 'photobooth-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public photobooth photos storage"
ON storage.objects FOR ALL
USING (bucket_id = 'photobooth-photos')
WITH CHECK (bucket_id = 'photobooth-photos');

