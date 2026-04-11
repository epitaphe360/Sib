-- Migration: Create news table
-- Created: 2025-01-13

CREATE TABLE IF NOT EXISTS public.news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    author TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    read_time INTEGER DEFAULT 1,
    source TEXT DEFAULT 'siports',
    views INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on news" ON public.news
    FOR SELECT USING (status = 'published');

CREATE POLICY "Allow authenticated users to manage news" ON public.news
    FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news(category);
CREATE INDEX IF NOT EXISTS idx_news_featured ON public.news(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_news_status ON public.news(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_news_updated_at
    BEFORE UPDATE ON public.news
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
