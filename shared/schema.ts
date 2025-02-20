import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const professionalCategories = [
  "Marketing Professionals",
  "Sales & Development",
  "Data Analysts & Data Scientists",
  "Customer Support & Service",
  "HR & Talent Management",
  "Financial Analysts",
  "Educators",
  "Healthcare Professionals",
  "Legal & Compliance",
  "Entrepreneurs & Startups",
  "E-commerce & Retail",
  "Supply Chain Experts",
  "Consultants & Business Advisors",
  "Creative & Multimedia"
] as const;

export const functionalCategories = [
  "Text Generation",
  "Image Generation",
  "Code Generation",
  "Audio Generation",
  "Video Generation",
  "Data Analysis",
  "Chatbots",
  "Process Automation",
  "Research & Analysis",
  "Document Processing",
  "Content Creation",
  "Decision Support"
] as const;

// Add new categories for AI capabilities
export const aiCapabilities = [
  "text-generation",
  "image-generation",
  "code-generation",
  "translation",
  "summarization",
  "classification",
] as const;

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  professionalCategory: text("professional_category").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  isDeveloper: boolean("is_developer").default(false).notNull()
});

// Update the tools table schema
export const tools = pgTable("tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  professionalCategory: text("professional_category").notNull(),
  functionalCategory: text("functional_category").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  previewUrl: text("preview_url").notNull(),
  pricing: text("pricing").notNull(),
  featured: boolean("featured").default(false).notNull(),
  editorChoice: boolean("editor_choice").default(false).notNull(),
  metadata: jsonb("metadata").notNull(),
  aiCapability: text("ai_capability").notNull(),
  apiEndpoint: text("api_endpoint").notNull(),
  modelName: text("model_name").notNull(),
  maxInputLength: integer("max_input_length").default(1000).notNull(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  professionalCategory: z.enum(professionalCategories),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  isDeveloper: z.boolean().default(false)
}).omit({
  id: true,
  createdAt: true
});

// Update the insert schema
export const insertToolSchema = createInsertSchema(tools, {
  aiCapability: z.enum(aiCapabilities),
  apiEndpoint: z.string().min(1),
  modelName: z.string().min(1),
  maxInputLength: z.number().min(1).max(4000),
}).omit({
  id: true
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTool = z.infer<typeof insertToolSchema>;
export type Tool = typeof tools.$inferSelect;

export const searchParamsSchema = z.object({
  query: z.string().optional(),
  professionalCategory: z.enum(professionalCategories).optional(),
  functionalCategory: z.enum(functionalCategories).optional(),
  pricing: z.enum(["free", "paid", "all"]).optional()
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

// Add a schema for AI tool requests
export const aiToolRequestSchema = z.object({
  prompt: z.string().min(1).max(4000),
  modelName: z.string().optional(),
});

export type AIToolRequest = z.infer<typeof aiToolRequestSchema>;


// Add new tables for tool history and favorites
export const toolViews = pgTable("tool_views", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  toolId: integer("tool_id").notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

export const toolFavorites = pgTable("tool_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  toolId: integer("tool_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const toolDownloads = pgTable("tool_downloads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  toolId: integer("tool_id").notNull(),
  downloadedAt: timestamp("downloaded_at").defaultNow().notNull(),
});

// Export types for the new tables
export type ToolView = typeof toolViews.$inferSelect;
export type ToolFavorite = typeof toolFavorites.$inferSelect;
export type ToolDownload = typeof toolDownloads.$inferSelect;

// Update IStorage interface with new methods
export interface IStorage {
  // ... existing methods ...

  // Tool interaction methods
  getToolViews(userId: number): Promise<(ToolView & { tool: Tool })[]>;
  addToolView(userId: number, toolId: number): Promise<void>;

  getToolFavorites(userId: number): Promise<(ToolFavorite & { tool: Tool })[]>;
  addToolFavorite(userId: number, toolId: number): Promise<void>;
  removeToolFavorite(userId: number, toolId: number): Promise<void>;

  getToolDownloads(userId: number): Promise<(ToolDownload & { tool: Tool })[]>;
  addToolDownload(userId: number, toolId: number): Promise<void>;

  // Developer metrics methods
  getToolViewsByToolId(toolId: number): Promise<ToolView[]>;
  getToolFavoritesByToolId(toolId: number): Promise<ToolFavorite[]>;
  getToolDownloadsByToolId(toolId: number): Promise<ToolDownload[]>;
}