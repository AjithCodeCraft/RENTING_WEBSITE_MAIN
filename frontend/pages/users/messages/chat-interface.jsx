"use client";

import React, { useState } from "react";
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

const dummyMessages = {
  "1": [
    {
      id: "1",
      content: "Hey there! How's it going?",
      sender: "Alice Johnson",
      isCurrentUser: false,
      timestamp: "10:00 AM",
    },
    {
      id: "2",
      content: "Hi Alice! I'm doing well, thanks for asking. How about you?",
      sender: "You",
      isCurrentUser: true,
      timestamp: "10:02 AM",
    },
  ],
  "2": [
    {
      id: "1",
      content: "Hi, can you send me the report when you get a chance?",
      sender: "Bob Smith",
      isCurrentUser: false,
      timestamp: "Yesterday, 3:30 PM",
    },
    {
      id: "2",
      content: "Sure, I'll send it over right away. Is there anything specific you need from it?",
      sender: "You",
      isCurrentUser: true,
      timestamp: "Yesterday, 3:35 PM",
    },
  ],
};

function ChatInterface() {
  const [selectedContactId, setSelectedContactId] = useState("1");
  const [selectedContactName, setSelectedContactName] = useState("Alice Johnson");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(dummyMessages[selectedContactId] || []);

  const handleSelectContact = (contactId) => {
    setSelectedContactId(contactId);
    const selectedContact = dummyContacts.find((contact) => contact.id === contactId);
    setSelectedContactName(selectedContact ? selectedContact.name : "Unknown");
    setMessages(dummyMessages[contactId] || []);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMessageObj = {
      id: String(messages.length + 1),
      content: newMessage,
      sender: "You",
      isCurrentUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Update the messages for the selected contact
    const updatedMessages = [...messages, newMessageObj];
    setMessages(updatedMessages);

    // Update the dummyMessages object (optional, if you want to persist changes)
    dummyMessages[selectedContactId] = updatedMessages;

    // Clear the input field
    setNewMessage("");
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