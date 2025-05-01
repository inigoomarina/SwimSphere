import React, { useContext } from 'react';
import ChatComponent from '../components/chat/ChatComponent';
import { AuthContext } from '../context/AuthContext.jsx';
import { Redirect } from 'react-router-dom';
import Loader from '../components/common/Loader';
import './ChatPage.css'; // Add CSS import

const ChatPage = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // Demo data for conversations and messages
  const demoConversations = [
    { id: '1', name: 'Alice Smith', lastMessage: 'See you tomorrow!', time: '10:30 AM', unread: 2, profileImage: '/placeholder-avatar-1.png', online: true },
    { id: '2', name: 'Bob Johnson', lastMessage: 'Okay, sounds good.', time: 'Yesterday', unread: 0, profileImage: '/placeholder-avatar-2.png', online: false },
    { id: '3', name: 'Coach Davis', lastMessage: 'Practice is at 6 AM.', time: 'Mon', unread: 0, profileImage: '/default-avatar.png', online: true },
  ];

  const demoMessages = {
    '1': [
      { id: 'm1', sender: 'Alice Smith', content: 'Hey! How was the meet?', timestamp: new Date(), type: 'received' },
      { id: 'm2', sender: 'Me', content: 'It went well, got a PB in the 100 free!', timestamp: new Date(), type: 'sent' },
      { id: 'm3', sender: 'Alice Smith', content: 'Awesome! Congrats!', timestamp: new Date(), type: 'received' },
      { id: 'm4', sender: 'Alice Smith', content: 'See you tomorrow!', timestamp: new Date(), type: 'received' },
    ],
    '2': [
      { id: 'm5', sender: 'Bob Johnson', content: 'Did you see the results?', timestamp: new Date(), type: 'received' },
      { id: 'm6', sender: 'Me', content: 'Yeah, just checked them.', timestamp: new Date(), type: 'sent' },
      { id: 'm7', sender: 'Bob Johnson', content: 'Okay, sounds good.', timestamp: new Date(), type: 'received' },
    ],
    '3': [
       { id: 'm8', sender: 'Coach Davis', content: 'Practice is at 6 AM.', timestamp: new Date(), type: 'received' },
    ]
  };


  return (
    <div className="chat-page-container">
      {/* Removed the h1 title to make it cleaner like a messaging app */}
      <ChatComponent
        conversations={demoConversations}
        messagesData={demoMessages}
        currentUser={user}
      />
    </div>
  );
};

export default ChatPage;
