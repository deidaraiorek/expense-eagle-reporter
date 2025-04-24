
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { getReceipts, users } from "../utils/mockData";

interface Message {
  text: string;
  isBot: boolean;
}

export const ExpenseChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I can help you analyze expense data. Try asking 'How much did Jane spend?'", isBot: true }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: input, isBot: false }]);

    // Process the query
    const response = processQuery(input);
    
    // Add bot response
    setMessages(prev => [...prev, { text: response, isBot: true }]);
    
    // Clear input
    setInput("");
  };

  const processQuery = (query: string) => {
    // Demo: Specifically handle the Jane question
    if (query.toLowerCase().includes("how much did jane spend")) {
      // Find Jane's ID
      const jane = users.find(u => u.firstName.toLowerCase() === "jane");
      if (!jane) return "I couldn't find Jane in the system.";

      // Get Jane's approved receipts
      const receipts = getReceipts();
      const janesApprovedReceipts = receipts.filter(
        r => r.userId === jane.id && r.status === "approved"
      );

      const total = janesApprovedReceipts.reduce((sum, r) => sum + r.total, 0);
      
      return `Jane's approved expenses total $${total.toFixed(2)} across ${janesApprovedReceipts.length} receipts.`;
    }

    return "I can help you analyze expense data. Try asking 'How much did Jane spend?'";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Expense Chatbot</h2>
      </div>
      
      <ScrollArea className="h-[400px] mb-4 pr-4">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  msg.isBot 
                    ? "bg-secondary text-secondary-foreground" 
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about expenses..."
          className="flex-1"
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </Card>
  );
};
