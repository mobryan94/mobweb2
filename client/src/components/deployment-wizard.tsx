import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UploadZone } from "@/components/ui/upload-zone";
import { DeploymentPlatformSelector } from "@/components/deployment-platform-selector";
import { 
  Upload, 
  Github, 
  Bot, 
  Send, 
  User, 
  Rocket, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  MessageCircle
} from "lucide-react";

const createAppSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subdomain: z.string().min(1, "Subdomain is required").regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  sourceType: z.enum(["github", "zip"]),
  sourceUrl: z.string().optional(),
  platform: z.string().min(1, "Platform is required"),
  environment: z.string().min(1, "Environment is required"),
});

type CreateAppForm = z.infer<typeof createAppSchema>;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface DeploymentWizardProps {
  onSuccess?: () => void;
}

export function DeploymentWizard({ onSuccess }: DeploymentWizardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deploymentStep, setDeploymentStep] = useState<'setup' | 'deploying' | 'complete'>('setup');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I\'m here to help with your deployment. I can assist with:\n\n• Project setup and configuration\n• Build optimization\n• Troubleshooting deployment issues\n• Best practices for your framework\n\nWhat would you like to deploy today?',
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const { toast } = useToast();

  const form = useForm<CreateAppForm>({
    resolver: zodResolver(createAppSchema),
    defaultValues: {
      sourceType: "zip",
      platform: "",
      environment: "",
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/groq/public-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Help with deployment: ${message}`,
          context: 'deployment_wizard'
        })
      });
      if (!response.ok) throw new Error('Chat request failed');
      return await response.json();
    },
    onSuccess: (data: any) => {
      setChatMessages(prev => prev.map(msg => 
        msg.isLoading ? { ...msg, content: data.response, isLoading: false } : msg
      ));
    },
    onError: () => {
      setChatMessages(prev => prev.map(msg => 
        msg.isLoading ? { 
          ...msg, 
          content: 'I apologize, but I\'m having trouble connecting right now. Please try again.',
          isLoading: false 
        } : msg
      ));
    }
  });

  const createAppMutation = useMutation({
    mutationFn: async (data: CreateAppForm) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('subdomain', data.subdomain);
      formData.append('description', data.description || '');
      formData.append('sourceType', data.sourceType);
      formData.append('platform', data.platform);
      formData.append('environment', data.environment);

      if (data.sourceType === 'github' && data.sourceUrl) {
        formData.append('sourceUrl', data.sourceUrl);
      } else if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create application');
      }

      return await response.json();
    },
    onSuccess: () => {
      setDeploymentStep('complete');
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      toast({
        title: "Success!",
        description: "Your application has been deployed successfully.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Deployment failed",
        description: error.message || "Failed to deploy application",
      });
    },
  });

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    setChatMessages(prev => [...prev, userMessage, loadingMessage]);
    chatMutation.mutate(chatInput);
    setChatInput('');
  };

  const onSubmit = (data: CreateAppForm) => {
    if (data.sourceType === 'zip' && !selectedFile) {
      toast({
        variant: "destructive",
        title: "File required",
        description: "Please select a file to upload",
      });
      return;
    }
    setDeploymentStep('deploying');
    createAppMutation.mutate(data);
  };

  if (deploymentStep === 'deploying') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <h3 className="text-xl font-semibold">Deploying Your Application</h3>
            <p className="text-gray-600">Please wait while we set up your deployment...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (deploymentStep === 'complete') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h3 className="text-2xl font-bold">Deployment Complete!</h3>
            <p className="text-gray-600">Your application has been successfully deployed.</p>
            <Button onClick={() => setDeploymentStep('setup')}>
              Deploy Another App
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Deployment Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Rocket className="w-5 h-5 mr-2 text-primary" />
              Deploy New Application
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My awesome app" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subdomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subdomain</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <Input placeholder="my-app" {...field} />
                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              .seskrow.com
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your application..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sourceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deployment Source</FormLabel>
                      <Tabs value={field.value} onValueChange={field.onChange}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="zip" className="flex items-center">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Files
                          </TabsTrigger>
                          <TabsTrigger value="github" className="flex items-center">
                            <Github className="w-4 h-4 mr-2" />
                            GitHub Repository
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="zip" className="mt-4">
                          <UploadZone
                            onFileSelect={setSelectedFile}
                            selectedFile={selectedFile}
                            accept=".zip,.tar,.tar.gz"
                            maxSizeMB={100}
                          />
                        </TabsContent>

                        <TabsContent value="github" className="mt-4">
                          <FormField
                            control={form.control}
                            name="sourceUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>GitHub Repository URL</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="https://github.com/username/repository"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                      </Tabs>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <FormControl>
                          <Input placeholder="vercel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="environment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Environment</FormLabel>
                        <FormControl>
                          <Input placeholder="production" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="outputDir"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Output Directory</FormLabel>
                        <FormControl>
                          <Input placeholder="dist" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Platform Selection */}
                <div className="space-y-4">
                  <DeploymentPlatformSelector
                    onPlatformSelect={(platform, environment) => {
                      form.setValue("platform", platform);
                      form.setValue("environment", environment);
                    }}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createAppMutation.isPending}>
                  {createAppMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Deploy Application
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant */}
      <div className="lg:col-span-1">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-primary">
              <Bot className="w-5 h-5 mr-2" />
              AI Deployment Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-600'
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
                          : 'bg-gray-50 text-gray-900 border'
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

            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask about deployment, frameworks, or get help..."
                  disabled={chatMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || chatMutation.isPending}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
