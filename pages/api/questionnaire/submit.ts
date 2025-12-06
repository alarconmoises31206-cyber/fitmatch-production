import type { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServer } from "../../../lib/supabase/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { responses, fitness_level, goals, preferences, injuries, availability } = req.body;

  try {
    const { error } = await supabase
      .from("questionnaires")
      .insert([{
        user_id: session.user.id,
        responses: responses || {}, // Use empty object if not provided
        fitness_level,
        goals,
        preferences,
        injuries,
        availability,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      console.log("Database error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: "Questionnaire submitted successfully" });
  } catch (error: any) {
    console.log("Server error:", error);
    return res.status(500).json({ error: error.message });
  }
}