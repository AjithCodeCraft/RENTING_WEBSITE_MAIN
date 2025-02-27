"use client";

import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

function AdminChatInterface() {
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedContactName, setSelectedContactName] = useState("Select a contact");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [contacts, setContacts] = useState([]);
  const [ownerIdNumber, setOwnerIdNumber] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  
  // Refs for scrolling and tracking state
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const messageCountsRef = useRef({});
  const workerRef = useRef(null);

  // Fetch owner ID from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ownerIdFromStorage = localStorage.getItem("owner_id_number");
      setOwnerIdNumber(ownerIdFromStorage);
    }
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end"
      });
    }
  };

  // Setup WebSocket or Server-Sent Events connection for real-time updates
  useEffect(() => {
    if (!ownerIdNumber) return;

    // Initial data fetch
    fetchMessagesAndContacts();

    // Create a Web Worker for background polling
    const workerCode = `
      let pollingInterval;
      let lastFetchTime = 0;
      
      self.onmessage = function(e) {
        if (e.data.type === 'start') {
          const ownerId = e.data.ownerId;
          const accessToken = e.data.accessToken;
          
          // Clear any existing interval
          if (pollingInterval) clearInterval(pollingInterval);
          
          // Start polling
          pollingInterval = setInterval(() => {
            fetch(\`http://127.0.0.1:8000/api/get_messages/user/\${ownerId}/\`, {
              headers: { Authorization: \`Bearer \${accessToken}\` },
            })
            .then(response => response.json())
            .then(data => {
              self.postMessage({
                type: 'newMessages',
                data: data,
                timestamp: Date.now()
              });
            })
            .catch(error => {
              self.postMessage({
                type: 'error',
                error: error.message
              });
            });
          }, 5000);
        } else if (e.data.type === 'stop') {
          if (pollingInterval) clearInterval(pollingInterval);
        }
      };
    `;

    // Create a blob from the worker code
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    // Create and start the worker
    workerRef.current = new Worker(workerUrl);
    
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'newMessages') {
        processNewMessages(e.data.data);
        setLastFetchTime(e.data.timestamp);
      } else if (e.data.type === 'error') {
        console.error("Worker error:", e.data.error);
      }
    };
    
    // Start the worker
    workerRef.current.postMessage({
      type: 'start',
      ownerId: ownerIdNumber,
      accessToken: localStorage.getItem("access_token_owner")
    });
    
    // Clean up on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'stop' });
        workerRef.current.terminate();
      }
      URL.revokeObjectURL(workerUrl);
    };
  }, [ownerIdNumber]);

  // Process new messages from the worker
  const processNewMessages = (data) => {
    // Group messages by contact ID
    const groupedMessages = {};
    const uniqueContactIds = new Set();
    
    data.forEach((message) => {
      const contactId = message.sender === parseInt(ownerIdNumber) ? message.receiver : message.sender;
      uniqueContactIds.add(contactId);
      
      if (!groupedMessages[contactId]) {
        groupedMessages[contactId] = [];
      }
      
      groupedMessages[contactId].push({
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
        isSentByCurrentUser: parseInt(message.sender) === parseInt(ownerIdNumber),
      });
    });

    // Sort messages by timestamp for each contact
    Object.keys(groupedMessages).forEach(contactId => {
      groupedMessages[contactId].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });

    // Check if we have new messages for the selected contact
    const hasNewMessages = selectedContactId && 
      groupedMessages[selectedContactId] && 
      messageCountsRef.current[selectedContactId] !== groupedMessages[selectedContactId].length;
    
    // Update message counts
    Object.keys(groupedMessages).forEach(contactId => {
      messageCountsRef.current[contactId] = groupedMessages[contactId].length;
    });

    setMessages(groupedMessages);
    
    // Filter out the owner's ID from the contacts list
    const filteredContacts = Array.from(uniqueContactIds).filter(
      id => parseInt(id) !== parseInt(ownerIdNumber)
    );
    
    setContacts(filteredContacts);
    
    // Fetch names for any new contacts
    fetchUserNames(filteredContacts);
    
    // Scroll to bottom if new messages were added for the selected contact
    if (hasNewMessages) {
      setTimeout(scrollToBottom, 100);
    }
    
    setIsLoading(false);
  };

  // Fetch initial messages and contacts
  const fetchMessagesAndContacts = async () => {
    if (!ownerIdNumber) return;
    
    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem("access_token_owner");
      const response = await fetch(`http://127.0.0.1:8000/api/get_messages/user/${ownerIdNumber}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();
      processNewMessages(data);
      
    } catch (error) {
      console.error("Error fetching messages and contacts:", error);
      setIsLoading(false);
    }
  };

  // Fetch user names in batch for better performance
  const fetchUserNames = async (userIds) => {
    const names = { ...userNames };
    const fetchPromises = [];

    for (const userId of userIds) {
      if (!names[userId]) {  // Only fetch if we don't already have the name
        const fetchPromise = fetch(`http://127.0.0.1:8000/api/get_user_details/${userId}/`, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("access_token_owner")}` 
          },
        })
        .then(response => {
          if (response.ok) return response.json();
          return { name: `User ${userId}` };
        })
        .then(data => {
          names[userId] = data.name || `User ${userId}`;
        })
        .catch(error => {
          console.error(`Error fetching user details for user ${userId}:`, error);
          names[userId] = `User ${userId}`;
        });
        
        fetchPromises.push(fetchPromise);
      }
    }

    await Promise.all(fetchPromises);
    setUserNames(names);
  };

  // Scroll to bottom when selected contact changes or when messages update
  useEffect(() => {
    if (selectedContactId && messages[selectedContactId]) {
      // Use setTimeout to ensure DOM is updated before scrolling
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedContactId, messages]);

  // Handle selecting a contact
  const handleSelectContact = (contactId) => {
    setSelectedContactId(contactId);
    setSelectedContactName(userNames[contactId] || `User ${contactId}`);
    
    // After selecting contact, scroll to bottom of messages
    setTimeout(() => {
      scrollToBottom(false); // Use instant scroll on contact change
    }, 50);
  };

  // Send a message
  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !selectedContactId) return;

    try {
      const accessToken = localStorage.getItem("access_token_owner");
      const receiverId = parseInt(selectedContactId);
      
      // Optimistically add message to UI first
      const tempMessage = {
        id: `temp-${Date.now()}`,
        message: newMessage,
        sender: parseInt(ownerIdNumber),
        receiver: parseInt(selectedContactId),
        timestamp: new Date().toISOString(),
        isSentByCurrentUser: true,
        sending: true
      };
      
      // Add message to state immediately
      setMessages((prevMessages) => ({
        ...prevMessages,
        [selectedContactId]: [...(prevMessages[selectedContactId] || []), tempMessage],
      }));
      
      // Clear input and update message count
      const msgToSend = newMessage;
      setNewMessage("");
      messageCountsRef.current[selectedContactId] = (messageCountsRef.current[selectedContactId] || 0) + 1;
      
      // Scroll to bottom immediately
      setTimeout(scrollToBottom, 10);

      const response = await fetch(`http://127.0.0.1:8000/api/chat/send-message/${receiverId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: msgToSend }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      
      // Update message status to sent
      setMessages((prevMessages) => ({
        ...prevMessages,
        [selectedContactId]: prevMessages[selectedContactId].map(msg => 
          msg.id === tempMessage.id ? { ...msg, sending: false } : msg
        ),
      }));
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Mark message as failed
      setMessages((prevMessages) => ({
        ...prevMessages,
        [selectedContactId]: prevMessages[selectedContactId].map(msg => 
          msg.id === `temp-${Date.now()}` ? { ...msg, sending: false, error: true } : msg
        ),
      }));
    }
  };

  // Get the most recent message for a contact (for display in contact list)
  const getLastMessage = (contactId) => {
    if (!messages[contactId] || messages[contactId].length === 0) return null;
    
    const sortedMessages = [...messages[contactId]].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    return sortedMessages[0];
  };

  return (
    <div className="flex h-screen bg-background px-8 py-8">
      {/* Contact List */}
      <div className="w-1/3 border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Conversations</h2>
          {lastFetchTime > 0 && (
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(lastFetchTime).toLocaleTimeString()}
            </p>
          )}
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)] w-full">
          <div className="space-y-2 p-4">
            {isLoading ? (
              <p className="text-muted-foreground">Loading contacts...</p>
            ) : contacts.length > 0 ? (
              contacts.map((contactId) => {
                const lastMessage = getLastMessage(contactId);
                return (
                  <div
                    key={contactId}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      contactId === selectedContactId ? "bg-primary/10" : "hover:bg-muted"
                    }`}
                    onClick={() => handleSelectContact(contactId)}
                  >
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarFallback>
                        {userNames[contactId] ? userNames[contactId].charAt(0).toUpperCase() : contactId.toString().charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <h3 className="font-semibold">{userNames[contactId] || `User ${contactId}`}</h3>
                      {lastMessage && (
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {lastMessage.isSentByCurrentUser ? "You: " : ""}{lastMessage.message}
                        </p>
                      )}
                    </div>
                    {lastMessage && (
                      <div className="text-xs text-muted-foreground">
                        {new Date(lastMessage.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground">No contacts found.</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Section */}
      <div className="w-2/3">
        <div className="h-[calc(100vh-4rem)] flex flex-col">
          {/* Chat Header */}
          <div className="bg-primary text-primary-foreground p-4">
            <h2 className="text-xl font-semibold">Chat with {selectedContactName}</h2>
          </div>

          {/* Chat Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-grow p-4">
            {isLoading ? (
              <p className="text-muted-foreground">Loading messages...</p>
            ) : selectedContactId && messages[selectedContactId] ? (
              <div className="space-y-4">
                {messages[selectedContactId].map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`flex ${
                      message.isSentByCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-lg ${
                        message.isSentByCurrentUser
                          ? message.sending
                            ? "bg-green-400 text-white opacity-80" // Sending state
                            : message.error
                              ? "bg-red-500 text-white" // Error state
                              : "bg-green-500 text-white" // Sent state
                          : "bg-white text-black border" // Received messages
                      }`}
                    >
                      <p>{message.message}</p>
                      <p className="text-xs mt-1 text-right">
                        {message.sending 
                          ? "Sending..." 
                          : message.error 
                            ? "Failed to send" 
                            : new Date(message.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                        }
                      </p>
                    </div>
                  </div>
                ))}
                {/* This empty div is used as a reference for scrolling to the bottom */}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <p className="text-muted-foreground">
                {selectedContactId ? "No messages yet." : "Select a contact to start chatting."}
              </p>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 bg-background">
            <div className="flex items-center space-x-2">
              <Input
                placeholder={selectedContactId ? "Type a message..." : "Select a contact first"}
                className="flex-grow"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={!selectedContactId}
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage} 
                disabled={!selectedContactId || newMessage.trim() === ""}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminChatInterface;