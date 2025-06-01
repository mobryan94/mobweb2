// GroqAI integration library
export interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GroqChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class GroqAI {
  private apiKey: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('GroqAI API key not found. Please set GROQ_API_KEY environment variable.');
    }
  }

  async chat(messages: GroqMessage[], model: string = 'mixtral-8x7b-32768'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GroqAI API key is required. Please set GROQ_API_KEY environment variable.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 1024,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`GroqAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data: GroqChatResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from GroqAI');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('GroqAI chat error:', error);
      throw error;
    }
  }

  async analyzeCode(code: string, language: string = 'javascript'): Promise<string> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are an expert code analyzer and deployment optimization assistant. 
        Analyze the provided ${language} code and provide:
        1. Code quality assessment
        2. Potential issues that could affect deployment
        3. Optimization suggestions
        4. Build configuration recommendations
        5. Security considerations
        
        Be concise but thorough in your analysis.`
      },
      {
        role: 'user',
        content: `Please analyze this ${language} code for deployment optimization:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ];

    return await this.chat(messages);
  }

  async getDeploymentHelp(projectType: string, error?: string): Promise<string> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are a deployment expert assistant for SESKROW platform. 
        Help users with deployment issues, build configuration, and optimization.
        Provide practical, actionable advice specific to web deployment.
        Be helpful but concise.`
      },
      {
        role: 'user',
        content: error 
          ? `I'm deploying a ${projectType} project and getting this error: ${error}. How can I fix this?`
          : `I need help deploying a ${projectType} project. What are the best practices and common configurations?`
      }
    ];

    return await this.chat(messages);
  }

  async optimizeBuildConfig(packageJson: string): Promise<string> {
    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: `You are a build optimization expert. Analyze package.json files and suggest:
        1. Optimal build commands
        2. Output directory recommendations  
        3. Performance optimizations
        4. Dependency analysis
        5. Security recommendations
        
        Provide specific, actionable suggestions.`
      },
      {
        role: 'user',
        content: `Please analyze this package.json and suggest optimal build configuration:\n\n\`\`\`json\n${packageJson}\n\`\`\``
      }
    ];

    return await this.chat(messages);
  }
}

// Export a singleton instance
export const groqAI = new GroqAI();

// Helper function to format code for analysis
export function formatCodeForAnalysis(code: string, maxLength: number = 8000): string {
  if (code.length <= maxLength) {
    return code;
  }
  
  // Truncate but try to preserve structure
  const truncated = code.substring(0, maxLength);
  const lastNewline = truncated.lastIndexOf('\n');
  
  return lastNewline > maxLength * 0.8 
    ? truncated.substring(0, lastNewline) + '\n// ... (truncated for analysis)'
    : truncated + '\n// ... (truncated for analysis)';
}

// Helper function to detect project type from files
export function detectProjectType(files: string[]): string {
  const lowerFiles = files.map(f => f.toLowerCase());
  
  if (lowerFiles.includes('package.json')) {
    if (lowerFiles.includes('next.config.js') || lowerFiles.includes('next.config.ts')) {
      return 'Next.js';
    }
    if (lowerFiles.includes('nuxt.config.js') || lowerFiles.includes('nuxt.config.ts')) {
      return 'Nuxt.js';
    }
    if (lowerFiles.includes('vite.config.js') || lowerFiles.includes('vite.config.ts')) {
      return 'Vite';
    }
    if (lowerFiles.includes('webpack.config.js')) {
      return 'Webpack';
    }
    if (lowerFiles.some(f => f.includes('react'))) {
      return 'React';
    }
    if (lowerFiles.some(f => f.includes('vue'))) {
      return 'Vue.js';
    }
    if (lowerFiles.some(f => f.includes('angular'))) {
      return 'Angular';
    }
    return 'Node.js';
  }
  
  if (lowerFiles.includes('index.html')) {
    if (lowerFiles.some(f => f.endsWith('.js') || f.endsWith('.ts'))) {
      return 'Vanilla JavaScript';
    }
    return 'Static HTML';
  }
  
  if (lowerFiles.includes('composer.json')) {
    return 'PHP';
  }
  
  if (lowerFiles.includes('requirements.txt') || lowerFiles.includes('pyproject.toml')) {
    return 'Python';
  }
  
  return 'Web Application';
}
