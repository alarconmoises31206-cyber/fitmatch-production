import React from 'react';

interface ConversationHeaderProps {
  matchScore?: number;
  matchType?: string;
  explanation?: {
    summary?: string;
    considered?: Array<{ label: string; included: boolean }>;
  }
  trainerName: string;
  trainerHeadline?: string;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  matchScore,;
  matchType,;
  explanation,;
  trainerName,;
  trainerHeadline;
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Dynamic class for match type badge;
  const getMatchTypeClass = () => {
    if (matchType === 'full-fitmatch') {
      return 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800';
    }
    return 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800';
  }

  return (;
    <div className="border-b border-gray-200 bg-gray-50">;
      <div className="p-4">;
        <div className="flex items-center justify-between">;
          <div>;
            <h1 className="text-xl font-bold text-gray-900">Conversation with {trainerName}</h1>;
            {trainerHeadline && (;
              <p className="text-gray-600 text-sm mt-1">{trainerHeadline}</p>;
            )}
          </div>;
          
          {matchScore !== undefined && (;
            <div className="flex items-center space-x-2">;
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">;
                FitMatch Score: {matchScore}%;
              </div>;
            </div>;
          )}
        </div>;

        {/* Why this match exists - collapsible */}
        <div className="mt-4">;
          <button;
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900";
          >;
            <svg 
              className={`w-4 h-4 mr-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24";
            >;
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />;
            </svg>;
            {isExpanded ? 'Hide match details' : 'Why this match exists'}
          </button>;

          {isExpanded && (;
            <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg">;
              {explanation?.summary && (;
                <p className="text-gray-700 mb-3">{explanation.summary}</p>;
              )}
              
              {explanation?.considered && explanation.considered.length > 0 && (;
                <div>;
                  <h4 className="font-medium text-gray-900 mb-2">Key compatibility factors:</h4>;
                  <ul className="space-y-1">;
                    {explanation.considered;
                      .filter(item => item.included);
                      .slice(0, 4);
                      .map((item, index) => (;
                        <li key={index} className="flex items-center">;
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">;
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />;
                          </svg>;
                          <span className="text-gray-600">{item.label}</span>;
                        </li>;
                      ))}
                  </ul>;
                </div>;
              )}

              {matchType && (;
                <div className="mt-3 pt-3 border-t border-gray-100">;
                  <div className="flex items-center">;
                    <span className="text-sm text-gray-500 mr-2">Match type:</span>;
                    <span className={getMatchTypeClass()}>;
                      {matchType === 'full-fitmatch' ? 'Full FitMatch' : 'Free Spin'}
                    </span>;
                  </div>;
                </div>;
              )}
            </div>;
          )}
        </div>;
      </div>;
    </div>;
  );
}

export default ConversationHeader;
