
-- ================================================
-- MONITORING SETUP FOR NOTIFICATION SYSTEM
-- ================================================
-- This script creates views and helper functions
-- to monitor the notification system health
-- ================================================

-- ================================================
-- 1. HEALTH METRICS VIEW
-- ================================================

CREATE OR REPLACE VIEW notification_health_metrics AS
SELECT 
  channel,
  -- Last hour metrics
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as last_hour_total,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour' AND status = 'success') as last_hour_success,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour' AND status = 'error') as last_hour_errors,
  ROUND(100.0 * COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour' AND status = 'error') / 
        NULLIF(COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour'), 0), 2) as last_hour_error_rate,
  
  -- Last 24 hours metrics
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h_total,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours' AND status = 'success') as last_24h_success,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours' AND status = 'error') as last_24h_errors,
  ROUND(100.0 * COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours' AND status = 'error') / 
        NULLIF(COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours'), 0), 2) as last_24h_error_rate,
  
  -- Health status
  CASE 
    WHEN ROUND(100.0 * COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour' AND status = 'error') / 
         NULLIF(COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour'), 0), 2) > 15 THEN '🔴 CRITIQUE'
    WHEN ROUND(100.0 * COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour' AND status = 'error') / 
         NULLIF(COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour'), 0), 2) > 5 THEN '🟡 ATTENTION'
    ELSE '🟢 NORMAL'
  END as health_status
FROM notification_logs
GROUP BY channel;

COMMENT ON VIEW notification_health_metrics IS 'Vue de santé du système de notifications avec métriques par canal';

-- ================================================
-- 2. DASHBOARD VIEW
-- ================================================

CREATE OR REPLACE VIEW notification_dashboard AS
SELECT 
  'Dernières 24h' as periode,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE channel = 'in_app') as in_app_total,
  COUNT(*) FILTER (WHERE channel = 'push') as push_total,
  COUNT(*) FILTER (WHERE channel = 'whatsapp') as whatsapp_total,
  COUNT(*) FILTER (WHERE status = 'success') as success_total,
  COUNT(*) FILTER (WHERE status = 'error') as error_total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'success') / NULLIF(COUNT(*), 0), 2) as success_rate_percent
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '24 hours';

COMMENT ON VIEW notification_dashboard IS 'Dashboard simplifié des notifications des dernières 24h';

-- ================================================
-- 3. ERROR SUMMARY VIEW
-- ================================================

CREATE OR REPLACE VIEW notification_error_summary AS
SELECT 
  channel,
  error_message,
  COUNT(*) as occurrences,
  MIN(created_at) as first_occurrence,
  MAX(created_at) as last_occurrence,
  ARRAY_AGG(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as affected_users
FROM notification_logs
WHERE status = 'error'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY channel, error_message
ORDER BY occurrences DESC;

COMMENT ON VIEW notification_error_summary IS 'Résumé des erreurs de notifications des dernières 24h';

-- ================================================
-- 4. RIDE NOTIFICATION STATUS VIEW
-- ================================================

CREATE OR REPLACE VIEW ride_notification_status AS
SELECT 
  cr.id as ride_id,
  cr.departure_city,
  cr.arrival_city,
  cr.departure_datetime,
  cr.ride_status,
  cr.rating_requested_at,
  
  -- Count notifications by type
  COUNT(n.id) FILTER (WHERE n.type = 'ride_created') as ride_created_count,
  COUNT(n.id) FILTER (WHERE n.type = 'reservation_requested') as reservation_requested_count,
  COUNT(n.id) FILTER (WHERE n.type = 'reservation_accepted') as reservation_accepted_count,
  COUNT(n.id) FILTER (WHERE n.type = 'reminder_j_minus_1') as reminder_j1_count,
  COUNT(n.id) FILTER (WHERE n.type = 'reminder_h_minus_1') as reminder_h1_count,
  COUNT(n.id) FILTER (WHERE n.type = 'driver_arrived') as driver_arrived_count,
  COUNT(n.id) FILTER (WHERE n.type = 'rating_request') as rating_request_count,
  
  -- Total notifications
  COUNT(n.id) as total_notifications
FROM carpool_rides cr
LEFT JOIN notifications n ON n.metadata->>'rideId' = cr.id::text
WHERE cr.created_at > NOW() - INTERVAL '7 days'
GROUP BY cr.id, cr.departure_city, cr.arrival_city, cr.departure_datetime, cr.ride_status, cr.rating_requested_at
ORDER BY cr.created_at DESC;

COMMENT ON VIEW ride_notification_status IS 'Statut des notifications par trajet pour les 7 derniers jours';

-- ================================================
-- 5. DEVICE TOKEN HEALTH VIEW
-- ================================================

CREATE OR REPLACE VIEW device_token_health AS
SELECT 
  platform,
  COUNT(*) as total_tokens,
  COUNT(*) FILTER (WHERE active = true) as active_tokens,
  COUNT(*) FILTER (WHERE active = false) as inactive_tokens,
  COUNT(*) FILTER (WHERE last_used_at > NOW() - INTERVAL '7 days') as recently_used,
  COUNT(*) FILTER (WHERE last_used_at < NOW() - INTERVAL '30 days') as stale_tokens,
  ROUND(100.0 * COUNT(*) FILTER (WHERE active = true) / NULLIF(COUNT(*), 0), 2) as active_rate_percent
FROM device_tokens
GROUP BY platform;

COMMENT ON VIEW device_token_health IS 'Santé des tokens de notification push par plateforme';

-- ================================================
-- 6. CRON JOB MONITORING VIEW
-- ================================================

CREATE OR REPLACE VIEW cron_job_monitoring AS
SELECT 
  j.jobid,
  j.jobname,
  j.schedule,
  j.active,
  COUNT(jrd.runid) FILTER (WHERE jrd.start_time > NOW() - INTERVAL '24 hours') as runs_last_24h,
  COUNT(jrd.runid) FILTER (WHERE jrd.start_time > NOW() - INTERVAL '24 hours' AND jrd.status = 'succeeded') as success_last_24h,
  COUNT(jrd.runid) FILTER (WHERE jrd.start_time > NOW() - INTERVAL '24 hours' AND jrd.status = 'failed') as failed_last_24h,
  MAX(jrd.start_time) as last_run,
  MAX(jrd.end_time) as last_completion,
  CASE 
    WHEN MAX(jrd.start_time) < NOW() - INTERVAL '1 hour' THEN '⚠️ Pas exécuté récemment'
    WHEN COUNT(jrd.runid) FILTER (WHERE jrd.start_time > NOW() - INTERVAL '24 hours' AND jrd.status = 'failed') > 0 THEN '🔴 Échecs détectés'
    ELSE '🟢 OK'
  END as status
FROM cron.job j
LEFT JOIN cron.job_run_details jrd ON j.jobid = jrd.jobid
WHERE j.jobname IN ('rating-request-cron', 'ride-reminders-cron')
GROUP BY j.jobid, j.jobname, j.schedule, j.active;

COMMENT ON VIEW cron_job_monitoring IS 'Monitoring des cron jobs de notifications';

-- ================================================
-- 7. HELPER FUNCTION: Get notification stats for user
-- ================================================

CREATE OR REPLACE FUNCTION get_user_notification_stats(p_user_id TEXT)
RETURNS TABLE (
  total_notifications BIGINT,
  unread_notifications BIGINT,
  notifications_by_type JSONB,
  last_notification_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE is_read = false) as unread_notifications,
    jsonb_object_agg(type, type_count) as notifications_by_type,
    MAX(created_at) as last_notification_at
  FROM (
    SELECT 
      type,
      is_read,
      created_at,
      COUNT(*) OVER (PARTITION BY type) as type_count
    FROM notifications
    WHERE user_id = p_user_id
  ) sub;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_notification_stats IS 'Obtenir les statistiques de notifications pour un utilisateur';

-- ================================================
-- 8. HELPER FUNCTION: Clean old notification logs
-- ================================================

CREATE OR REPLACE FUNCTION clean_old_notification_logs(days_to_keep INTEGER DEFAULT 30)
RETURNS TABLE (
  deleted_count BIGINT
) AS $$
DECLARE
  v_deleted_count BIGINT;
BEGIN
  DELETE FROM notification_logs
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION clean_old_notification_logs IS 'Nettoyer les logs de notifications de plus de X jours';

-- ================================================
-- 9. HELPER FUNCTION: Deactivate stale tokens
-- ================================================

CREATE OR REPLACE FUNCTION deactivate_stale_tokens(days_inactive INTEGER DEFAULT 30)
RETURNS TABLE (
  deactivated_count BIGINT
) AS $$
DECLARE
  v_deactivated_count BIGINT;
BEGIN
  UPDATE device_tokens
  SET active = false
  WHERE last_used_at < NOW() - (days_inactive || ' days')::INTERVAL
    AND active = true;
  
  GET DIAGNOSTICS v_deactivated_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_deactivated_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION deactivate_stale_tokens IS 'Désactiver les tokens non utilisés depuis X jours';

-- ================================================
-- 10. HELPER FUNCTION: Get rides needing rating request
-- ================================================

CREATE OR REPLACE FUNCTION get_rides_needing_rating_request()
RETURNS TABLE (
  ride_id UUID,
  driver_id TEXT,
  departure_city TEXT,
  arrival_city TEXT,
  ended_at TIMESTAMPTZ,
  minutes_since_end INTEGER,
  passenger_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id as ride_id,
    cr.driver_id,
    cr.departure_city,
    cr.arrival_city,
    cr.ended_at,
    EXTRACT(EPOCH FROM (NOW() - cr.ended_at))::INTEGER / 60 as minutes_since_end,
    COUNT(cb.id) as passenger_count
  FROM carpool_rides cr
  LEFT JOIN carpool_bookings cb ON cb.ride_id = cr.id AND cb.status = 'accepted'
  WHERE cr.ride_status = 'ended'
    AND cr.ended_at BETWEEN NOW() - INTERVAL '30 minutes' AND NOW() - INTERVAL '10 minutes'
    AND cr.rating_requested_at IS NULL
  GROUP BY cr.id, cr.driver_id, cr.departure_city, cr.arrival_city, cr.ended_at
  ORDER BY cr.ended_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_rides_needing_rating_request IS 'Obtenir les trajets nécessitant une demande de notation';

-- ================================================
-- 11. HELPER FUNCTION: Get rides needing reminders
-- ================================================

CREATE OR REPLACE FUNCTION get_rides_needing_reminders()
RETURNS TABLE (
  ride_id UUID,
  driver_id TEXT,
  departure_city TEXT,
  arrival_city TEXT,
  departure_datetime TIMESTAMPTZ,
  hours_until_departure NUMERIC,
  reminder_type TEXT,
  passenger_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  -- J-1 reminders (23-25 hours before)
  SELECT 
    cr.id as ride_id,
    cr.driver_id,
    cr.departure_city,
    cr.arrival_city,
    cr.departure_datetime,
    EXTRACT(EPOCH FROM (cr.departure_datetime - NOW()))::NUMERIC / 3600 as hours_until_departure,
    'J-1'::TEXT as reminder_type,
    COUNT(cb.id) as passenger_count
  FROM carpool_rides cr
  LEFT JOIN carpool_bookings cb ON cb.ride_id = cr.id AND cb.status = 'accepted'
  WHERE cr.departure_datetime BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
    AND cr.ride_status IN ('pending', 'started')
    AND cr.status != 'cancelled'
  GROUP BY cr.id, cr.driver_id, cr.departure_city, cr.arrival_city, cr.departure_datetime
  
  UNION ALL
  
  -- H-1 reminders (59-61 minutes before)
  SELECT 
    cr.id as ride_id,
    cr.driver_id,
    cr.departure_city,
    cr.arrival_city,
    cr.departure_datetime,
    EXTRACT(EPOCH FROM (cr.departure_datetime - NOW()))::NUMERIC / 3600 as hours_until_departure,
    'H-1'::TEXT as reminder_type,
    COUNT(cb.id) as passenger_count
  FROM carpool_rides cr
  LEFT JOIN carpool_bookings cb ON cb.ride_id = cr.id AND cb.status = 'accepted'
  WHERE cr.departure_datetime BETWEEN NOW() + INTERVAL '59 minutes' AND NOW() + INTERVAL '61 minutes'
    AND cr.ride_status IN ('pending', 'started')
    AND cr.status != 'cancelled'
  GROUP BY cr.id, cr.driver_id, cr.departure_city, cr.arrival_city, cr.departure_datetime
  
  ORDER BY departure_datetime;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_rides_needing_reminders IS 'Obtenir les trajets nécessitant des rappels J-1 ou H-1';

-- ================================================
-- 12. INDEXES FOR PERFORMANCE
-- ================================================

-- Index on notification_logs for faster queries
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_channel_status ON notification_logs(channel, status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);

-- Index on notifications for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;

-- Index on carpool_rides for cron jobs
CREATE INDEX IF NOT EXISTS idx_carpool_rides_ended_at ON carpool_rides(ended_at) WHERE ride_status = 'ended';
CREATE INDEX IF NOT EXISTS idx_carpool_rides_departure_datetime ON carpool_rides(departure_datetime) WHERE ride_status IN ('pending', 'started');

-- Index on device_tokens for faster lookups
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id_active ON device_tokens(user_id, active);
CREATE INDEX IF NOT EXISTS idx_device_tokens_last_used_at ON device_tokens(last_used_at) WHERE active = true;

-- ================================================
-- 13. GRANT PERMISSIONS (if needed)
-- ================================================

-- Grant read access to monitoring views
-- GRANT SELECT ON notification_health_metrics TO authenticated;
-- GRANT SELECT ON notification_dashboard TO authenticated;
-- GRANT SELECT ON device_token_health TO authenticated;

-- ================================================
-- SETUP COMPLETE
-- ================================================

-- Verify setup
SELECT 'Monitoring setup complete!' as status;

-- Show available views
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views
WHERE viewname LIKE 'notification%' OR viewname LIKE 'cron%' OR viewname LIKE 'device_token%'
ORDER BY viewname;
