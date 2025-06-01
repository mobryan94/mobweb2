import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  subdomain: varchar("subdomain").notNull().unique(),
  description: text("description"),
  sourceType: varchar("source_type").notNull(), // "github" | "zip"
  sourceUrl: text("source_url"), // GitHub repo URL
  buildCommand: text("build_command"),
  outputDir: varchar("output_dir").default("dist"),
  status: varchar("status").notNull().default("pending"), // "pending" | "building" | "live" | "failed"
  deploymentUrl: text("deployment_url"),
  storageUsed: integer("storage_used").default(0), // in bytes
  lastDeployedAt: timestamp("last_deployed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Deployments table
export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applications.id),
  status: varchar("status").notNull().default("pending"), // "pending" | "building" | "success" | "failed"
  buildLogs: text("build_logs"),
  groqAnalysis: jsonb("groq_analysis"), // AI analysis results
  deployedAt: timestamp("deployed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics table
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applications.id),
  visitorIp: varchar("visitor_ip"),
  userAgent: text("user_agent"),
  country: varchar("country"),
  city: varchar("city"),
  referer: text("referer"),
  path: varchar("path"),
  visitedAt: timestamp("visited_at").defaultNow(),
});

// Groq chat conversations
export const groqConversations = pgTable("groq_conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertDeploymentSchema = createInsertSchema(deployments).omit({
  id: true,
  createdAt: true,
});
export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  visitedAt: true,
});
export const insertGroqConversationSchema = createInsertSchema(groqConversations).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Deployment = typeof deployments.$inferSelect;
export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type GroqConversation = typeof groqConversations.$inferSelect;
export type InsertGroqConversation = z.infer<typeof insertGroqConversationSchema>;
