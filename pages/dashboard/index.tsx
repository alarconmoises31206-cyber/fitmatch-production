import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase/client";

export default function DashboardIndex() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      console.log("🔄 Dashboard loading...");
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("🚫 No session, redirecting to login");
        router.push("/auth/login");
        return;
      }

      console.log("✅ User authenticated:", session.user.email);
      
      // TEMPORARY: Bypass profiles check and redirect to client dashboard
      // We'll fix profiles table later
      console.log("🎯 Redirecting to client dashboard (bypassing profiles)");
      router.push("/dashboard/client");
    }

    load();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}