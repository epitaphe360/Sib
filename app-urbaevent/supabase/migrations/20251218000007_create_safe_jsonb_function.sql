-- Migration: create safe_jsonb(text) helper to safely cast text to jsonb
-- Created: 2025-12-18

CREATE OR REPLACE FUNCTION public.safe_jsonb(input_text text)
RETURNS jsonb AS $$
BEGIN
  IF input_text IS NULL OR input_text = '' THEN
    RETURN '{}'::jsonb;
  END IF;
  BEGIN
    RETURN input_text::jsonb;
  EXCEPTION WHEN others THEN
    -- If parsing fails, return empty object to avoid trigger errors
    RETURN '{}'::jsonb;
  END;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

COMMENT ON FUNCTION public.safe_jsonb(text) IS 'Safely convert text to jsonb; returns {} on error';
