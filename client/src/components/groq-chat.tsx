import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  Code, 
  Rocket, 
  AlertCircle,
  Loader2
} from "lucide-react";
import type { GroqConversation } from "@shared/schema";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

const SUGGESTED_PROMPTS = [
  {
    icon: Rocket,
    text: "How do I optimize my React app for deployment?",
    category: "Deployment"
  },
  {
    icon: Code,
    text: "What's the best build configuration for Next.js?",
    category: "Build"
  },
  {
    icon: AlertCircle,
    text: "My deployment failed with a build error, help me debug it",
    category: "Debugging"
  },
  {
    icon: Lightbulb,
    text: "Suggest performance optimizations for my web app",
    category: "Optimization"
  }
];

export function GroqChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load conversation history
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/groq/conversations"],
    enabled: !!user,
  });

  // Convert conversations to chat messages
  useEffect(() => {
    if (conversations.length > 0 && messages.length === 0) {
      const chatMessages: ChatMessage[] = [];
      conversations.slice(0, 10).reverse().forEach((conv: GroqConversation) => {
        chatMessages.push({
          id: `user-${conv.id}`,
          role: 'user',
          content: conv.message,
          timestamp: new Date(conv.createdAt),
        });
        chatMessages.push({
          id: `assistant-${conv.id}`,
          role: 'assistant',
          content: conv.response,
          timestamp: new Date(conv.createdAt),
        });
      });
      setMessages(chatMessages);
    }
  }, [conversations, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/groq/chat", {
        message,
        response: "", // Will be filled by server
      });
      return response.json();
    },
    onSuccess: (data: GroqConversation) => {
      // Remove loading message and add real response
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [
          ...filtered,
          {
            id: `assistant-${data.id}`,
            role: 'assistant',
            content: data.response,
            timestamp: new Date(data.createdAt),
          }
        ];
      });
      setIsTyping(false);
      queryClient.invalidateQueries({ queryKey: ["/api/groq/conversations"] });
    },
    onError: (error) => {
      setIsTyping(false);
      setMessages(prev => prev.filter(m => !m.isLoading));
      
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || input.trim();
    if (!message || sendMessageMutation.isPending) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    // Add loading assistant message
    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput("");
    setIsTyping(true);

    // Send to API
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: ChatMessage) => {
    if (message.isLoading) {
      return (
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="glass-morphism rounded-lg p-4 border-primary/20">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-gray-400">GroqAI is thinking...</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const isUser = message.role === 'user';
    
    return (
      <div key={message.id} className={`flex items-start space-x-3 mb-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-primary/20' 
            : 'bg-gradient-to-br from-primary to-purple-600'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-primary" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`rounded-lg p-4 ${
            isUser 
              ? 'bg-primary text-white ml-auto max-w-xs' 
              : 'glass-morphism border-primary/20'
          }`}>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
            <div className={`text-xs mt-2 ${isUser ? 'text-primary-foreground/70' : 'text-gray-500'}`}>
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (conversationsLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">GroqAI Assistant</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                I'm here to help you with deployment issues, code optimization, and development questions. 
                How can I assist you today?
              </p>
            </div>

            {/* Suggested Prompts */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-400 text-center">Try asking me about:</h4>
              <div className="grid gap-3">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <Card 
                    key={index}
                    className="glass-morphism hover:bg-white/10 transition-all-300 cursor-pointer border-gray-700 hover:border-primary/50"
                    onClick={() => handleSendMessage(prompt.text)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                          <prompt.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{prompt.text}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {prompt.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center space-x-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about deployments, optimization, or development..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || sendMessageMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {isTyping && (
          <div className="flex items-center space-x-2 mt-2 text-xs text-gray-400">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span>GroqAI is typing...</span>
          </div>
        )}
      </div>
    </div>
  );
}
