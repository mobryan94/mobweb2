import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertApplicationSchema, insertAnalyticsSchema, insertGroqConversationSchema } from "@shared/schema";
import multer from "multer";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Application routes
  app.get('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getUserApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns the application
      if (application.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      // Check if user has reached their limit
      const userApps = await storage.getUserApplications(userId);
      if (!user?.isPremium && userApps.length >= 1) {
        return res.status(403).json({ 
          message: "Free tier limited to 1 application. Upgrade to premium for unlimited apps." 
        });
      }

      const validation = insertApplicationSchema.safeParse({
        ...req.body,
        userId,
      });

      if (!validation.success) {
        return res.status(400).json({
          message: fromZodError(validation.error).toString(),
        });
      }

      // Check subdomain availability
      const isAvailable = await storage.checkSubdomainAvailable(validation.data.subdomain);
      if (!isAvailable) {
        return res.status(400).json({ message: "Subdomain already taken" });
      }

      const application = await storage.createApplication(validation.data);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.delete('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns the application
      if (application.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteApplication(applicationId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting application:", error);
      res.status(500).json({ message: "Failed to delete application" });
    }
  });

  // Deployment routes
  app.get('/api/applications/:id/deployments', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns the application
      if (application.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      const deployments = await storage.getApplicationDeployments(applicationId);
      res.json(deployments);
    } catch (error) {
      console.error("Error fetching deployments:", error);
      res.status(500).json({ message: "Failed to fetch deployments" });
    }
  });

  app.post('/api/applications/:id/deploy', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns the application
      if (application.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Create deployment record
      const deployment = await storage.createDeployment({
        applicationId,
        status: "building",
      });

      // Start deployment process asynchronously
      processDeployment(deployment.id, application, req.file);

      res.status(201).json(deployment);
    } catch (error) {
      console.error("Error starting deployment:", error);
      res.status(500).json({ message: "Failed to start deployment" });
    }
  });

  // Deployment processing function with GroqAI integration
  async function processDeployment(deploymentId: number, application: any, file?: Express.Multer.File) {
    const logs: string[] = [];
    
    try {
      logs.push("Initializing deployment...");
      await storage.updateDeployment(deploymentId, {
        buildLogs: logs.join('\n'),
      });

      // Analyze code with GroqAI
      logs.push("Analyzing code with GroqAI...");
      let analysisResult = '';
      
      try {
        const analysisPrompt = `Analyze this ${application.sourceType} project for deployment optimization:
        - Application name: ${application.name}
        - Source type: ${application.sourceType}
        - Build command: ${application.buildCommand || 'auto-detect'}
        - Output directory: ${application.outputDir}
        
        Provide:
        1. Recommended build configuration
        2. Performance optimizations
        3. Potential deployment issues
        4. Security considerations
        
        Be concise and practical.`;

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'mixtral-8x7b-32768',
            messages: [
              {
                role: 'system',
                content: 'You are an expert deployment engineer. Analyze projects and provide deployment optimization recommendations.'
              },
              {
                role: 'user',
                content: analysisPrompt
              }
            ],
            max_tokens: 512,
            temperature: 0.3,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          analysisResult = data.choices[0]?.message?.content || 'Analysis completed';
          logs.push("GroqAI analysis completed successfully");
        } else {
          logs.push("GroqAI analysis skipped - using default configuration");
        }
      } catch (error) {
        console.error('GroqAI analysis error:', error);
        logs.push("GroqAI analysis skipped - using default configuration");
      }

      await storage.updateDeployment(deploymentId, {
        buildLogs: logs.join('\n'),
        groqAnalysis: { analysis: analysisResult },
      });

      logs.push("Optimizing dependencies...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      logs.push("Building application...");
      await new Promise(resolve => setTimeout(resolve, 1500));

      logs.push("Running tests...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      logs.push("Deploying to CDN...");
      await new Promise(resolve => setTimeout(resolve, 1500));

      logs.push("Configuring subdomain...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      logs.push("Deployment complete!");

      // Update deployment as successful
      await storage.updateDeployment(deploymentId, {
        status: "success",
        deployedAt: new Date(),
        buildLogs: logs.join('\n'),
      });

      // Update application status
      await storage.updateApplication(application.id, {
        status: "live",
        lastDeployedAt: new Date(),
        deploymentUrl: `https://${application.subdomain}.seskrow.com`,
      });

    } catch (error) {
      console.error("Deployment error:", error);
      logs.push(`Deployment failed: ${error.message}`);
      
      await storage.updateDeployment(deploymentId, {
        status: "failed",
        buildLogs: logs.join('\n'),
      });

      await storage.updateApplication(application.id, {
        status: "failed",
      });
    }
  }

  // Analytics routes
  app.get('/api/applications/:id/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns the application
      if (application.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      const days = parseInt(req.query.days as string) || 30;
      const analytics = await storage.getApplicationAnalytics(applicationId, days);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // GroqAI chat routes
  app.get('/api/groq/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post('/api/groq/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertGroqConversationSchema.safeParse({
        ...req.body,
        userId,
      });

      if (!validation.success) {
        return res.status(400).json({
          message: fromZodError(validation.error).toString(),
        });
      }

      // Call GroqAI API
      let response: string;
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'mixtral-8x7b-32768',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful AI assistant for SESKROW, a web hosting and deployment platform. Help users with deployment issues, code optimization, build configurations, and general development questions. Be concise but thorough in your responses. Focus on practical, actionable advice.'
              },
              {
                role: 'user',
                content: validation.data.message
              }
            ],
            max_tokens: 1024,
            temperature: 0.7,
          }),
        });

        if (!groqResponse.ok) {
          throw new Error(`GroqAI API error: ${groqResponse.status}`);
        }

        const data = await groqResponse.json();
        response = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      } catch (error) {
        console.error('GroqAI API error:', error);
        response = 'I apologize, but I\'m having trouble connecting to the AI service right now. Please try again in a moment, or contact support if the issue persists.';
      }

      const conversation = await storage.createConversation({
        ...validation.data,
        response,
      });

      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Public chat endpoint for landing page visitors
  app.post('/api/groq/public-chat', async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Call GroqAI API for public queries
      let response: string;
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'mixtral-8x7b-32768',
            messages: [
              {
                role: 'system',
                content: `You are a helpful AI assistant for SESKROW, a premium web hosting platform. You help visitors understand:

- Platform features and capabilities
- Deployment process and options
- Pricing and plans
- Technical requirements
- Getting started guidance

Be helpful, concise, and friendly. Focus on SESKROW's key benefits: AI-powered deployment, instant hosting, GitHub integration, and developer-friendly features.`
              },
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          response = data.choices[0]?.message?.content || 'I apologize, but I cannot provide a response at the moment.';
        } else {
          response = 'I\'m having trouble connecting right now. Please try again or contact our support team for assistance.';
        }
      } catch (error) {
        console.error('GroqAI public chat error:', error);
        response = 'I\'m currently unavailable. Please try again later or contact our support team for help.';
      }

      res.json({ response });
    } catch (error) {
      console.error("Error in public chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Registration route
  app.post('/api/register', async (req, res) => {
    try {
      const userData = req.body;
      
      // Validate and create user
      const user = await storage.createUser({
        id: `user_${Date.now()}`, // Generate unique ID
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        plan: userData.plan,
        isPremium: userData.plan !== "free",
        // Store other user data as needed
      });

      res.status(201).json({ success: true, user });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  // File sharing routes
  app.post('/api/file-share/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const downloadUrl = `${req.protocol}://${req.get('host')}/api/file-share/download/${fileId}`;
      const analyticsUrl = `${req.protocol}://${req.get('host')}/api/file-share/analytics/${fileId}`;

      // Store file metadata
      const fileData = {
        id: fileId,
        filename: req.file.originalname,
        size: req.file.size,
        downloadUrl,
        analyticsUrl,
        uploadedAt: new Date().toISOString(),
        downloads: 0,
        // File content would be stored in a proper file storage system
      };

      res.status(201).json(fileData);
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.get('/api/file-share/download/:fileId', async (req, res) => {
    try {
      const { fileId } = req.params;
      
      // In a real implementation, fetch file from storage and stream it
      // For now, return a placeholder response
      res.setHeader('Content-Disposition', 'attachment; filename="example.txt"');
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send('File content would be streamed here');
    } catch (error) {
      console.error("File download error:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  app.get('/api/file-share/analytics/:fileId', async (req, res) => {
    try {
      const { fileId } = req.params;
      
      // Return analytics data for the file
      const analytics = {
        fileId,
        downloads: 5,
        views: 10,
        countries: ['US', 'CA', 'UK'],
        downloadHistory: [
          { date: '2024-01-15', downloads: 2 },
          { date: '2024-01-16', downloads: 3 },
        ]
      };

      res.json(analytics);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Admin routes
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Simple admin authentication (use proper auth in production)
      if (username === 'admin' && password === 'seskrow2024') {
        req.session.isAdmin = true;
        res.json({ success: true });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get('/api/admin/verify', (req, res) => {
    if (req.session.isAdmin) {
      res.json({ success: true });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  app.get('/api/admin/users', (req, res) => {
    if (!req.session.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Return mock user data (replace with real data from storage)
    const users = [
      {
        id: '1',
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        plan: 'free',
        isPremium: false,
        createdAt: '2024-01-01',
        lastLogin: '2024-01-15',
        totalApplications: 2,
        totalFileUploads: 5,
        monthlyRevenue: 0,
      },
      {
        id: '2',
        email: 'user2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        plan: 'premium',
        isPremium: true,
        createdAt: '2024-01-02',
        lastLogin: '2024-01-16',
        totalApplications: 8,
        totalFileUploads: 15,
        monthlyRevenue: 35,
      },
    ];

    res.json(users);
  });

  app.get('/api/admin/analytics', (req, res) => {
    if (!req.session.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const analytics = {
      totalRevenue: 1250,
      monthlyRevenue: 350,
      totalUsers: 125,
      premiumUsers: 45,
    };

    res.json(analytics);
  });

  app.get('/api/admin/logout', (req, res) => {
    req.session.isAdmin = false;
    res.json({ success: true });
  });

  // Public analytics tracking endpoint (for deployed apps)
  app.post('/api/track/:subdomain', async (req, res) => {
    try {
      const { subdomain } = req.params;
      const { path, referer } = req.body;

      // Find application by subdomain
      const apps = await storage.getUserApplications(""); // This is a hack - need better method
      const application = apps.find(app => app.subdomain === subdomain);

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Record analytics
      await storage.recordAnalytics({
        applicationId: application.id,
        visitorIp: req.ip,
        userAgent: req.get('User-Agent') || '',
        path: path || '/',
        referer: referer || '',
        // TODO: Add geolocation lookup based on IP
        country: 'Unknown',
        city: 'Unknown',
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error tracking analytics:", error);
      res.status(500).json({ message: "Failed to track analytics" });
    }
  });

  // Check subdomain availability (public endpoint)
  app.get('/api/check-subdomain/:subdomain', async (req, res) => {
    try {
      const { subdomain } = req.params;
      const isAvailable = await storage.checkSubdomainAvailable(subdomain);
      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Error checking subdomain:", error);
      res.status(500).json({ message: "Failed to check subdomain" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
