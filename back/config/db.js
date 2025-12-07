// Connect to Supabase
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials. Please check your .env file");
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
(async () => {
  try {
    const { error } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true });
    if (error && error.code !== "PGRST116") {
      // PGRST116 means table doesn't exist yet, which is ok
      throw error;
    }
    console.log("✅ Connected to Supabase");
  } catch (err) {
    console.error("❌ Supabase connection error:", err.message);
  }
})();

// Create a wrapper to maintain compatibility with pg Pool interface
const pool = {
  query: async (text, params = []) => {
    // Remove trailing semicolon if present (causes issues with CTEs)
    let processedQuery = text.trim().replace(/;+$/, "");

    // Replace parameters in the SQL
    params.forEach((param, index) => {
      const placeholder = `$${index + 1}`;
      const value =
        param === null
          ? "NULL"
          : typeof param === "string"
          ? `'${param.replace(/'/g, "''")}'`
          : typeof param === "boolean"
          ? param
            ? "TRUE"
            : "FALSE"
          : param;
      processedQuery = processedQuery.replace(
        new RegExp(`\\${placeholder}\\b`, "g"),
        value
      );
    });

    try {
      // Use Supabase's PostgREST API to execute raw SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_raw_sql`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ sql_query: processedQuery }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Supabase query failed: ${error}`);
      }

      const data = await response.json();

      return {
        rows: Array.isArray(data) ? data : data ? [data] : [],
        rowCount: Array.isArray(data) ? data.length : data ? 1 : 0,
      };
    } catch (err) {
      // If RPC doesn't exist, provide helpful error
      if (
        err.message?.includes("exec_raw_sql") ||
        err.message?.includes("function") ||
        err.message?.includes("schema cache")
      ) {
        console.error("\n⚠️  Supabase RPC function not found!");
        console.error("Please run this SQL in your Supabase SQL Editor:\n");
        console.error(`CREATE OR REPLACE FUNCTION exec_raw_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  is_select boolean;
BEGIN
  is_select := sql_query ~* '^\\s*SELECT';
  IF is_select THEN
    EXECUTE 'SELECT COALESCE(json_agg(t), ''[]''::json) FROM (' || sql_query || ') t' INTO result;
  ELSE
    IF sql_query ~* 'RETURNING' THEN
      EXECUTE 'WITH result_set AS (' || sql_query || ') SELECT COALESCE(json_agg(result_set), ''[]''::json) FROM result_set' INTO result;
    ELSE
      EXECUTE sql_query;
      result := '[]'::json;
    END IF;
  END IF;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION exec_raw_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_raw_sql(text) TO anon;
GRANT EXECUTE ON FUNCTION exec_raw_sql(text) TO service_role;
`);
        console.error("\nThen restart the server.\n");
      }
      throw err;
    }
  },
};

export { supabase, pool as default };
