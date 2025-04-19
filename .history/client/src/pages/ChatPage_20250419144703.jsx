import React from 'react';
import ChatComponent from '../components/chat/ChatComponent';

const ChatPage = () => {
  return (
    <div className="chat-page">
      <h1 className="page-title">Messages</h1>
      <ChatComponent />
    </div>
  );
};

export default ChatPage;
