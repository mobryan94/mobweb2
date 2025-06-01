import {
  users,
  applications,
  deployments,
  analytics,
  groqConversations,
  type User,
  type UpsertUser,
  type Application,
  type InsertApplication,
  type Deployment,
  type InsertDeployment,
  type Analytics,
  type InsertAnalytics,
  type GroqConversation,
  type InsertGroqConversation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Application operations
  getUserApplications(userId: string): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(app: InsertApplication): Promise<Application>;
  updateApplication(id: number, updates: Partial<Application>): Promise<Application>;
  deleteApplication(id: number): Promise<void>;
  checkSubdomainAvailable(subdomain: string): Promise<boolean>;
  
  // Deployment operations
  getApplicationDeployments(applicationId: number): Promise<Deployment[]>;
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  updateDeployment(id: number, updates: Partial<Deployment>): Promise<Deployment>;
  
  // Analytics operations
  recordAnalytics(analytics: InsertAnalytics): Promise<void>;
  getApplicationAnalytics(applicationId: number, days?: number): Promise<Analytics[]>;
  
  // Groq conversation operations
  getUserConversations(userId: string, limit?: number): Promise<GroqConversation[]>;
  createConversation(conversation: InsertGroqConversation): Promise<GroqConversation>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Application operations
  async getUserApplications(userId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.createdAt));
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [app] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id));
    return app;
  }

  async createApplication(app: InsertApplication): Promise<Application> {
    const [newApp] = await db
      .insert(applications)
      .values(app)
      .returning();
    return newApp;
  }

  async updateApplication(id: number, updates: Partial<Application>): Promise<Application> {
    const [updatedApp] = await db
      .update(applications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return updatedApp;
  }

  async deleteApplication(id: number): Promise<void> {
    await db.delete(applications).where(eq(applications.id, id));
  }

  async checkSubdomainAvailable(subdomain: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(applications)
      .where(eq(applications.subdomain, subdomain));
    return !existing;
  }

  // Deployment operations
  async getApplicationDeployments(applicationId: number): Promise<Deployment[]> {
    return await db
      .select()
      .from(deployments)
      .where(eq(deployments.applicationId, applicationId))
      .orderBy(desc(deployments.createdAt));
  }

  async createDeployment(deployment: InsertDeployment): Promise<Deployment> {
    const [newDeployment] = await db
      .insert(deployments)
      .values(deployment)
      .returning();
    return newDeployment;
  }

  async updateDeployment(id: number, updates: Partial<Deployment>): Promise<Deployment> {
    const [updatedDeployment] = await db
      .update(deployments)
      .set(updates)
      .where(eq(deployments.id, id))
      .returning();
    return updatedDeployment;
  }

  // Analytics operations
  async recordAnalytics(analyticsData: InsertAnalytics): Promise<void> {
    await db.insert(analytics).values(analyticsData);
  }

  async getApplicationAnalytics(applicationId: number, days = 30): Promise<Analytics[]> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    return await db
      .select()
      .from(analytics)
      .where(
        and(
          eq(analytics.applicationId, applicationId),
          // Add date filter if needed
        )
      )
      .orderBy(desc(analytics.visitedAt));
  }

  // Groq conversation operations
  async getUserConversations(userId: string, limit = 50): Promise<GroqConversation[]> {
    return await db
      .select()
      .from(groqConversations)
      .where(eq(groqConversations.userId, userId))
      .orderBy(desc(groqConversations.createdAt))
      .limit(limit);
  }

  async createConversation(conversation: InsertGroqConversation): Promise<GroqConversation> {
    const [newConversation] = await db
      .insert(groqConversations)
      .values(conversation)
      .returning();
    return newConversation;
  }
}

export const storage = new DatabaseStorage();
