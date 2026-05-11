-- Fix: politique RLS pricing_config
-- La policy originale utilisait u.role = 'admin' mais la colonne est u.type
-- Correction : utiliser (u.type = 'admin' OR u.role = 'admin')

DROP POLICY IF EXISTS "Admins can manage pricing" ON public.pricing_config;

CREATE POLICY "Admins can manage pricing" ON public.pricing_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (u.type = 'admin' OR u.role = 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (u.type = 'admin' OR u.role = 'admin'))
  );
