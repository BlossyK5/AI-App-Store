import { tools, users, type Tool, type InsertTool, type SearchParams, type User, type InsertUser, type ToolView, type ToolFavorite, type ToolDownload } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getAllTools(): Promise<Tool[]>;
  getToolById(id: number): Promise<Tool | undefined>;
  searchTools(params: SearchParams): Promise<Tool[]>;
  getFeaturedTools(): Promise<Tool[]>;
  getEditorChoiceTools(): Promise<Tool[]>;
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  // Tool interaction methods
  getToolViews(userId: number): Promise<(ToolView & { tool: Tool })[]>;
  addToolView(userId: number, toolId: number): Promise<void>;
  getToolFavorites(userId: number): Promise<(ToolFavorite & { tool: Tool })[]>;
  addToolFavorite(userId: number, toolId: number): Promise<void>;
  removeToolFavorite(userId: number, toolId: number): Promise<void>;
  getToolDownloads(userId: number): Promise<(ToolDownload & { tool: Tool })[]>;
  addToolDownload(userId: number, toolId: number): Promise<void>;
  //Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private tools: Map<number, Tool>;
  private users: Map<number, User>;
  private nextUserId: number;
  private toolViews: Map<number, ToolView[]>;
  private toolFavorites: Map<number, ToolFavorite[]>;
  private toolDownloads: Map<number, ToolDownload[]>;
  readonly sessionStore: session.Store;

  constructor() {
    this.tools = new Map();
    this.users = new Map();
    this.toolViews = new Map();
    this.toolFavorites = new Map();
    this.toolDownloads = new Map();
    this.nextUserId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockTools: InsertTool[] = [
      {
        name: "ContentCraft AI",
        description: "Advanced AI content generation and optimization tool",
        professionalCategory: "Marketing Professionals",
        functionalCategory: "Content Creation",
        thumbnailUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
        previewUrl: "https://images.unsplash.com/photo-1453806839674-d1a9087ca1ed",
        pricing: "paid",
        featured: true,
        editorChoice: true,
        metadata: {
          features: [
            "SEO-optimized content generation",
            "Social media post creation",
            "Marketing copy optimization"
          ]
        },
        aiCapability: "text-generation",
        apiEndpoint: "/api/tools/1/execute",
        modelName: "gpt-3.5-turbo",
        maxInputLength: 2000
      },
      {
        name: "ImageGen AI",
        description: "Create stunning visuals with AI-powered image generation",
        professionalCategory: "Creative & Multimedia",
        functionalCategory: "Image Generation",
        thumbnailUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
        previewUrl: "https://images.unsplash.com/photo-1503789146722-cf137a3c0fea",
        pricing: "paid",
        featured: true,
        metadata: {
          features: [
            "Custom image generation",
            "Style transfer",
            "Image variations"
          ]
        },
        aiCapability: "image-generation",
        apiEndpoint: "/api/tools/2/execute",
        modelName: "dall-e-2",
        maxInputLength: 1000
      },
      {
        name: "CodeAssist Pro",
        description: "AI-powered code generation and optimization tool",
        professionalCategory: "Sales & Development",
        functionalCategory: "Code Generation",
        thumbnailUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
        previewUrl: "https://images.unsplash.com/photo-1509460364839-ef5b594e0ee8",
        pricing: "paid",
        featured: false,
        metadata: {
          features: [
            "Code completion",
            "Bug detection",
            "Documentation generation"
          ]
        },
        aiCapability: "code-generation",
        apiEndpoint: "/api/tools/3/execute",
        modelName: "gpt-3.5-turbo",
        maxInputLength: 3000
      }
    ];

    mockTools.forEach((tool, index) => {
      this.tools.set(index + 1, { ...tool, id: index + 1 });
    });
  }

  async getAllTools(): Promise<Tool[]> {
    return Array.from(this.tools.values());
  }

  async getToolById(id: number): Promise<Tool | undefined> {
    return this.tools.get(id);
  }

  async searchTools(params: SearchParams): Promise<Tool[]> {
    let results = Array.from(this.tools.values());

    if (params.query) {
      const query = params.query.toLowerCase();
      results = results.filter(tool =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      );
    }

    if (params.professionalCategory) {
      results = results.filter(tool => tool.professionalCategory === params.professionalCategory);
    }

    if (params.functionalCategory) {
      results = results.filter(tool => tool.functionalCategory === params.functionalCategory);
    }

    if (params.pricing && params.pricing !== 'all') {
      results = results.filter(tool => tool.pricing === params.pricing);
    }

    return results;
  }

  async getFeaturedTools(): Promise<Tool[]> {
    return Array.from(this.tools.values()).filter(tool => tool.featured);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getToolViews(userId: number): Promise<(ToolView & { tool: Tool })[]> {
    const views = this.toolViews.get(userId) || [];
    return Promise.all(
      views.map(async (view) => {
        const tool = await this.getToolById(view.toolId);
        return { ...view, tool: tool! };
      })
    );
  }

  async addToolView(userId: number, toolId: number): Promise<void> {
    const views = this.toolViews.get(userId) || [];
    const view: ToolView = {
      id: views.length + 1,
      userId,
      toolId,
      viewedAt: new Date(),
    };
    views.push(view);
    this.toolViews.set(userId, views);
  }

  async getToolFavorites(userId: number): Promise<(ToolFavorite & { tool: Tool })[]> {
    const favorites = this.toolFavorites.get(userId) || [];
    return Promise.all(
      favorites.map(async (favorite) => {
        const tool = await this.getToolById(favorite.toolId);
        return { ...favorite, tool: tool! };
      })
    );
  }

  async addToolFavorite(userId: number, toolId: number): Promise<void> {
    const favorites = this.toolFavorites.get(userId) || [];
    if (!favorites.some(f => f.toolId === toolId)) {
      const favorite: ToolFavorite = {
        id: favorites.length + 1,
        userId,
        toolId,
        createdAt: new Date(),
      };
      favorites.push(favorite);
      this.toolFavorites.set(userId, favorites);
    }
  }

  async removeToolFavorite(userId: number, toolId: number): Promise<void> {
    const favorites = this.toolFavorites.get(userId) || [];
    this.toolFavorites.set(
      userId,
      favorites.filter(f => f.toolId !== toolId)
    );
  }

  async getToolDownloads(userId: number): Promise<(ToolDownload & { tool: Tool })[]> {
    const downloads = this.toolDownloads.get(userId) || [];
    return Promise.all(
      downloads.map(async (download) => {
        const tool = await this.getToolById(download.toolId);
        return { ...download, tool: tool! };
      })
    );
  }

  async addToolDownload(userId: number, toolId: number): Promise<void> {
    const downloads = this.toolDownloads.get(userId) || [];
    const download: ToolDownload = {
      id: downloads.length + 1,
      userId,
      toolId,
      downloadedAt: new Date(),
    };
    downloads.push(download);
    this.toolDownloads.set(userId, downloads);
  }

  async getToolViewsByToolId(toolId: number): Promise<ToolView[]> {
    return Array.from(this.toolViews.values())
      .flat()
      .filter(view => view.toolId === toolId);
  }

  async getToolFavoritesByToolId(toolId: number): Promise<ToolFavorite[]> {
    return Array.from(this.toolFavorites.values())
      .flat()
      .filter(favorite => favorite.toolId === toolId);
  }

  async getToolDownloadsByToolId(toolId: number): Promise<ToolDownload[]> {
    return Array.from(this.toolDownloads.values())
      .flat()
      .filter(download => download.toolId === toolId);
  }

  async getEditorChoiceTools(): Promise<Tool[]> {
    return Array.from(this.tools.values()).filter(tool => tool.editorChoice === true);
  }
}

export const storage = new MemStorage();