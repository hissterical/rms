CREATE OR REPLACE FUNCTION exec_raw_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  is_select boolean;
BEGIN
  -- Check if this is a SELECT query
  is_select := sql_query ~* '^\s*SELECT';
  
  IF is_select THEN
    -- For SELECT queries, wrap in json_agg
    EXECUTE 'SELECT COALESCE(json_agg(t), ''[]''::json) FROM (' || sql_query || ') t' INTO result;
  ELSE
    -- For INSERT/UPDATE/DELETE with RETURNING, handle differently
    IF sql_query ~* 'RETURNING' THEN
      EXECUTE 'WITH result_set AS (' || sql_query || ') SELECT COALESCE(json_agg(result_set), ''[]''::json) FROM result_set' INTO result;
    ELSE
      -- For queries without RETURNING, just execute and return empty array
      EXECUTE sql_query;
      result := '[]'::json;
    END IF;
  END IF;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'SQL Error: %', SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION exec_raw_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_raw_sql(text) TO anon;
GRANT EXECUTE ON FUNCTION exec_raw_sql(text) TO service_role;

-- Example usage:
-- SELECT exec_raw_sql('SELECT * FROM users WHERE email = ''test@example.com''');
-- SELECT exec_raw_sql('INSERT INTO users (first_name, last_name) VALUES (''John'', ''Doe'') RETURNING *');
