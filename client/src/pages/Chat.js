import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import apiService from '../services/apiService';
import {
  FaPaperPlane,
  FaMicrophone,
  FaMicrophoneSlash,
  FaRobot,
  FaUser,
  FaInfoCircle,
  FaRegSmile,
  FaRegSadTear,
  FaRegMeh,
  FaPlus,
  FaTrash,
  FaEdit
} from 'react-icons/fa';

const Chat = () => {
  const { currentUser } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Fetch chats on mount
  useEffect(() => {
    fetchChats();
  }, []);
  
  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
    } else {
      setMessages([]);
    }
  }, [activeChat]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const fetchChats = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getChats();
      setChats(response.data.chats || []);
      
      // If we have chats, set the first one as active
      if (response.data.chats && response.data.chats.length > 0) {
        setActiveChat(response.data.chats[0]);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Failed to load your conversations');
      setIsLoading(false);
    }
  };
  
  const fetchMessages = async (chatId) => {
    try {
      setIsLoading(true);
      const response = await apiService.getChat(chatId);
      setMessages(response.data.chat.messages || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load conversation messages');
      setIsLoading(false);
    }
  };
  
  const createNewChat = async () => {
    try {
      setIsLoading(true);
      const title = 'New Conversation';
      const response = await apiService.createChat({ title });
      
      const newChat = response.data.chat;
      setChats(prevChats => [newChat, ...prevChats]);
      setActiveChat(newChat);
      setMessages([]);
      setIsLoading(false);
    } catch (err) {
      console.error('Error creating new chat:', err);
      setError('Failed to create a new conversation');
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeChat) return;
    
    try {
      // Optimistically add user message to UI
      const userMessage = {
        _id: Date.now().toString(),
        content: newMessage,
        isUser: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      
      // Simulate AI typing
      setIsTyping(true);
      
      // Send message to API
      await apiService.addMessage(activeChat._id, {
        content: newMessage,
        isUser: true
      });
      
      // Simulate AI response after a short delay
      setTimeout(async () => {
        try {
          // Process message with AI and get response
          const aiResponse = await apiService.analyzeText(newMessage);
          
          // Add AI response to the chat
          const responseData = await apiService.addMessage(activeChat._id, {
            content: aiResponse.data.response.text || "I'm sorry, I couldn't process that properly.",
            isUser: false
          });
          
          // Update messages with the actual response from server
          const chatResponse = await apiService.getChat(activeChat._id);
          setMessages(chatResponse.data.chat.messages || []);
          
          setIsTyping(false);
        } catch (error) {
          console.error('Error processing AI response:', error);
          
          // Fallback response if AI processing fails
          const fallbackResponse = {
            _id: Date.now().toString() + 1,
            content: "I apologize, but I'm having trouble processing your message right now. Could you try again?",
            isUser: false,
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, fallbackResponse]);
          setIsTyping(false);
        }
      }, 1500);
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      setIsTyping(false);
    }
  };
  
  const startVoiceRecording = () => {
    setIsRecording(true);
    // In a real implementation, this would use the Web Speech API
    // or a service like speechService.js
  };
  
  const stopVoiceRecording = () => {
    setIsRecording(false);
    // Process the recording and convert to text
    // For demo purposes, we'll just add a placeholder
    setNewMessage('Voice message content would appear here');
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const renderChatBubble = (message, index) => {
    const isUserMessage = message.isUser;
    
    return (
      <div 
        key={message._id || index}
        className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        {!isUserMessage && (
          <div className="w-8 h-8 rounded-full bg-secondary-600 flex items-center justify-center text-white mr-2 flex-shrink-0">
            <FaRobot />
          </div>
        )}
        
        <div 
          className={`relative max-w-[80%] px-4 py-2 rounded-xl ${
            isUserMessage 
              ? 'bg-primary-600 text-white rounded-tr-none' 
              : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-tl-none shadow-md'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          <span className={`text-xs absolute bottom-1 ${isUserMessage ? 'right-2 text-white/70' : 'left-2 text-neutral-500 dark:text-neutral-400'}`}>
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        
        {isUserMessage && (
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center ml-2 flex-shrink-0">
            <span className="text-primary-800 dark:text-primary-200 text-xs font-semibold">
              {getInitials(currentUser?.name)}
            </span>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Chat List Sidebar */}
        <div className="md:col-span-1">
          <Card className="h-[calc(100vh-10rem)]">
            <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                rounded
                icon={<FaPlus />}
                onClick={createNewChat}
              />
            </CardHeader>
            
            <div className="overflow-y-auto h-[calc(100%-4rem)]">
              {chats.length > 0 ? (
                <div className="p-2">
                  {chats.map(chat => (
                    <div
                      key={chat._id}
                      className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                        activeChat?._id === chat._id
                          ? 'bg-primary-100 dark:bg-primary-900'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                      onClick={() => setActiveChat(chat)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-neutral-900 dark:text-white">
                          {chat.title || 'Untitled Chat'}
                        </h3>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {new Date(chat.lastMessageAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <FaInfoCircle className="text-neutral-400 text-3xl mb-2" />
                  <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                    No conversations yet.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={createNewChat}
                    icon={<FaPlus />}
                  >
                    Start a New Chat
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        {/* Chat Area */}
        <div className="md:col-span-3">
          <Card className="h-[calc(100vh-10rem)] flex flex-col">
            {activeChat ? (
              <>
                <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center mr-2">
                      <FaRobot className="text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <CardTitle className="text-lg">
                      {activeChat.title || 'New Conversation'}
                    </CardTitle>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<FaEdit />}
                      onClick={() => {
                        const newTitle = prompt('Enter a new title:', activeChat.title);
                        if (newTitle && newTitle.trim()) {
                          // Update chat title
                          apiService.updateChatTitle(activeChat._id, newTitle.trim())
                            .then(() => {
                              setChats(prevChats => 
                                prevChats.map(c => 
                                  c._id === activeChat._id 
                                    ? { ...c, title: newTitle.trim() } 
                                    : c
                                )
                              );
                              setActiveChat(prev => ({ ...prev, title: newTitle.trim() }));
                            })
                            .catch(err => {
                              console.error('Error updating chat title:', err);
                              setError('Failed to update chat title');
                            });
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<FaTrash />}
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this conversation?')) {
                          apiService.deleteChat(activeChat._id)
                            .then(() => {
                              setChats(prevChats => 
                                prevChats.filter(c => c._id !== activeChat._id)
                              );
                              setActiveChat(null);
                            })
                            .catch(err => {
                              console.error('Error deleting chat:', err);
                              setError('Failed to delete conversation');
                            });
                        }
                      }}
                    />
                  </div>
                </CardHeader>
                
                <div className="flex-1 overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-900">
                  {/* Welcome Message if no messages */}
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mb-4">
                        <FaRobot className="text-primary-600 dark:text-primary-400 text-3xl" />
                      </div>
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                        Welcome to Your Mental Health Companion
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 max-w-md mb-4">
                        I'm here to listen, support, and provide guidance. How are you feeling today?
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<FaRegSmile className="text-green-500" />}
                          onClick={() => setNewMessage("I'm feeling good today!")}
                        >
                          Good
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<FaRegMeh className="text-yellow-500" />}
                          onClick={() => setNewMessage("I'm feeling okay, but could be better.")}
                        >
                          Okay
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<FaRegSadTear className="text-red-500" />}
                          onClick={() => setNewMessage("I'm not feeling great today.")}
                        >
                          Not Great
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Messages */}
                  {messages.length > 0 && (
                    <div className="space-y-4">
                      {messages.map((message, index) => renderChatBubble(message, index))}
                      
                      {/* AI Typing Indicator */}
                      {isTyping && (
                        <div className="flex justify-start mb-4">
                          <div className="w-8 h-8 rounded-full bg-secondary-600 flex items-center justify-center text-white mr-2 flex-shrink-0">
                            <FaRobot />
                          </div>
                          <div className="bg-white dark:bg-neutral-800 px-4 py-2 rounded-xl rounded-tl-none shadow-md">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce"></div>
                              <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <Input
                      id="message"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="mb-0 mr-2"
                      ref={inputRef}
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      icon={isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    />
                    
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      icon={<FaPaperPlane />}
                      disabled={!newMessage.trim()}
                    />
                  </form>
                  
                  {error && (
                    <p className="text-error text-sm mt-2">{error}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <FaInfoCircle className="text-neutral-400 text-3xl mb-2" />
                <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                  Select a conversation or start a new one.
                </p>
                <Button
                  variant="primary"
                  onClick={createNewChat}
                  icon={<FaPlus />}
                >
                  Start a New Chat
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat; 