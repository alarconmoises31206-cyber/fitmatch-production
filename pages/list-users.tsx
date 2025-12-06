import { useEffect, useState } from "react";
import { NextPage } from "next";
import { createSupabaseClient } from "../lib/supabase/client";
const supabase = createSupabaseClient();

const ListUsersPage: NextPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, created_at")
        .limit(10);
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Available Users for Testing</h1>
        
        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  No users found in profiles table. You need to:
                </p>
                <ol className="list-decimal pl-5 mt-2 text-sm text-yellow-700">
                  <li>Sign up a test user through your app</li>
                  <li>Or run: <code className="bg-gray-200 px-1">INSERT INTO profiles (id) VALUES (gen_random_uuid());</code></li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        User ID: <span className="font-mono">{user.id}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(user.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(user.id)}
                      className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded hover:bg-blue-200"
                    >
                      Copy ID
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Testing Instructions:</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Copy a User ID from above</li>
            <li>Go to <a href="/test-payment" className="text-blue-600 hover:underline">/test-payment</a></li>
            <li>Paste the User ID</li>
            <li>Click "Buy 3 Spins" or "Buy 10 Spins"</li>
            <li>Use test card: <code className="bg-gray-100 px-1">4242 4242 4242 4242</code></li>
            <li>Check if spins are added to <code className="bg-gray-100 px-1">user_credits</code> table</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ListUsersPage;


