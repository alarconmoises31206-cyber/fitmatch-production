import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Test if user_credits table exists
    const { data: creditsTable, error: creditsError } = await supabase
      .from("user_credits")
      .select("count")
      .limit(1);
    
    // Test if billing_events table exists
    const { data: eventsTable, error: eventsError } = await supabase
      .from("billing_events")
      .select("count")
      .limit(1);
    
    // Test if unlock_records table exists
    const { data: unlocksTable, error: unlocksError } = await supabase
      .from("unlock_records")
      .select("count")
      .limit(1);
    
    res.status(200).json({
      credits_table: creditsError ? `Error: ${creditsError.message}` : "Exists",
      billing_events_table: eventsError ? `Error: ${eventsError.message}` : "Exists",
      unlock_records_table: unlocksError ? `Error: ${unlocksError.message}` : "Exists",
      all_tables_exist: !creditsError && !eventsError && !unlocksError,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
