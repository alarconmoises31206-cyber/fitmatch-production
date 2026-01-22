import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page with signup mode
    router.push('/auth/login?mode=signup');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-gray-600">Redirecting to sign up...</div>
      </div>
    </div>
  );
}
