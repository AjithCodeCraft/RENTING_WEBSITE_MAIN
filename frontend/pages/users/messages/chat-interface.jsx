"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const dummyContacts = [
  {
    id: "1",
    name: "Alice Johnson",
    lastMessage: "That sounds great! Let's do it.",
    lastMessageTime: "10:30 AM",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Bob Smith",
    lastMessage: "Can you send me the report?",
    lastMessageTime: "Yesterday",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

function ChatInterface() {
  const [selectedContactId, setSelectedContactId] = useState("1");
  const [selectedContactName, setSelectedContactName] = useState("Alice Johnson");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Fetch messages for the selected contact
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await fetch(
          `http://localhost:8000/api/get_all_send_received_messages_with/${selectedContactId}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedContactId]);

  // Fetch notifications for the current user
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await fetch("http://localhost:8000/api/get_user_notifications/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
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
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/mark_notification_as_read/", {
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
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8000/api/send_message/${selectedContactId}/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Add the new message to the messages state
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: String(prevMessages.length + 1),
          content: newMessage,
          sender: "You",
          isCurrentUser: true,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
    const selectedContact = dummyContacts.find((contact) => contact.id === contactId);
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
            {dummyContacts.map((contact) => (
              <div
                key={contact.id}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  contact.id === selectedContactId ? "bg-primary/10" : "hover:bg-muted"
                }`}
                onClick={() => handleSelectContact(contact.id)}
              >
                <Avatar className="w-10 h-10 mr-3">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback>{contact.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h3 className="font-semibold">{contact.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                </div>
                <span className="text-xs text-muted-foreground">{contact.lastMessageTime}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="w-2/3">
        <div className="h-[calc(100vh-4rem)] flex flex-col">
          <div className="bg-primary text-primary-foreground p-4">
            <h2 className="text-xl font-semibold">Chat with {selectedContactName}</h2>
          </div>
          <ScrollArea className="flex-grow p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div className={`flex ${message.isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end`}>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={message.sender} />
                      <AvatarFallback>{message.sender[0]}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`mx-2 p-3 rounded-lg ${
                        message.isCurrentUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.isCurrentUser ? "text-primary-foreground/70" : "text-secondary-foreground/70"
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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