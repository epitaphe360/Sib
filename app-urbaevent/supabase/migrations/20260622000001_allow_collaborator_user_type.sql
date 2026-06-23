-- Autoriser le type utilisateur 'collaborator' (comptes stand créés par exposants)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_type_check;
ALTER TABLE public.users ADD CONSTRAINT users_type_check
  CHECK (type IN (
    'visitor', 'exhibitor', 'partner', 'admin', 'security',
    'service_client', 'marketing', 'collaborator'
  ));
