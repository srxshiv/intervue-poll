import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleChat, clearUnreadCount } from '../store/chatSlice';
import socketService from '../services/socket';
import StudentsList from './StudentsList';

const Chat = ({ userType, userName = 'Teacher' }) => {
  const dispatch = useDispatch();
  const { messages, isOpen, unreadCount } = useSelector(state => state.chat);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearUnreadCount());
    }
  }, [isOpen, dispatch]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socketService.sendMessage(message.trim(), userName, userType);
      setMessage('');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => dispatch(toggleChat())}
        className={`relative p-3 rounded-full shadow-lg transition-all duration-200 ${
          userType === 'teacher' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
        } text-white`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col h-96">
          <div className={`p-0 rounded-t-lg text-white ${
            userType === 'teacher' ? 'bg-blue-600' : 'bg-green-600'
          }`}>
            <div className="flex justify-between items-center px-4 pt-4 pb-0">
              <h3 className="font-semibold">{activeTab === 'chat' ? 'Chat' : 'Participants'}</h3>
              <button
                onClick={() => dispatch(toggleChat())}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex border-b border-blue-500 bg-white text-blue-600">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-tl-lg ${activeTab === 'chat' ? 'bg-blue-100' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                Chat
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-tr-lg ${activeTab === 'participants' ? 'bg-blue-100' : ''}`}
                onClick={() => setActiveTab('participants')}
              >
                Participants
              </button>
            </div>
          </div>

          {activeTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === userName ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        msg.sender === userName
                          ? userType === 'teacher'
                            ? 'bg-blue-600 text-white'
                            : 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="text-xs opacity-75 mb-1">
                        {msg.sender} • {formatTime(msg.timestamp)}
                      </div>
                      <div>{msg.message}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a message..."
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className={`px-4 py-2 rounded-md text-white disabled:opacity-50 ${
                      userType === 'teacher' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          )}
          {activeTab === 'participants' && (
            <div className="flex-1 overflow-y-auto p-4">
              <StudentsList userType={userType} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;