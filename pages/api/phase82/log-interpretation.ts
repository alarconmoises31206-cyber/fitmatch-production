import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Phase 82 prompt variants (canonical questions)
const PROMPT_VARIANTS = {
  INTERPRETATION_QUESTION: "interpretation-question-v1",
  INFLUENCE_QUESTION: "influence-question-v1"
} as const;

// Valid responses for each prompt variant
const VALID_RESPONSES = {
  [PROMPT_VARIANTS.INTERPRETATION_QUESTION]: [
    "A suggestion to explore",
    "Advice I should probably follow",
    "A recommendation",
    "A ranking of who's best",
    "I'm not sure"
  ],
  [PROMPT_VARIANTS.INFLUENCE_QUESTION]: [
    "Not at all",
    "A little",
    "Somewhat",
    "A lot"
  ]
} as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only POST requests allowed
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { sessionId, signalVisibilityState, promptVariantId, selectedResponse } = req.body;

    // Phase 82 validation (strict)
    if (!sessionId || !signalVisibilityState || !promptVariantId || !selectedResponse) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate signal visibility state
    const validVisibilityStates = ["visible", "hidden", "unknown"];
    if (!validVisibilityStates.includes(signalVisibilityState)) {
      return res.status(400).json({ error: "Invalid signal visibility state" });
    }

    // Validate prompt variant
    if (!Object.values(PROMPT_VARIANTS).includes(promptVariantId)) {
      return res.status(400).json({ error: "Invalid prompt variant" });
    }

    // Validate response for this prompt variant
    const validResponses = VALID_RESPONSES[promptVariantId as keyof typeof VALID_RESPONSES];
    if (!validResponses.includes(selectedResponse)) {
      return res.status(400).json({ error: "Invalid response for prompt variant" });
    }

    // Check if this session has already submitted a response (once per user max)
    const { data: existingResponse } = await supabase
      .from("interpretability_events")
      .select("event_id")
      .eq("session_id", sessionId)
      .limit(1);

    if (existingResponse && existingResponse.length > 0) {
      return res.status(400).json({ error: "Session has already submitted an interpretation response" });
    }

    // Insert the interpretability event
    const { data, error } = await supabase
      .from("interpretability_events")
      .insert({
        session_id: sessionId,
        signal_visibility_state: signalVisibilityState,
        prompt_variant_id: promptVariantId,
        selected_response: selectedResponse,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Phase 82 interpretability event insert error:", error);
      return res.status(500).json({ error: "Failed to log interpretability event" });
    }

    // Success - return minimal response
    return res.status(200).json({
      success: true,
      message: "Interpretability event logged successfully",
      eventId: data.event_id
    });

  } catch (error) {
    console.error("Phase 82 interpretability API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
