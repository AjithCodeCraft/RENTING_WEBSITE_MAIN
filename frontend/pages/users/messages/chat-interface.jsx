"use client";

import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

function UserChatInterface() {
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedApartmentTitle, setSelectedApartmentTitle] = useState("Select a contact");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [apartmentTitles, setApartmentTitles] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Refs for scrolling
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);

  // Cache for messages
  const messagesCache = useRef({});

  // Fetch user ID from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userIdFromStorage = localStorage.getItem("user_id_number");
      setUserId(userIdFromStorage);
    }
  }, []);

  // Fetch user contacts
  const fetchContacts = async () => {
    if (!userId) return;

    try {
      const accessToken = localStorage.getItem("access_token_user");
      const response = await fetch(`http://127.0.0.1:8000/api/get_messages/user/${userId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error("Failed to fetch contacts");

      const data = await response.json();
      const uniqueContacts = [...new Set(data.flatMap((msg) => [msg.sender, msg.receiver]))]
        .filter((id) => String(id) !== String(userId));

      setContacts(uniqueContacts);

      // Fetch apartment names for each contact
      fetchApartmentTitles(uniqueContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  // Fetch apartment titles for contacts
  const fetchApartmentTitles = async (ownerIds) => {
    const titles = { ...apartmentTitles };

    for (const ownerId of ownerIds) {
      try {
        const accessToken = localStorage.getItem("access_token_user");
        const response = await fetch(`http://127.0.0.1:8000/api/apartment/by-owner/${ownerId}/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.apartments.length > 0) {
            titles[ownerId] = data.apartments[0].title; // Store first apartment title
          } else {
            titles[ownerId] = `Owner ${ownerId}`; // Fallback name
          }
        }
      } catch (error) {
        console.error(`Error fetching apartment for owner ${ownerId}:`, error);
        titles[ownerId] = `Owner ${ownerId}`; // Fallback name
      }
    }

    setApartmentTitles(titles);
  };

  // Check for new messages and update if needed
  const checkForNewMessages = async () => {
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
      const updatedMessages = data.map((message) => ({
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
        isSentByCurrentUser: String(message.sender) === String(userId),
      }));

      updatedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Check if there are new messages by comparing with current state
      if (JSON.stringify(updatedMessages) !== JSON.stringify(messages)) {
        setMessages(updatedMessages);
        // Update cache
        messagesCache.current[selectedContactId] = updatedMessages;
        // Scroll to bottom if new messages
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error checking for new messages:", error);
    }
  };

  // Fetch messages for the selected contact
  const fetchMessages = async () => {
    if (!userId || !selectedContactId) return;

    setIsLoading(true);

    // First check if we have cached messages
    if (messagesCache.current[selectedContactId]) {
      setMessages(messagesCache.current[selectedContactId]);
      setIsLoading(false);
      setTimeout(scrollToBottom, 100); // Scroll after a short delay

      // Fetch in background to update cache
      updateCachedMessages();
      return;
    }

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
      const updatedMessages = data.map((message) => ({
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
        isSentByCurrentUser: String(message.sender) === String(userId),
      }));

      updatedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setMessages(updatedMessages);

      // Update cache
      messagesCache.current[selectedContactId] = updatedMessages;

      setTimeout(scrollToBottom, 100); // Scroll after a short delay
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update cached messages in the background
  const updateCachedMessages = async () => {
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
      const updatedMessages = data.map((message) => ({
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
        isSentByCurrentUser: String(message.sender) === String(userId),
      }));

      updatedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Update state only if there are differences
      if (JSON.stringify(updatedMessages) !== JSON.stringify(messages)) {
        setMessages(updatedMessages);
        messagesCache.current[selectedContactId] = updatedMessages;
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error updating cached messages:", error);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fetch contacts and messages on mount
  useEffect(() => {
    fetchContacts();
    if (selectedContactId) {
      fetchMessages();
    }
  }, [userId, selectedContactId]);

  // Set up interval for checking new messages
  useEffect(() => {
    if (selectedContactId) {
      const interval = setInterval(checkForNewMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedContactId, userId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Handle selecting a contact
  const handleSelectContact = (contactId) => {
    setSelectedContactId(contactId);
    setSelectedApartmentTitle(apartmentTitles[contactId] || `Owner ${contactId}`);
  };

  // Send a message
  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !selectedContactId) return;

    try {
      const accessToken = localStorage.getItem("access_token_user");
      const receiverId = Number(selectedContactId);

      // Optimistically add the message to UI first for immediate feedback
      const tempMessage = {
        id: `temp-${Date.now()}`,
        message: newMessage,
        sender: userId,
        receiver: selectedContactId,
        timestamp: new Date().toISOString(),
        isSentByCurrentUser: true,
        sending: true, // Flag to show sending status
      };

      setMessages((prevMessages) => [...prevMessages, tempMessage]);
      const messageToSend = newMessage;
      setNewMessage("");

      // Scroll to bottom immediately
      setTimeout(scrollToBottom, 10);

      const response = await fetch(`http://127.0.0.1:8000/api/chat/send-message/${receiverId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      // Update messages to reflect the sent status
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === tempMessage.id
            ? { ...msg, sending: false, id: `sent-${Date.now()}` }
            : msg
        )
      );

      // Update cache
      messagesCache.current[selectedContactId] = messages;
    } catch (error) {
      console.error("Error sending message:", error);
      // Show error status on the message
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === `temp-${Date.now()}`
            ? { ...msg, sending: false, error: true }
            : msg
        )
      );
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
                    <h3 className="font-semibold">{apartmentTitles[contactId] || `Owner ${contactId}`}</h3>
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
            <h2 className="text-xl font-semibold">{selectedApartmentTitle}</h2>
          </div>

          {/* Chat Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-grow p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            ) : messages.length > 0 ? (
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
                          ? message.sending
                            ? "bg-green-400 text-white opacity-80" // Sending state
                            : message.error
                              ? "bg-red-500 text-white" // Error state
                              : "bg-green-500 text-white" // Sent state
                          : "bg-white text-black border" // Received state
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

export default UserChatInterface;