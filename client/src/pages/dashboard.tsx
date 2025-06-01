import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Globe, 
  ExternalLink, 
  Settings, 
  Trash2, 
  Github, 
  Upload, 
  Rocket, 
  BarChart3, 
  Users, 
  Activity,
  LogOut,
  Bot
} from "lucide-react";
import { AnalyticsChart } from "@/components/ui/analytics-chart";
import { GroqChat } from "@/components/groq-chat";
import { DeploymentWizard } from "@/components/deployment-wizard";
import type { Application } from "@shared/schema";
import { SupportChat } from "@/components/support-chat";

const createAppSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subdomain: z.string().min(1, "Subdomain is required").regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  sourceType: z.enum(["github", "zip"]),
  sourceUrl: z.string().optional(),
});

type CreateAppForm = z.infer<typeof createAppSchema>;

export default function Dashboard() {
  const { user, isLoading: userLoading } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showGroqChat, setShowGroqChat] = useState(false);
  const logoPath = "/logo.svg"; // Path to the logo

  const form = useForm<CreateAppForm>({
    resolver: zodResolver(createAppSchema),
    defaultValues: {
      sourceType: "github",
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
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
  }, [user, userLoading, toast]);

  // Fetch applications
  const { data: applications = [], isLoading: appsLoading } = useQuery({
    queryKey: ["/api/applications"],
    enabled: !!user,
  });

  // Create application mutation
  const createAppMutation = useMutation({
    mutationFn: async (data: CreateAppForm) => {
      await apiRequest("POST", "/api/applications", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Application created successfully",
      });
    },
    onError: (error) => {
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
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete application mutation
  const deleteAppMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Success",
        description: "Application deleted successfully",
      });
    },
    onError: (error) => {
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
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateAppForm) => {
    createAppMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-500";
      case "building":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "live":
        return "Live";
      case "building":
        return "Building";
      case "failed":
        return "Failed";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="glass-morphism border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={logoPath} alt="SESKROW" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold">SESKROW</h1>
              <p className="text-gray-400 text-sm">Welcome back, {user.firstName || user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowGroqChat(true)}
              className="border-primary/50 hover:border-primary"
            >
              <Bot className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/api/logout"}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-morphism border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Apps</p>
                  <p className="text-2xl font-bold text-primary">
                    {applications.filter((app: Application) => app.status === "live").length}
                  </p>
                </div>
                <Globe className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Apps</p>
                  <p className="text-2xl font-bold text-green-400">{applications.length}</p>
                </div>
                <Rocket className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Plan</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {user.isPremium ? "Premium" : "Free"}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Storage</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {Math.round(applications.reduce((sum: number, app: Application) => sum + (app.storageUsed || 0), 0) / 1024 / 1024)}MB
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="deploy" className="space-y-6">
          <TabsList className="bg-muted border border-gray-700">
            <TabsTrigger value="deploy">Deploy with AI</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="deploy" className="space-y-6">
            <DeploymentWizard onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/applications'] })} />
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            {/* Applications Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Applications</h2>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    New Application
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-muted border-gray-700">
                  <DialogHeader>
                    <DialogTitle>Create New Application</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Application Name</FormLabel>
                            <FormControl>
                              <Input placeholder="My Awesome App" {...field} />
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
                              <div className="flex items-center">
                                <Input placeholder="my-app" {...field} />
                                <span className="ml-2 text-gray-400">.seskrow.com</span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe your application..." {...field} />
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
                            <FormLabel>Source Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select source type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="github">GitHub Repository</SelectItem>
                                <SelectItem value="zip">ZIP Upload</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("sourceType") === "github" && (
                        <FormField
                          control={form.control}
                          name="sourceUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GitHub Repository URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://github.com/username/repo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createAppMutation.isPending}
                        >
                          {createAppMutation.isPending ? "Creating..." : "Create Application"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Applications List */}
            {appsLoading ? (
              <div className="flex justify-center py-12">
                <div className="loading-spinner" />
              </div>
            ) : applications.length === 0 ? (
              <Card className="glass-morphism border-gray-700">
                <CardContent className="p-12 text-center">
                  <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                  <p className="text-gray-400 mb-6">
                    Create your first application to get started with deployment
                  </p>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Application
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {applications.map((app: Application) => (
                  <Card key={app.id} className="glass-morphism hover:bg-white/10 transition-all-300 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                            {app.sourceType === "github" ? (
                              <Github className="w-6 h-6 text-white" />
                            ) : (
                              <Upload className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{app.name}</h3>
                            <p className="text-gray-400 text-sm">
                              {app.subdomain}.seskrow.com • {app.description || "No description"}
                            </p>
                            {app.lastDeployedAt && (
                              <p className="text-gray-500 text-xs">
                                Last deployed: {new Date(app.lastDeployedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={`${getStatusColor(app.status)}/20 text-${getStatusColor(app.status).split('-')[1]}-400`}>
                            {getStatusText(app.status)}
                          </Badge>
                          {app.deploymentUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(app.deploymentUrl!, "_blank")}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedApp(app)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAppMutation.mutate(app.id)}
                            disabled={deleteAppMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="glass-morphism border-gray-700">
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedApp ? (
                  <AnalyticsChart applicationId={selectedApp.id} />
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Select an application to view analytics</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* GroqAI Chat Modal */}
      {showGroqChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-muted border border-gray-700 rounded-lg w-full max-w-2xl h-3/4 flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">GroqAI Assistant</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowGroqChat(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <GroqChat />
            </div>
          </div>
        </div>
      )}

      {/* Support Chat */}
      <SupportChat />
    </div>
  );
}
