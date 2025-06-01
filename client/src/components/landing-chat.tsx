import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, X, Minimize2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface LandingChatProps {
  className?: string;
}

export function LandingChat({ className }: LandingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I\'m your AI deployment assistant. I can help you with:\n\n• Questions about SESKROW platform\n• Deployment best practices\n• Code optimization tips\n• Troubleshooting guidance\n\nWhat would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/groq/public-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `As a SESKROW platform AI assistant, help with: ${message}`,
          context: 'public_landing_page'
        })
      });
      if (!response.ok) throw new Error('Chat request failed');
      return await response.json();
    },
    onSuccess: (data: any) => {
      setMessages(prev => prev.map(msg => 
        msg.isLoading ? { ...msg, content: data.response || data.message || 'Response received', isLoading: false } : msg
      ));
    },
    onError: () => {
      setMessages(prev => prev.map(msg => 
        msg.isLoading ? { 
          ...msg, 
          content: 'I apologize, but I\'m having trouble connecting right now. Please try again or contact our support team.',
          isLoading: false 
        } : msg
      ));
    }
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    chatMutation.mutate(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow"
        >
          <MessageCircle className="w-6 h-6 mr-2" />
          Ask AI Assistant
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Card className="w-96 h-[600px] bg-black/95 border-primary/50 shadow-2xl backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-white">
              <Bot className="w-5 h-5 mr-2 text-primary" />
              AI Assistant
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 text-gray-400 hover:text-white"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[520px]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`flex-1 max-w-[280px] ${
                      message.role === 'user' ? 'text-right' : ''
                    }`}>
                      <div className={`rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-gray-800 text-gray-100 border border-gray-700'
                      }`}>
                        {message.isLoading ? (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-gray-800">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about deployments, features, or get help..."
                  className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  disabled={chatMutation.isPending}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || chatMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
