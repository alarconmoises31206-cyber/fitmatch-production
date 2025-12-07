// /components/trainer/TrainerQuestionList.tsx
import React, { useState, useEffect } from 'react';

interface Question {
  id: string;
  question_text: string;
  client_id: string;
  client_name?: string;
  status: 'open' | 'paywalled_pending' | 'paid' | 'answered' | 'cancelled' | 'refunded';
  price_cents: number;
  created_at: string;
  answered_at?: string;
  answer_text?: string;
}

interface TrainerQuestionListProps {
  trainerId: string;
}

const TrainerQuestionList: React.FC<TrainerQuestionListProps> = ({ trainerId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'paywalled' | 'paid' | 'answered'>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [trainerId, filter]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/trainer/questions?trainer_id=${trainerId}&status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabaseAuthToken')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkPaywalled = async (questionId: string) => {
    try {
      const response = await fetch('/api/questions/mark-paywalled', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabaseAuthToken')}`
        },
        body: JSON.stringify({ question_id: questionId })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh questions
        fetchQuestions();
        alert(`Question marked as paywalled for $${(data.price_cents / 100).toFixed(2)}`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error: any) {
      console.error('Failed to mark as paywalled:', error);
      alert('Failed to mark question as paywalled');
    }
  };

  const handleAnswerQuestion = async (questionId: string) => {
    if (!answerText.trim()) {
      alert('Please enter an answer');
      return;
    }

    try {
      const response = await fetch('/api/questions/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabaseAuthToken')}`
        },
        body: JSON.stringify({ 
          question_id: questionId,
          answer_text: answerText 
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh questions
        fetchQuestions();
        setSelectedQuestion(null);
        setAnswerText('');
        alert('Answer submitted successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error: any) {
      console.error('Failed to answer question:', error);
      alert('Failed to submit answer');
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      'open': { color: 'bg-blue-100 text-blue-800', label: 'Open' },
      'paywalled_pending': { color: 'bg-amber-100 text-amber-800', label: 'Awaiting Payment' },
      'paid': { color: 'bg-green-100 text-green-800', label: 'Paid - Ready to Answer' },
      'answered': { color: 'bg-purple-100 text-purple-800', label: 'Answered' },
      'cancelled': { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
      'refunded': { color: 'bg-red-100 text-red-800', label: 'Refunded' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
            <p className="text-gray-600 mt-1">Manage and answer client questions</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Questions</p>
            <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mt-6">
          {(['all', 'open', 'paywalled', 'paid', 'answered'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${filter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="divide-y divide-gray-200">
        {questions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">No questions found</div>
            <p className="text-gray-500">When clients ask questions, they'll appear here.</p>
          </div>
        ) : (
          questions.map((question) => (
            <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusBadge(question.status)}
                    {question.price_cents > 0 && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                        {formatPrice(question.price_cents)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-900 mb-3">{question.question_text}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Received {formatDate(question.created_at)}</span>
                    {question.client_name && (
                      <>
                        <span className="mx-2">•</span>
                        <span>From {question.client_name}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  {question.status === 'open' && (
                    <>
                      <button
                        onClick={() => handleMarkPaywalled(question.id)}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                      >
                        Mark as Paywalled
                      </button>
                      <button
                        onClick={() => {
                          setSelectedQuestion(question);
                          setAnswerText('');
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Answer for Free
                      </button>
                    </>
                  )}

                  {question.status === 'paid' && (
                    <button
                      onClick={() => {
                        setSelectedQuestion(question);
                        setAnswerText('');
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Answer Paid Question
                    </button>
                  )}

                  {question.status === 'paywalled_pending' && (
                    <div className="text-center">
                      <div className="text-amber-600 font-medium">Waiting for payment</div>
                      <div className="text-gray-500 text-sm">Client needs to unlock</div>
                    </div>
                  )}

                  {question.status === 'answered' && (
                    <div className="text-center">
                      <div className="text-green-600 font-medium">Answered</div>
                      <div className="text-gray-500 text-sm">
                        {question.answered_at && formatDate(question.answered_at)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Answer Input Modal */}
              {selectedQuestion?.id === question.id && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Your Answer</h3>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-3"
                    rows={4}
                    placeholder="Type your detailed answer here..."
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setSelectedQuestion(null);
                        setAnswerText('');
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAnswerQuestion(question.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Submit Answer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrainerQuestionList;