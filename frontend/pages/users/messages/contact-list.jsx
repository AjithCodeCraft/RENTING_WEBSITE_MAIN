import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  {
    id: "3",
    name: "Carol Williams",
    lastMessage: "Happy birthday!",
    lastMessageTime: "2 days ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "David Brown",
    lastMessage: "See you at the meeting",
    lastMessageTime: "3 days ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    name: "Eva Davis",
    lastMessage: "Thanks for your help!",
    lastMessageTime: "Last week",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

function ContactList({ onSelectContact, selectedContactId }) {
  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-full">
      <div className="space-y-2 p-4">
        {dummyContacts.map((contact) => (
          <div
            key={contact.id}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
              contact.id === selectedContactId ? "bg-primary/10" : "hover:bg-muted"
            }`}
            onClick={() => onSelectContact(contact.id)}
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
  );
}

export default ContactList;
