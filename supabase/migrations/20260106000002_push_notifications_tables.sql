-- Migration: Create Push Notification Tables
-- Purpose: Support Firebase Cloud Messaging and web push notifications
-- Date: 2026-01-06
-- Phase: 4 - Push Notifications (Bug #8)

-- 1. Push Subscriptions Table
-- Stores user push notification subscriptions for web push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL, -- Web push endpoint URL
  keys jsonb NOT NULL, -- { "p256dh": "...", "auth": "..." }
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  UNIQUE(user_id, endpoint)
);

-- 2. Notifications Devices Table  
-- Stores device tokens for Firebase Cloud Messaging (web and mobile)
CREATE TABLE IF NOT EXISTS notifications_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_token text NOT NULL, -- Firebase Cloud Messaging token
  platform text NOT NULL, -- 'web', 'android', 'ios'
  browser_name text, -- 'Chrome', 'Safari', 'Firefox', 'Edge', etc.
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  UNIQUE(user_id, device_token)
);

-- 3. Enable RLS on push subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for push_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Enable RLS on notifications devices
ALTER TABLE notifications_devices ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for notifications_devices
CREATE POLICY "Users can view their own devices"
  ON notifications_devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices"
  ON notifications_devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices"
  ON notifications_devices FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices"
  ON notifications_devices FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Service role policies (for backend)
CREATE POLICY "Service role can manage subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage devices"
  ON notifications_devices FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_notifications_devices_user ON notifications_devices(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notifications_devices_token ON notifications_devices(device_token);
CREATE INDEX IF NOT EXISTS idx_notifications_devices_platform ON notifications_devices(platform);

-- 9. Create trigger to update updated_at on push_subscriptions
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_push_subscriptions_updated_at_trigger
BEFORE UPDATE ON push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- 10. Create trigger to update updated_at on notifications_devices
CREATE OR REPLACE FUNCTION update_notifications_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_devices_updated_at_trigger
BEFORE UPDATE ON notifications_devices
FOR EACH ROW
EXECUTE FUNCTION update_notifications_devices_updated_at();

-- 11. Add comment documentation
COMMENT ON TABLE push_subscriptions IS 'Web push notification subscriptions for browser push notifications using Web Push API and VAPID';
COMMENT ON TABLE notifications_devices IS 'Device tokens for Firebase Cloud Messaging (FCM) supporting web and mobile push notifications';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'The Web Push endpoint URL provided by the browser';
COMMENT ON COLUMN push_subscriptions.keys IS 'JSONB object with p256dh and auth keys for encryption';
COMMENT ON COLUMN notifications_devices.device_token IS 'Firebase Cloud Messaging registration token unique to device/browser';
COMMENT ON COLUMN notifications_devices.platform IS 'Platform: web, android, ios';
COMMENT ON COLUMN notifications_devices.browser_name IS 'Browser name for analytics: Chrome, Safari, Firefox, Edge, etc.';

-- 12. Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON push_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications_devices TO authenticated;

-- 13. Grant access to service role (for backend/functions)
GRANT ALL ON push_subscriptions TO service_role;
GRANT ALL ON notifications_devices TO service_role;
