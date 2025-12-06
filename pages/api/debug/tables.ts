import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // List all tables in public schema
    const { data: tables, error } = await supabase
      .from("pg_tables")
      .select("tablename")
      .eq("schemaname", "public");
    
    if (error) {
      // Alternative: try to query information_schema
      const { data: altTables } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public");
      
      res.status(200).json({
        method: "information_schema",
        tables: altTables?.map(t => t.table_name) || [],
        specific_tables: {
          user_credits: "Checking...",
          billing_events: "Checking...",
          unlock_records: "Checking...",
          payments: "Checking...",
          subscriptions: "Checking...",
          stripe_accounts: "Checking...",
          bookings: "Checking...",
        }
      });
      return;
    }
    
    const tableNames = tables?.map(t => t.tablename) || [];
    
    // Check each specific table
    const tableChecks: Record<string, boolean> = {};
    const tablesToCheck = [
      "user_credits",
      "billing_events", 
      "unlock_records",
      "payments",
      "subscriptions",
      "stripe_accounts",
      "bookings",
      "profiles"
    ];
    
    for (const tableName of tablesToCheck) {
      tableChecks[tableName] = tableNames.includes(tableName);
    }
    
    res.status(200).json({
      all_tables: tableNames,
      table_checks: tableChecks,
      missing_tables: tablesToCheck.filter(t => !tableNames.includes(t))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
}
