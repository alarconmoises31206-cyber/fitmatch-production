const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env variables");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);
(async () => {
  const { data: extensions, error: extError } = await supabase.from("pg_extension").select("extname").eq("extname", "vector");
  if (extError) console.error("pg_extension error:", extError);
  else console.log("pgvector enabled:", extensions && extensions.length > 0 ? "YES" : "NO");
  const { data: cols, error: colError } = await supabase.from("information_schema.columns").select("column_name, data_type").eq("table_schema", "public").eq("table_name", "trainer_profiles").eq("column_name", "vector_embedding");
  if (colError) console.error("column error:", colError);
  else {
    console.log("trainer_profiles.vector_embedding exists:", cols && cols.length > 0 ? "YES" : "NO");
    if (cols && cols.length > 0) console.log("Column type:", cols[0].data_type);
  }
  const { data: clientEmb, error: tableError } = await supabase.from("information_schema.tables").select("table_name").eq("table_schema", "public").eq("table_name", "client_embeddings");
  if (tableError) console.error("table error:", tableError);
  else console.log("client_embeddings table exists:", clientEmb && clientEmb.length > 0 ? "YES" : "NO");
})().catch(err => console.error(err));
