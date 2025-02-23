"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Alert } from "@mui/material";

function ChatInterface() {
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedContactName, setSelectedContactName] = useState("Select a contact");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [receiverIds, setReceiverIds] = useState([]);
  const [userId, setUserId] = useState(null);

  // Check if localStorage is available (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userIdFromStorage = localStorage.getItem("user_id");
      setUserId(userIdFromStorage);
    }
  }, []);

  // Fetch messages for the current user
  useEffect(() => {
    if (!userId) return; // Don't fetch messages if userId is not available

    const fetchMessages = async () => {
      try {
        const accessToken = localStorage.getItem("access_token_user");
        const response = await fetch(`http://127.0.0.1:8000/api/messages/sent/${userId}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();
        // Ensure fetched messages have a valid timestamp
        const updatedMessages = data.map((message) => ({
          ...message,
          sender: userId, // Set the sender as the current user
          timestamp: message.timestamp || new Date().toISOString(), // Ensure valid timestamp
        }));
        setMessages(updatedMessages);

        // Extract receiver IDs
        const receivers = [...new Set(data.map(message => message.receiver))];
        setReceiverIds(receivers);

        // Fetch owner details for the first receiver ID
        if (receivers.length > 0) {
          fetchOwnerDetails(receivers[0]);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [userId]);

  // Fetch owner details using receiver ID
  const fetchOwnerDetails = async (receiverId) => {
    try {
      const accessToken = localStorage.getItem("access_token_user");
      const response = await fetch(`http://127.0.0.1:8000/api/get_owner_details_by_receiver/${receiverId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch owner details");
      }

      const data = await response.json();
      setOwnerDetails(data);
      setSelectedContactId(data.id);
      setSelectedContactName(data.name);
    } catch (error) {
      console.error("Error fetching owner details:", error);
    }
  };

  // Fetch notifications for the current user
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const accessToken = localStorage.getItem("access_token_user");
        const response = await fetch("http://127.0.0.1:8000/api/get_user_notifications/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw alert("Failed to fetch notifications");
        }

        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  // Mark notifications as read
  const markNotificationsAsRead = async (notificationIds) => {
    try {
      const accessToken = localStorage.getItem("access_token_user");
      const response = await fetch("http://127.0.0.1:8000/api/mark_notification_as_read/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: notificationIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notifications as read");
      }

      // Remove the read notifications from the state
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => !notificationIds.includes(notification.id))
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;
  
    try {
      const accessToken = localStorage.getItem("access_token_user");
      const receiverId = Number(localStorage.getItem("owner_id"));
  
      if (isNaN(receiverId)) {
        console.error("Invalid receiver ID");
        return;
      }
  
      const requestBody = JSON.stringify({ message: newMessage });
      console.log("Sending message with body:", requestBody);
  
      const response = await fetch(
        `http://127.0.0.1:8000/api/chat/send-message/${receiverId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: requestBody,
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to send message:", errorData);
        throw new Error(errorData.message || "Failed to send message");
      }
  
      const data = await response.json();
      console.log("Message sent successfully:", data);
  
      // Add the new message to the messages state
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: String(prevMessages.length + 1),
          message: newMessage, // Use the correct key "message"
          sender: userId, // Set the sender as the current user
          timestamp: new Date().toISOString(), // Ensure valid timestamp
        },
      ]);
  
      // Clear the input field
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  

  // Handle selecting a contact
  const handleSelectContact = (contactId) => {
    setSelectedContactId(contactId);
    const selectedContact = ownerDetails ? ownerDetails : "Unknown";
    setSelectedContactName(selectedContact ? selectedContact.name : "Unknown");

    // Mark notifications as read when selecting a contact
    const notificationIds = notifications
      .filter((notification) => notification.sender_id === contactId)
      .map((notification) => notification.id);
    if (notificationIds.length > 0) {
      markNotificationsAsRead(notificationIds);
    }
  };

  return (
    <div className="flex h-screen bg-background px-8 py-8">
      <div className="w-1/3 border-r">
        <ScrollArea className="h-[calc(100vh-4rem)] w-full">
          <div className="space-y-2 p-4">
            {ownerDetails ? (
              <div
                key={ownerDetails.id}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  ownerDetails.id === selectedContactId ? "bg-primary/10" : "hover:bg-muted"
                }`}
                onClick={() => handleSelectContact(ownerDetails.id)}
              >
                <Avatar className="w-10 h-10 mr-3">
                  <AvatarImage src={ownerDetails.avatar} alt={ownerDetails.name} />
                  <AvatarFallback>{ownerDetails.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h3 className="font-semibold">{ownerDetails.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{ownerDetails.lastMessage}</p>
                </div>
                <span className="text-xs text-muted-foreground">{ownerDetails.lastMessageTime}</span>
              </div>
            ) : (
              <p className="text-muted-foreground">You don't have any contacts.</p>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="w-2/3">
        <div className="h-[calc(100vh-4rem)] flex flex-col">
          <div className="bg-primary text-primary-foreground p-4">
            <h2 className="text-xl font-semibold">Chat with {selectedContactName}</h2>
          </div>
          <ScrollArea className="flex-grow p-4">
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === userId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-lg ${
                        message.sender === userId
                          ? "bg-green-500 text-white" // Green background for sent messages
                          : "bg-secondary text-secondary-foreground" // Default background for received messages
                      }`}
                    >
                      <p>{message.message}</p> {/* Use the correct key "message" */}
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
              <p className="text-muted-foreground">You don't have any messages.</p>
            )}
          </ScrollArea>
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
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;