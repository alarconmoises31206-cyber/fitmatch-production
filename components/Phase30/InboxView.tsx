import React from 'react';

interface ConversationSummary {
  id: string;
  client_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  match_score: number;
}

const InboxView: React.FC = () => {
  return (
    <div>
      <h1>Inbox View</h1>
      <p>Messages component placeholder</p>
    </div>
  );
};

export default InboxView;
