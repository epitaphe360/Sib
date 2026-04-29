-- ============================================================
-- RPC admin : activité récente synthétisée depuis plusieurs tables
-- SECURITY DEFINER => bypass RLS, réservé aux admins
-- ============================================================

CREATE OR REPLACE FUNCTION get_admin_recent_activity()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_type text;
  v_result    json;
BEGIN
  SELECT type INTO v_user_type FROM users WHERE id = auth.uid();
  IF v_user_type IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Accès refusé — réservé aux administrateurs';
  END IF;

  SELECT json_agg(row ORDER BY row.created_at DESC)
  INTO v_result
  FROM (
    -- Inscriptions récentes
    SELECT
      id::text                           AS id,
      'user_registration'                AS action_type,
      'Nouvelle inscription : '
        || COALESCE(name, email, 'Utilisateur') AS description,
      created_at,
      'success'                          AS severity,
      'System'                           AS admin_user
    FROM users
    WHERE created_at >= NOW() - INTERVAL '30 days'

    UNION ALL

    -- Rendez-vous récents
    SELECT
      id::text                           AS id,
      'appointment_created'              AS action_type,
      'Nouveau rendez-vous planifié'     AS description,
      created_at,
      'info'                             AS severity,
      'System'                           AS admin_user
    FROM appointments
    WHERE created_at >= NOW() - INTERVAL '30 days'

    UNION ALL

    -- Connexions récentes
    SELECT
      id::text                           AS id,
      'connection_made'                  AS action_type,
      'Nouvelle connexion entre participants' AS description,
      created_at,
      'info'                             AS severity,
      'System'                           AS admin_user
    FROM connections
    WHERE created_at >= NOW() - INTERVAL '30 days'

    UNION ALL

    -- Messages récents (un échantillon)
    SELECT
      id::text                           AS id,
      'message_sent'                     AS action_type,
      'Nouveau message envoyé'           AS description,
      created_at,
      'info'                             AS severity,
      'System'                           AS admin_user
    FROM messages
    WHERE created_at >= NOW() - INTERVAL '30 days'

    UNION ALL

    -- Logs admin existants
    SELECT
      id::text                           AS id,
      COALESCE(action_type, 'system_alert') AS action_type,
      COALESCE(description, 'Action système') AS description,
      created_at,
      COALESCE(severity, 'info')         AS severity,
      COALESCE(admin_user, 'Admin')      AS admin_user
    FROM admin_logs
    WHERE created_at >= NOW() - INTERVAL '30 days'

    ORDER BY created_at DESC
    LIMIT 20
  ) AS row;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_recent_activity() TO authenticated;
