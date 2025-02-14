import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

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

function MessageList({ selectedContactId, selectedContactName }) {
  const messages = dummyMessages[selectedContactId] || [];

  return (
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
                    className={`text-xs mt-1 ${message.isCurrentUser ? "text-primary-foreground/70" : "text-secondary-foreground/70"}`}
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
          <Input placeholder="Type a message..." className="flex-grow" />
          <Button size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MessageList;