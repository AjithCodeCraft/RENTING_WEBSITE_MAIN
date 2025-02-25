"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

function ChatInterface() {
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedContactName, setSelectedContactName] = useState("Select a contact");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [userId, setUserId] = useState(null);

  // Fetch user ID from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userIdFromStorage = localStorage.getItem("user_id");
      setUserId(userIdFromStorage);
    }
  }, []);

  // Fetch user contacts
  const fetchContacts = async () => {
    if (!userId) return;

    try {
      const accessToken = localStorage.getItem("access_token_user");
      const response = await fetch(`http://127.0.0.1:8000/api/messages/sent/${userId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error("Failed to fetch contacts");

      const data = await response.json();
      const uniqueContacts = [...new Set(data.flatMap((msg) => [msg.sender, msg.receiver]))]
        .filter((id) => String(id) !== String(userId) && id !== 65); // Exclude user 65

      setContacts(uniqueContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    if (!userId || !selectedContactId) return;

    try {
      const accessToken = localStorage.getItem("access_token_user");
      const response = await fetch(
        `http://127.0.0.1:8000/api/chat/get-all-send-received-messages-with/${selectedContactId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();

      // Ensure correct message alignment
      const updatedMessages = data.map((message) => ({
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
        isSentByCurrentUser: String(message.sender) === String(userId), // Check sender ID
      }));

      updatedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts();
  }, [userId]);

  // Fetch messages when selectedContactId changes
  useEffect(() => {
    if (selectedContactId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedContactId, userId]);

  // Handle selecting a contact
  const handleSelectContact = (contactId) => {
    setSelectedContactId(contactId);
    setSelectedContactName(contactId === 65 ? "User 115" : `User ${contactId}`);
    fetchMessages();
  };

  // Send a message
  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !selectedContactId) return;

    try {
      const accessToken = localStorage.getItem("access_token_user");
      const receiverId = Number(selectedContactId);

      const response = await fetch(`http://127.0.0.1:8000/api/chat/send-message/${receiverId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newMessage }),

        
      });

      if (!response.ok) throw new Error("Failed to send message");

      console.log("Message sent:", newMessage);
      
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: String(Date.now()),
          message: newMessage,
          sender: userId,
          receiver: selectedContactId,
          timestamp: new Date().toISOString(),
          isSentByCurrentUser: true,
        },
      ]);

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex h-screen bg-background px-8 py-8">
      {/* Contact List */}
      <div className="w-1/3 border-r">
        <ScrollArea className="h-[calc(100vh-4rem)] w-full">
          <div className="space-y-2 p-4">
            {contacts.length > 0 ? (
              contacts.map((contactId) => (
                <div
                  key={contactId}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    contactId === selectedContactId ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                  onClick={() => handleSelectContact(contactId)}
                >
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarFallback>{contactId}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <h3 className="font-semibold">{contactId === 65 ? "User 115" : `User ${contactId}`}</h3>
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
            <h2 className="text-xl font-semibold">{selectedContactName}</h2>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="flex-grow p-4">
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isSentByCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-lg ${
                        message.isSentByCurrentUser
                          ? "bg-green-500 text-white" // Right-aligned messages (sent by the user) → Green
                          : "bg-white text-black border" // Left-aligned messages (received) → White
                      }`}
                    >
                      <p>
                        {message.sender === 65 ? "User 115" : `User ${message.sender}`}: {message.message}
                      </p>
                      <p className="text-xs mt-1 text-right">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No messages yet.</p>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 bg-background">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Type a message..."
                className="flex-grow"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
