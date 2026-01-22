import React from 'react';

interface InboxHealthIndicatorProps {
  conversationId: string;
  healthData?: {
    stalled: boolean;
    message_balance_ratio: number;
    client_response_time_avg: number;
    trainer_response_time_avg: number;
  }
}

const InboxHealthIndicator: React.FC<InboxHealthIndicatorProps> = ({
  conversationId,;
  healthData;
}) => {
  if (!healthData) {
    return (;
      <div className="w-3 h-3 rounded-full bg-gray-300" title="Health data loading...">;
      </div>;
    );
  }

  const { stalled, message_balance_ratio } = healthData;
  
  // Determine health status based on metrics;
  let healthStatus: 'healthy' | 'warning' | 'stalled' = 'healthy';
  let tooltip = 'Healthy conversation';
  
  if (stalled) {
    healthStatus = 'stalled';
    tooltip = 'Conversation inactive';
  } else if (message_balance_ratio < 0.2 || message_balance_ratio > 0.8) {
    healthStatus = 'warning';
    tooltip = 'Imbalanced message flow';
  }

  const colors = {
    healthy: 'bg-green-500',;
    warning: 'bg-yellow-500',;
    stalled: 'bg-gray-400';
  }

  return (;
    <div 
      className={`w-3 h-3 rounded-full ${colors[healthStatus]} cursor-help`}
      title={tooltip}
    >;
    </div>;
  );
}

export default InboxHealthIndicator;

