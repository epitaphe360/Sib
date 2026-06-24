-- Corrige la désynchronisation auth.users ↔ public.users pour jalinebbari@gmail.com
-- auth.users.id  = 66447844-e5af-4825-a030-6d096ddb5175
-- public.users.id (ancien) = 891a57b5-a11f-4d58-b16b-c5432cf7a250

BEGIN;

DELETE FROM public.user_badges
WHERE user_id = '891a57b5-a11f-4d58-b16b-c5432cf7a250';

UPDATE public.users
SET id = '66447844-e5af-4825-a030-6d096ddb5175', updated_at = now()
WHERE id = '891a57b5-a11f-4d58-b16b-c5432cf7a250'
  AND lower(email) = 'jalinebbari@gmail.com';

COMMIT;

-- Vérification (le badge sera régénéré à la prochaine connexion)
SELECT u.id, u.email, u.type, u.status
FROM public.users u
WHERE lower(u.email) = 'jalinebbari@gmail.com';
