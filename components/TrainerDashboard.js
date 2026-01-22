import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Adjust import path as needed

const TrainerDashboard = () => {
  const [consultations, setConsultations] = useState([]);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/trainer/dashboard', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setConsultations(data.consultations);
      setTokenBalance(data.token_balance);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const lockConsultation = async (consultationId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/messages/lock', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ consultation_id: consultationId })
      });

      if (!response.ok) {
        throw new Error('Failed to lock consultation');
      }

      // Refresh dashboard data
      await fetchDashboardData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const endConsultation = async (consultationId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/messages/end', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ consultation_id: consultationId })
      });

      if (!response.ok) {
        throw new Error('Failed to end consultation');
      }

      // Refresh dashboard data
      await fetchDashboardData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const setRate = async (consultationId, rate) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/messages/set-rate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          consultation_id: consultationId,
          rate_per_message: parseInt(rate)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to set rate');
      }

      // Refresh dashboard data
      await fetchDashboardData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="trainer-dashboard">
      <h2>Trainer Dashboard</h2>
      
      <div className="token-balance">
        <h3>Token Balance: {tokenBalance}</h3>
      </div>

      <div className="consultations-list">
        <h3>Active Consultations</h3>
        
        {consultations.length === 0 ? (
          <p>No active consultations</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Status</th>
                <th>Rate per Message</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((consultation) => (
                <tr key={consultation.id}>
                  <td>{consultation.profiles?.name || consultation.profiles?.email || 'Unknown'}</td>
                  <td>{consultation.state}</td>
                  <td>
                    <input
                      type="number"
                      value={consultation.rate_per_message}
                      onChange={(e) => setRate(consultation.id, e.target.value)}
                      disabled={consultation.state === 'ENDED'}
                    />
                  </td>
                  <td>{new Date(consultation.created_at).toLocaleDateString()}</td>
                  <td>
                    {consultation.state === 'FREE' && (
                      <button onClick={() => lockConsultation(consultation.id)}>
                        Lock Consultation
                      </button>
                    )}
                    {consultation.state !== 'ENDED' && consultation.state !== 'FREE' && (
                      <button onClick={() => endConsultation(consultation.id)}>
                        End Consultation
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TrainerDashboard;
