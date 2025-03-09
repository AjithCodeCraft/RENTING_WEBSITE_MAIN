"use client"; // Mark this as a Client Component in Next.js 13+

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

  // Initialize the worker
  useEffect(() => {
    if (!ownerIdNumber) return;

    // Create the worker
    workerRef.current = new Worker(new URL("./worker", import.meta.url));

    workerRef.current.onmessage = (e) => {
      if (e.data.type === "newMessages") {
        processNewMessages(e.data.data);
        setLastFetchTime(e.data.timestamp);
      } else if (e.data.type === "error") {
        console.error("Worker error:", e.data.error);
      }
    };

    // Start the worker
    workerRef.current.postMessage({
      type: "start",
      ownerId: ownerIdNumber,
      accessToken: localStorage.getItem("access_token_owner"),
    });

    // Clean up on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: "stop" });
        workerRef.current.terminate();
      }
    };
  }, [ownerIdNumber]);

  // Process new messages
  const processNewMessages = (data) => {
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

    // Sort messages by timestamp
    Object.keys(groupedMessages).forEach((contactId) => {
      groupedMessages[contactId].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });

    // Update state
    setMessages(groupedMessages);
    setContacts(Array.from(uniqueContactIds).filter((id) => parseInt(id) !== parseInt(ownerIdNumber)));
    fetchUserNames(Array.from(uniqueContactIds));
    setIsLoading(false);
  };

  // Fetch user names
  const fetchUserNames = async (userIds) => {
    const names = { ...userNames };
    const fetchPromises = userIds.map((userId) => {
      if (!names[userId]) {
        return fetch(`http://127.0.0.1:8000/api/get_user_details/${userId}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token_owner")}` },
        })
          .then((response) => response.json())
          .then((data) => {
            names[userId] = data.name || `User ${userId}`;
          })
          .catch((error) => {
            console.error(`Error fetching user details for user ${userId}:`, error);
            names[userId] = `User ${userId}`;
          });
      }
    });

    await Promise.all(fetchPromises);
    setUserNames(names);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContactId) return;

    try {
      const accessToken = localStorage.getItem("access_token_owner");
      const receiverId = parseInt(selectedContactId);

      // Optimistically add message to UI
      const tempMessage = {
        id: `temp-${Date.now()}`,
        message: newMessage,
        sender: parseInt(ownerIdNumber),
        receiver: receiverId,
        timestamp: new Date().toISOString(),
        isSentByCurrentUser: true,
        sending: true,
      };

      setMessages((prevMessages) => ({
        ...prevMessages,
        [selectedContactId]: [...(prevMessages[selectedContactId] || []), tempMessage],
      }));

      setNewMessage("");
      setTimeout(scrollToBottom, 10);

      const response = await fetch(`http://127.0.0.1:8000/api/chat/send-message/${receiverId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      setMessages((prevMessages) => ({
        ...prevMessages,
        [selectedContactId]: prevMessages[selectedContactId].map((msg) =>
          msg.id === tempMessage.id ? { ...msg, sending: false } : msg
        ),
      }));
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => ({
        ...prevMessages,
        [selectedContactId]: prevMessages[selectedContactId].map((msg) =>
          msg.id === tempMessage.id ? { ...msg, sending: false, error: true } : msg
        ),
      }));
    }
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
              contacts.map((contactId) => (
                <div
                  key={contactId}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    contactId === selectedContactId ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedContactId(contactId)}
                >
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarFallback>
                      {userNames[contactId] ? userNames[contactId].charAt(0).toUpperCase() : contactId.toString().charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <h3 className="font-semibold">{userNames[contactId] || `User ${contactId}`}</h3>
                  </div>
                </div>
              ))
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
                            ? "bg-green-400 text-white opacity-80"
                            : message.error
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-white"
                          : "bg-white text-black border"
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
                              })}
                      </p>
                    </div>
                  </div>
                ))}
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