import type { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServer } from "../../lib/supabase/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createSupabaseServer();
  
  try {
    // Test basic Supabase connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      return res.status(400).json({ error: `Connection failed: ${error.message}` });
    }
    
    return res.status(200).json({ 
      message: "Supabase connection successful",
      data 
    });
  } catch (error: any) {
    return res.status(500).json({ error: `Test failed: ${error.message}` });
  }
}