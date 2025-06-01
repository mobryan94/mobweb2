import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingChat } from "@/components/landing-chat";
import logoPath from "@assets/triangle-logo.svg";
import { Rocket, Github, Brain, Bolt, Infinity, Upload, Bot, ChartLine, Globe, Shield, Check, Star, ExternalLink } from "lucide-react";

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all-300 ${isScrolled ? 'bg-black/95' : 'glass-morphism'}`}>
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src={logoPath} alt="SESKROW" className="w-8 h-8" />
            <h1 className="text-xl font-bold">SESKROW</h1>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('features')}
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection('dashboard')}
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              Dashboard
            </button>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-white hover:bg-gray-200 text-black hover-glow"
            >
              Get Started
            </Button>
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/10 via-black to-gray-600/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-400/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center animate-slide-up">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gradient">SESKROW</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              The Leaders in Autonomous Deployment
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Deploy your web applications instantly with AI-powered optimization. From GitHub repositories to ZIP uploads, 
              our platform handles everything automatically with GroqAI intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/register'}
                className="bg-primary hover:bg-primary/90 animate-pulse-glow px-8 py-4 text-lg font-semibold"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Deploying Free
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="border-primary/50 hover:border-primary text-gray-300 hover:text-white px-8 py-4 text-lg font-semibold"
              >
                <Github className="w-5 h-5 mr-2" />
                Connect GitHub
              </Button>
            </div>

            {/* Hero Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="glass-morphism hover:bg-white/10 transition-all-300 border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
                  <p className="text-gray-400 text-sm">GroqAI optimizes your code for perfect deployment</p>
                </CardContent>
              </Card>
              <Card className="glass-morphism hover:bg-white/10 transition-all-300 border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Bolt className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Instant Deploy</h3>
                  <p className="text-gray-400 text-sm">From upload to live in seconds</p>
                </CardContent>
              </Card>
              <Card className="glass-morphism hover:bg-white/10 transition-all-300 border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Infinity className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Free Forever</h3>
                  <p className="text-gray-400 text-sm">Start with 500MB, upgrade for unlimited</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-black to-muted">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-6">
              Modern Infrastructure for <span className="text-primary">Developers</span>
            </h3>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to deploy, manage, and scale your applications with cutting-edge AI assistance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Github,
                title: "GitHub Integration",
                description: "Connect your repositories and deploy with a single click. Automatic builds and deployments from any branch."
              },
              {
                icon: Upload,
                title: "ZIP Upload",
                description: "Drag and drop your project files or upload ZIP archives. Our AI handles the rest automatically."
              },
              {
                icon: Bot,
                title: "GroqAI Assistant",
                description: "AI-powered code analysis, optimization, and error correction. Get help anytime with intelligent assistance."
              },
              {
                icon: ChartLine,
                title: "Advanced Analytics",
                description: "Track visitors, geolocation data, user agents, and performance metrics with detailed insights."
              },
              {
                icon: Globe,
                title: "Custom Subdomains",
                description: "Get your unique subdomain (yourapp.seskrow.com) or use your own DNS servers for complete control."
              },
              {
                icon: Shield,
                title: "Secure & Reliable",
                description: "Enterprise-grade security with 99.9% uptime guarantee. Your applications are always accessible."
              }
            ].map((feature, index) => (
              <Card key={index} className="glass-morphism hover:bg-white/10 transition-all-300 border-white/10 group hover-lift">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-4">{feature.title}</h4>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment Process */}
      <section className="py-20 bg-gradient-to-b from-muted to-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-6">
              Deploy in <span className="text-primary">3 Simple Steps</span>
            </h3>
            <p className="text-xl text-gray-400">
              From code to production in minutes, not hours
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Upload or Connect",
                description: "Connect your GitHub repository or upload your project files via drag & drop or ZIP upload"
              },
              {
                step: "2", 
                title: "AI Optimization",
                description: "GroqAI analyzes your code, fixes issues, and optimizes for deployment automatically"
              },
              {
                step: "3",
                title: "Go Live",
                description: "Your application is deployed to a secure subdomain and ready for the world to see"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                    <span className="text-3xl font-bold text-white">{step.step}</span>
                  </div>
                  {index < 2 && (
                    <div className="absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent hidden md:block" />
                  )}
                </div>
                <h4 className="text-2xl font-semibold mb-4">{step.title}</h4>
                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Registration Required Notice */}
          <div className="mt-16 max-w-2xl mx-auto">
            <Card className="gradient-border">
              <div className="gradient-border-inner rounded-2xl p-8">
                <div className="text-center">
                  <Bot className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h4 className="text-xl font-semibold mb-2">Ready to Deploy with AI?</h4>
                  <p className="text-gray-400 mb-6">Register to access our AI-powered deployment wizard with:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
                    <div className="flex items-center">
                      <Upload className="w-5 h-5 text-primary mr-3" />
                      <span>Drag & drop file uploads</span>
                    </div>
                    <div className="flex items-center">
                      <Github className="w-5 h-5 text-primary mr-3" />
                      <span>GitHub repository integration</span>
                    </div>
                    <div className="flex items-center">
                      <Bot className="w-5 h-5 text-primary mr-3" />
                      <span>Real-time AI assistance</span>
                    </div>
                    <div className="flex items-center">
                      <Rocket className="w-5 h-5 text-primary mr-3" />
                      <span>Instant deployment feedback</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => window.location.href = '/api/login'}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Rocket className="w-4 h-4 mr-2" />
                      Start Deploying Now
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = '/api/login'}
                      className="border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      Connect GitHub Account
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-black to-muted">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, <span className="text-primary">Transparent</span> Pricing
            </h3>
            <p className="text-xl text-gray-400">
              Start free, upgrade when you're ready to scale
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="glass-morphism border-gray-700">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h4 className="text-2xl font-bold mb-2">Free Forever</h4>
                  <div className="text-5xl font-bold mb-4">
                    <span className="text-primary">$0</span>
                  </div>
                  <p className="text-gray-400">Perfect for getting started</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    "1 web application",
                    "500MB storage",
                    "Custom subdomain",
                    "GroqAI assistance",
                    "Basic analytics",
                    "GitHub integration"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-primary mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Lifetime Plan */}
            <div className="relative">
              <Badge className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-destructive text-white">
                LIFETIME DEAL
              </Badge>
              <Card className="glass-morphism border-2 border-primary animate-pulse-glow">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h4 className="text-2xl font-bold mb-2">Lifetime Premium</h4>
                    <div className="text-5xl font-bold mb-4">
                      <span className="text-primary">$50</span>
                      <span className="text-lg text-gray-400 line-through ml-2">$99</span>
                    </div>
                    <p className="text-gray-400">One-time payment, lifetime access</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {[
                      { text: "Unlimited web applications", highlight: "Unlimited" },
                      { text: "Unlimited storage per app", highlight: "Unlimited" },
                      { text: "Custom subdomains" },
                      { text: "Priority GroqAI assistance" },
                      { text: "Advanced analytics" },
                      { text: "Custom DNS servers" },
                      { text: "99.9% uptime SLA" },
                      { text: "Priority support" }
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-primary mr-3" />
                        <span>
                          {feature.highlight ? (
                            <>
                              <strong>{feature.highlight}</strong> {feature.text.replace(feature.highlight, '')}
                            </>
                          ) : (
                            feature.text
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 font-semibold"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    Upgrade to Lifetime
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="dashboard" className="py-20 bg-gradient-to-b from-muted to-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful <span className="text-primary">Developer Dashboard</span>
            </h3>
            <p className="text-xl text-gray-400">
              Manage all your applications from one central hub
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className="max-w-6xl mx-auto">
            <Card className="glass-morphism border-gray-700">
              <CardContent className="p-6">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <ChartLine className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold">Dashboard</h4>
                      <p className="text-gray-400 text-sm">Welcome back, Developer</p>
                    </div>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New App
                  </Button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { value: "3", label: "Active Apps", color: "text-primary" },
                    { value: "99.9%", label: "Uptime", color: "text-green-400" },
                    { value: "1.2GB", label: "Storage Used", color: "text-yellow-400" },
                    { value: "15.3K", label: "Total Visits", color: "text-purple-400" }
                  ].map((stat, index) => (
                    <Card key={index} className="bg-muted border-gray-700">
                      <CardContent className="p-4">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-gray-400 text-sm">{stat.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Apps List */}
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold mb-4">Your Applications</h5>

                  {[
                    {
                      name: "my-portfolio.seskrow.com",
                      description: "Portfolio Website • React",
                      status: "Live",
                      statusColor: "bg-green-500",
                      iconColor: "bg-green-500"
                    },
                    {
                      name: "ecommerce-app.seskrow.com", 
                      description: "E-commerce Store • Next.js",
                      status: "Deploying",
                      statusColor: "bg-yellow-500",
                      iconColor: "bg-blue-500"
                    },
                    {
                      name: "tech-blog.seskrow.com",
                      description: "Tech Blog • Vue.js", 
                      status: "Live",
                      statusColor: "bg-green-500",
                      iconColor: "bg-purple-500"
                    }
                  ].map((app, index) => (
                    <Card key={index} className="bg-muted hover:bg-gray-800 transition-colors duration-300 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 ${app.iconColor} rounded-lg flex items-center justify-center`}>
                              <Globe className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h6 className="font-semibold">{app.name}</h6>
                              <p className="text-gray-400 text-sm">{app.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge className={`${app.statusColor}/20 text-${app.statusColor.split('-')[1]}-400`}>
                              {app.status}
                            </Badge>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* GroqAI Assistant */}
                <Card className="mt-8 pt-6 border-t border-gray-700 bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h6 className="font-semibold">GroqAI Assistant</h6>
                        <p className="text-gray-400 text-sm">Ask me anything about your deployments</p>
                      </div>
                      <Button className="bg-primary hover:bg-primary/90">
                        Chat Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold">SESKROW</h1>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The future of web deployment. Deploy faster, scale better, with AI-powered optimization.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: "twitter", href: "#" },
                  { icon: "github", href: "#" },
                  { icon: "discord", href: "#" }
                ].map((social, index) => (
                  <a 
                    key={index}
                    href={social.href} 
                    className="text-gray-400 hover:text-primary transition-colors duration-300"
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      <Star className="w-5 h-5" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h6 className="font-semibold mb-4">Product</h6>
              <ul className="space-y-2 text-gray-400">
                {["Features", "Pricing", "Documentation", "API Reference"].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="hover:text-white transition-colors duration-300">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h6 className="font-semibold mb-4">Support</h6>
              <ul className="space-y-2 text-gray-400">
                {["Help Center", "Community", "Status", "Contact"].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="hover:text-white transition-colors duration-300">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SESKROW. All rights reserved. Built for developers, by developers.</p>
          </div>
        </div>
      </footer>

      {/* AI Chat Assistant */}
      <LandingChat />
    </div>
  );
}
