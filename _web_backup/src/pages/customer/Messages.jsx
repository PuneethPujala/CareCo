import React, { useState } from 'react';
import { Send, Phone, Video, MoreVertical, Search, ArrowLeft } from 'lucide-react';
import { mockMessages, mockChatHistory } from '../../mockData/messages';
import Button from '../../components/common/Button';

const Messages = () => {
    const [activeChat, setActiveChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [history, setHistory] = useState(mockChatHistory);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message = {
            id: history.length + 1,
            sender: 'Me',
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        setHistory([...history, message]);
        setNewMessage('');
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            {/* Sidebar List */}
            <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {mockMessages.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setActiveChat(chat)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${activeChat?.id === chat.id ? 'bg-blue-50' : ''
                                }`}
                        >
                            <div className="relative">
                                <img
                                    src={chat.avatar || `https://ui-avatars.com/api/?name=${chat.sender}`}
                                    alt={chat.sender}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                {chat.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-gray-900 truncate">{chat.sender}</h3>
                                    <span className="text-xs text-gray-500">{chat.timestamp}</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                            </div>
                            {chat.unread > 0 && (
                                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
                                    {chat.unread}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-3">
                                <button
                                    className="md:hidden p-2 -ml-2 text-gray-600"
                                    onClick={() => setActiveChat(null)}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <img
                                    src={activeChat.avatar || `https://ui-avatars.com/api/?name=${activeChat.sender}`}
                                    alt={activeChat.sender}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="font-bold text-gray-900">{activeChat.sender}</h3>
                                    <p className="text-xs text-green-600 flex items-center">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-purple-600 bg-gray-50 rounded-lg">
                                    <Video className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {history.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${msg.isMe
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.text}</p>
                                        <p className={`text-[10px] mt-1 text-right ${msg.isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                            {msg.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-200"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/30">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700">Select a conversation</h3>
                        <p className="text-sm max-w-xs mt-2">Choose a contact from the list to start messaging.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
