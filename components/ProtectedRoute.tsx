import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createSupabaseClient } from '../lib/supabase/client.js';


interface ProtectedRouteProps {
  children: React.ReactNode}

export default function ProtectedRoute(props: ProtectedRouteProps) {
  const router: any= useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
  
    const checkAuth: any= async () => {
      const supabase: any= createSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        router.push('/auth/login');
      } else {
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [router]);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{props.children}</>;
}


