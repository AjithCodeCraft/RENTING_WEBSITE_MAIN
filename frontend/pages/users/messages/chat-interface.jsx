"use client";

import React, { useState } from "react";
import ContactList from "./contact-list";
import MessageList from "./message-list";

function ChatInterface() {
  const [selectedContactId, setSelectedContactId] = useState("1");
  const [selectedContactName, setSelectedContactName] = useState("Alice Johnson");

  const handleSelectContact = (contactId) => {
    setSelectedContactId(contactId);
    setSelectedContactName(contactId === "1" ? "Alice Johnson" : "Bob Smith");
  };

  return (
    <div className="flex h-screen bg-background px-8 py-8">
      <div className="w-1/3 border-r">
        <ContactList onSelectContact={handleSelectContact} selectedContactId={selectedContactId} />
      </div>
      <div className="w-2/3">
        <MessageList selectedContactId={selectedContactId} selectedContactName={selectedContactName} />
      </div>
    </div>
  );
}

export default ChatInterface;
