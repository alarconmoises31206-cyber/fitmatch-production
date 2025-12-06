import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const tablesToCheck = [
      "user_credits",
      "payments", 
      "unlock_records",
      "billing_events",
      "subscriptions",
      "stripe_accounts", 
      "bookings"
    ];
    
    const tests = [];
    
    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase
          .from(table)
          .select("count")
          .limit(1);
        tests.push({ table, exists: !error, error: error?.message });
      } catch (e: any) {
        tests.push({ table, exists: false, error: e.message });
      }
    }
    
    res.status(200).json({ 
      tests,
      summary: {
        total: tablesToCheck.length,
        exists: tests.filter(t => t.exists).length,
        missing: tests.filter(t => !t.exists).length,
        missing_tables: tests.filter(t => !t.exists).map(t => t.table)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
