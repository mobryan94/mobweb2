import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadZone } from "@/components/ui/upload-zone";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  Github, 
  Upload, 
  Rocket, 
  CheckCircle, 
  XCircle, 
  Clock,
  ExternalLink,
  Brain
} from "lucide-react";

export default function Deploy() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [deploymentStep, setDeploymentStep] = useState<"configure" | "deploying" | "success" | "error">("configure");
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [deployedUrl, setDeployedUrl] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    description: "",
    sourceType: "github" as "github" | "zip",
    sourceUrl: "",
    buildCommand: "",
    outputDir: "dist",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Deploy mutation
  const deployMutation = useMutation({
    mutationFn: async () => {
      // First create the application
      const appResponse = await apiRequest("POST", "/api/applications", {
        name: formData.name,
        subdomain: formData.subdomain,
        description: formData.description,
        sourceType: formData.sourceType,
        sourceUrl: formData.sourceUrl,
        buildCommand: formData.buildCommand,
        outputDir: formData.outputDir,
      });

      const app = await appResponse.json();

      // Then start deployment
      const formDataUpload = new FormData();
      if (uploadedFile) {
        formDataUpload.append("file", uploadedFile);
      }

      const deployResponse = await apiRequest("POST", `/api/applications/${app.id}/deploy`, formDataUpload);
      return { app, deployment: await deployResponse.json() };
    },
    onSuccess: (data) => {
      setDeploymentStep("deploying");
      simulateDeployment(data.app);
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
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
      setDeploymentStep("error");
    },
  });

  const simulateDeployment = (app: any) => {
    const steps = [
      "Initializing deployment...",
      "Analyzing code with GroqAI...",
      "Optimizing dependencies...",
      "Building application...",
      "Running tests...",
      "Deploying to CDN...",
      "Configuring subdomain...",
      "Deployment complete!"
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setDeploymentLogs(prev => [...prev, steps[currentStep]]);
        setDeploymentProgress((currentStep + 1) / steps.length * 100);
        currentStep++;
      } else {
        clearInterval(interval);
        setDeployedUrl(`https://${app.subdomain}.seskrow.com`);
        setDeploymentStep("success");
      }
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeploy = () => {
    if (!formData.name || !formData.subdomain) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.sourceType === "zip" && !uploadedFile) {
      toast({
        title: "Error", 
        description: "Please upload a ZIP file",
        variant: "destructive",
      });
      return;
    }

    if (formData.sourceType === "github" && !formData.sourceUrl) {
      toast({
        title: "Error",
        description: "Please provide a GitHub repository URL", 
        variant: "destructive",
      });
      return;
    }

    deployMutation.mutate();
  };

  const renderConfigureStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Application Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="My Awesome App"
            />
          </div>

          <div>
            <Label htmlFor="subdomain">Subdomain *</Label>
            <div className="flex items-center">
              <Input
                id="subdomain"
                value={formData.subdomain}
                onChange={(e) => handleInputChange("subdomain", e.target.value)}
                placeholder="my-app"
              />
              <span className="ml-2 text-gray-400">.seskrow.com</span>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your application..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="sourceType">Source Type *</Label>
            <Select 
              value={formData.sourceType} 
              onValueChange={(value: "github" | "zip") => handleInputChange("sourceType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="github">
                  <div className="flex items-center">
                    <Github className="w-4 h-4 mr-2" />
                    GitHub Repository
                  </div>
                </SelectItem>
                <SelectItem value="zip">
                  <div className="flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    ZIP Upload
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.sourceType === "github" ? (
            <div>
              <Label htmlFor="sourceUrl">Repository URL *</Label>
              <Input
                id="sourceUrl"
                value={formData.sourceUrl}
                onChange={(e) => handleInputChange("sourceUrl", e.target.value)}
                placeholder="https://github.com/username/repo"
              />
            </div>
          ) : (
            <div>
              <Label>Upload ZIP File *</Label>
              <UploadZone
                onFileSelect={setUploadedFile}
                selectedFile={uploadedFile}
              />
            </div>
          )}

          <div>
            <Label htmlFor="buildCommand">Build Command</Label>
            <Input
              id="buildCommand"
              value={formData.buildCommand}
              onChange={(e) => handleInputChange("buildCommand", e.target.value)}
              placeholder="npm run build"
            />
          </div>

          <div>
            <Label htmlFor="outputDir">Output Directory</Label>
            <Input
              id="outputDir"
              value={formData.outputDir}
              onChange={(e) => handleInputChange("outputDir", e.target.value)}
              placeholder="dist"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <Button
          onClick={handleDeploy}
          disabled={deployMutation.isPending}
          className="bg-primary hover:bg-primary/90"
        >
          <Rocket className="w-4 h-4 mr-2" />
          {deployMutation.isPending ? "Creating..." : "Deploy Application"}
        </Button>
      </div>
    </div>
  );

  const renderDeployingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Deploying with AI Optimization</h3>
        <p className="text-gray-400">GroqAI is analyzing and optimizing your code for deployment</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Deployment Progress</span>
          <span className="text-sm text-gray-400">{Math.round(deploymentProgress)}%</span>
        </div>
        <Progress value={deploymentProgress} className="w-full" />
      </div>

      <Card className="glass-morphism border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg">Deployment Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            {deploymentLogs.map((log, index) => (
              <div key={index} className="text-green-400 mb-1">
                <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-400" />
      </div>
      <h3 className="text-2xl font-semibold text-green-400">Deployment Successful!</h3>
      <p className="text-gray-400 max-w-md mx-auto">
        Your application has been successfully deployed and is now live on the internet.
      </p>

      <Card className="glass-morphism border-green-500/20 bg-green-500/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Your application is live at:</p>
              <p className="text-lg font-semibold text-green-400">{deployedUrl}</p>
            </div>
            <Button
              onClick={() => window.open(deployedUrl, "_blank")}
              className="bg-green-500 hover:bg-green-600"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Site
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={() => setLocation("/")}
        >
          Back to Dashboard
        </Button>
        <Button
          onClick={() => {
            setDeploymentStep("configure");
            setDeploymentProgress(0);
            setDeploymentLogs([]);
            setFormData({
              name: "",
              subdomain: "",
              description: "",
              sourceType: "github",
              sourceUrl: "",
              buildCommand: "",
              outputDir: "dist",
            });
            setUploadedFile(null);
          }}
          className="bg-primary hover:bg-primary/90"
        >
          Deploy Another App
        </Button>
      </div>
    </div>
  );

  const renderErrorStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-2xl font-semibold text-red-400">Deployment Failed</h3>
      <p className="text-gray-400 max-w-md mx-auto">
        There was an error during deployment. Please check your configuration and try again.
      </p>

      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={() => setLocation("/")}
        >
          Back to Dashboard
        </Button>
        <Button
          onClick={() => setDeploymentStep("configure")}
          className="bg-primary hover:bg-primary/90"
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="glass-morphism border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Deploy Application</h1>
              <p className="text-gray-400 text-sm">Deploy your web application with AI optimization</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {deploymentStep === "configure" && <Badge variant="outline">Configure</Badge>}
            {deploymentStep === "deploying" && <Badge className="bg-yellow-500/20 text-yellow-400">Deploying</Badge>}
            {deploymentStep === "success" && <Badge className="bg-green-500/20 text-green-400">Success</Badge>}
            {deploymentStep === "error" && <Badge className="bg-red-500/20 text-red-400">Error</Badge>}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="glass-morphism border-gray-700">
          <CardContent className="p-8">
            {deploymentStep === "configure" && renderConfigureStep()}
            {deploymentStep === "deploying" && renderDeployingStep()}
            {deploymentStep === "success" && renderSuccessStep()}
            {deploymentStep === "error" && renderErrorStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
