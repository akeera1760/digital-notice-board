/*
  # RPC to record a unique view and increment notice view_count

  Inserts a row in `read_logs` for (user_id, notice_id) if it doesn't exist,
  and increments `notices.view_count` only when a new read is recorded.
*/

CREATE OR REPLACE FUNCTION record_view(p_user uuid, p_notice uuid) RETURNS boolean AS $$
DECLARE
  did_insert boolean := false;
BEGIN
  BEGIN
    INSERT INTO read_logs (user_id, notice_id) VALUES (p_user, p_notice);
    did_insert := true;
  EXCEPTION WHEN unique_violation THEN
    did_insert := false;
  END;

  IF did_insert THEN
    UPDATE notices SET view_count = COALESCE(view_count, 0) + 1 WHERE id = p_notice;
  END IF;

  RETURN did_insert;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION record_view(uuid, uuid) TO authenticated;
