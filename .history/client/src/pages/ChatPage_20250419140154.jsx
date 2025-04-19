import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Redirect } from 'react-router-dom';
import ChatComponent from '../components/chat/ChatComponent';
import Loader from '../components/common/Loader';

const ChatPage = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <Loader />;
    }

    if (!user) {
        return <Redirect to="/login" />;
    }

    return (
        <div className="chat-page-container">
            <h1>Messages</h1>
            <ChatComponent />
        </div>
    );
};

export default ChatPage;
