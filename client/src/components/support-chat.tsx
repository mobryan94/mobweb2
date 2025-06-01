import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Send, X, User, Bot } from "lucide-react";

interface ChatMessage {
  id: string;
  message: string;
  isAdmin: boolean;
  timestamp: string;
}

export function SupportChat() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      message: "Hello! How can I help you today?",
      isAdmin: true,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => apiRequest("/api/support/message", {
      method: "POST",
      body: JSON.stringify({ message }),
      headers: { "Content-Type": "application/json" },
    }),
    onSuccess: () => {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        message: newMessage,
        isAdmin: false,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);
      setNewMessage("");
      
      // Simulate admin response (in real app, this would come from WebSocket)
      setTimeout(() => {
        const adminResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: "Thanks for contacting support! We'll get back to you soon.",
          isAdmin: true,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, adminResponse]);
      }, 1000);
    },
    onError: () => {
      toast({
        title: "Message failed to send",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50"
            size="icon"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md h-[500px] p-0 bg-black border-gray-700">
          <DialogHeader className="p-4 border-b border-gray-700">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span>Support Chat</span>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400">
                Online
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {/* Chat Messages */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isAdmin ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isAdmin
                      ? "bg-gray-800 text-white"
                      : "bg-primary text-white"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {message.isAdmin ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="text-xs opacity-70">
                      {message.isAdmin ? "Support" : "You"}
                    </span>
                  </div>
                  <p className="text-sm">{message.message}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Direct line to admin • Response within 24h
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
