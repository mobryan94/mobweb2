import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Server, 
  Globe, 
  Zap, 
  Database, 
  Code, 
  Bot,
  MessageSquare
} from "lucide-react";

interface Platform {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  environments: string[];
  features: string[];
  recommended?: boolean;
}

interface DeploymentPlatformSelectorProps {
  onPlatformSelect: (platform: string, environment: string) => void;
}

export function DeploymentPlatformSelector({ onPlatformSelect }: DeploymentPlatformSelectorProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("");

  const platforms: Platform[] = [
    {
      id: "replit",
      name: "Replit",
      description: "Full-stack applications with built-in database and real-time collaboration",
      icon: <Server className="w-6 h-6" />,
      environments: ["Node.js", "Python", "Go", "Java", "C++", "React", "Next.js", "Express"],
      features: [
        "Instant hosting",
        "Built-in PostgreSQL",
        "Real-time collaboration",
        "Auto-scaling",
        "Custom domains"
      ],
      recommended: true,
    },
    {
      id: "static",
      name: "Static Hosting",
      description: "Frontend applications and static sites",
      icon: <Globe className="w-6 h-6" />,
      environments: ["React", "Vue.js", "Angular", "Svelte", "Static HTML", "Gatsby", "Nuxt.js"],
      features: [
        "Lightning fast CDN",
        "Global edge distribution",
        "Automatic HTTPS",
        "Branch previews",
        "Form handling"
      ],
    },
    {
      id: "serverless",
      name: "Serverless Functions",
      description: "API endpoints and microservices",
      icon: <Zap className="w-6 h-6" />,
      environments: ["Node.js", "Python", "Go", "Edge Runtime", "Deno"],
      features: [
        "Pay per request",
        "Auto-scaling",
        "Zero cold starts",
        "Global deployment",
        "Environment variables"
      ],
    },
    {
      id: "database",
      name: "Database Hosting",
      description: "Managed databases with backups and scaling",
      icon: <Database className="w-6 h-6" />,
      environments: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Supabase", "PlanetScale"],
      features: [
        "Automatic backups",
        "Connection pooling",
        "Read replicas",
        "Point-in-time recovery",
        "Monitoring & alerts"
      ],
    },
    {
      id: "telegram-bot",
      name: "Telegram Bot Hosting",
      description: "Deploy and manage Telegram bots with webhook support",
      icon: <MessageSquare className="w-6 h-6" />,
      environments: ["Node.js Bot", "Python Bot", "Go Bot", "Webhook Handler"],
      features: [
        "Webhook management",
        "24/7 uptime",
        "Message queue",
        "Bot analytics",
        "Multi-language support"
      ],
    },
    {
      id: "ai-ml",
      name: "AI/ML Models",
      description: "Deploy machine learning models and AI applications",
      icon: <Bot className="w-6 h-6" />,
      environments: ["TensorFlow", "PyTorch", "Hugging Face", "OpenAI API", "Custom Models"],
      features: [
        "GPU acceleration",
        "Model versioning",
        "A/B testing",
        "Auto-scaling",
        "Inference analytics"
      ],
    },
  ];

  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);

  const handleDeploy = () => {
    if (selectedPlatform && selectedEnvironment) {
      onPlatformSelect(selectedPlatform, selectedEnvironment);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Deployment Platform</h3>
        <p className="text-gray-400 text-sm">
          Select the best platform for your application type and requirements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => (
          <Card
            key={platform.id}
            className={`glass-morphism cursor-pointer transition-all ${
              selectedPlatform === platform.id
                ? "border-primary bg-primary/5"
                : "border-gray-700 hover:border-gray-600"
            }`}
            onClick={() => {
              setSelectedPlatform(platform.id);
              setSelectedEnvironment("");
            }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center space-x-2">
                  {platform.icon}
                  <span>{platform.name}</span>
                </div>
                {platform.recommended && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500">
                    Recommended
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-400 mb-3">{platform.description}</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-300 mb-1">Supported Environments:</p>
                  <div className="flex flex-wrap gap-1">
                    {platform.environments.slice(0, 3).map((env) => (
                      <Badge key={env} variant="outline" className="text-xs">
                        {env}
                      </Badge>
                    ))}
                    {platform.environments.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{platform.environments.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-300 mb-1">Key Features:</p>
                  <ul className="text-xs text-gray-400 space-y-0.5">
                    {platform.features.slice(0, 3).map((feature) => (
                      <li key={feature}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPlatformData && (
        <Card className="glass-morphism border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {selectedPlatformData.icon}
              <span>Configure {selectedPlatformData.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="environment">Choose Environment</Label>
              <Select
                value={selectedEnvironment}
                onValueChange={setSelectedEnvironment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an environment" />
                </SelectTrigger>
                <SelectContent>
                  {selectedPlatformData.environments.map((env) => (
                    <SelectItem key={env} value={env}>
                      {env}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-300 mb-2">Platform Features:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedPlatformData.features.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2 text-sm text-gray-400">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleDeploy}
              disabled={!selectedEnvironment}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Deploy to {selectedPlatformData.name}
              <Code className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
