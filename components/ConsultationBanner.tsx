// components/ConsultationBanner.tsx
import React from 'react';

interface ConsultationBannerProps {
  consultation_state: 'FREE' | 'LOCKED' | 'PAID' | 'ENDED';
  rate?: number;
  token_balance?: number;
  free_messages_used?: number;
  tokens_charged?: number;
}

const ConsultationBanner: React.FC<ConsultationBannerProps> = ({
  consultation_state,
  rate,
  token_balance,
  free_messages_used,
  tokens_charged
}) => {
  const getStateColor = (state: string) => {
    switch (state) {
      case 'FREE': return 'bg-green-100 text-green-800 border-green-300';
      case 'LOCKED': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'PAID': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ENDED': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStateText = (state: string) => {
    switch (state) {
      case 'FREE': return 'Free Consultation';
      case 'LOCKED': return 'Consultation Locked';
      case 'PAID': return 'Consultation Active (Paid)';
      case 'ENDED': return 'Consultation Ended';
      default: return state;
    }
  };

  return (
    <div className={`mb-6 p-4 rounded-lg border ${getStateColor(consultation_state)}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="font-semibold text-lg">{getStateText(consultation_state)}</div>
          {consultation_state === 'LOCKED' && rate && (
            <div className="text-sm">
              Rate: <span className="font-bold">{rate} tokens/message</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm">
          {token_balance !== undefined && (
            <div>
              <span className="font-medium">Token Balance:</span> {token_balance}
            </div>
          )}
          {free_messages_used !== undefined && (
            <div>
              <span className="font-medium">Free Messages Used:</span> {free_messages_used}
            </div>
          )}
          {tokens_charged !== undefined && (
            <div>
              <span className="font-medium">Tokens Charged:</span> {tokens_charged}
            </div>
          )}
        </div>
      </div>
      
      {consultation_state === 'FREE' && (
        <div className="mt-3 text-sm">
          You are in free consultation mode. The first few messages are free.
        </div>
      )}
      {consultation_state === 'LOCKED' && (
        <div className="mt-3 text-sm">
          Consultation is locked. To continue, you need to pay tokens per message.
        </div>
      )}
      {consultation_state === 'PAID' && (
        <div className="mt-3 text-sm">
          Consultation is active and paid. Tokens will be deducted per message.
        </div>
      )}
      {consultation_state === 'ENDED' && (
        <div className="mt-3 text-sm">
          This consultation has ended. No further messages can be sent.
        </div>
      )}
    </div>
  );
};

export default ConsultationBanner;
