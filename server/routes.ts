import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchParamsSchema, aiToolRequestSchema } from "@shared/schema";
import { ZodError } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Set up authentication
  setupAuth(app);

  app.get("/api/tools", async (req, res) => {
    try {
      const params = searchParamsSchema.parse(req.query);
      const tools = await storage.searchTools(params);
      res.json(tools);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid search parameters" });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/tools/featured", async (_req, res) => {
    try {
      const tools = await storage.getFeaturedTools();
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tools/editor-choice", async (_req, res) => {
    try {
      const tools = await storage.getEditorChoiceTools();
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tools/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tool = await storage.getToolById(id);

      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }

      res.json(tool);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/tools/:id/execute", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tool = await storage.getToolById(id);

      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }

      const { prompt } = aiToolRequestSchema.parse(req.body);

      if (prompt.length > tool.maxInputLength) {
        return res.status(400).json({
          message: `Input exceeds maximum length of ${tool.maxInputLength} characters`
        });
      }

      // Mock responses based on tool type
      let result;
      switch (tool.aiCapability) {
        case "text-generation":
          result = `Generated text based on: "${prompt}"\n\nThis is a mock response for text generation.`;
          break;
        case "code-generation":
          result = `// Generated code based on: "${prompt}"\n\nfunction mockResponse() {\n  console.log("This is a mock response");\n}`;
          break;
        case "image-generation":
          // Return a placeholder image URL
          result = "https://placehold.co/600x400?text=AI+Generated+Image";
          break;
        default:
          result = `Mock response for ${tool.aiCapability}`;
      }

      res.json({ result });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid request parameters" });
      } else {
        console.error("AI tool execution error:", error);
        res.status(500).json({ message: "Failed to execute AI tool" });
      }
    }
  });

  // Track tool view
  app.post("/api/tools/:id/view", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const toolId = parseInt(req.params.id);
    const userId = req.user!.id;

    storage.addToolView(userId, toolId);
    res.sendStatus(200);
  });

  // Toggle tool favorite
  app.post("/api/tools/:id/favorite", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const toolId = parseInt(req.params.id);
    const userId = req.user!.id;
    const { action } = req.body;

    if (action === "add") {
      await storage.addToolFavorite(userId, toolId);
    } else if (action === "remove") {
      await storage.removeToolFavorite(userId, toolId);
    }

    res.sendStatus(200);
  });

  // Track tool download
  app.post("/api/tools/:id/download", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const toolId = parseInt(req.params.id);
    const userId = req.user!.id;

    storage.addToolDownload(userId, toolId);
    res.sendStatus(200);
  });

  // Get user's tool interactions
  app.get("/api/user/tools", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.user!.id;
    const [views, favorites, downloads] = await Promise.all([
      storage.getToolViews(userId),
      storage.getToolFavorites(userId),
      storage.getToolDownloads(userId)
    ]);

    res.json({ views, favorites, downloads });
  });

  // Developer metrics endpoint
  app.get("/api/developer/metrics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = req.user!;
    if (!user.isDeveloper) {
      return res.status(403).json({ message: "Developer access required" });
    }

    // Get all tools
    const tools = await storage.getAllTools();

    // For each tool, get its metrics
    const metrics = await Promise.all(
      tools.map(async (tool) => {
        // Get all interactions for this tool
        const [views, favorites, downloads] = await Promise.all([
          storage.getToolViewsByToolId(tool.id),
          storage.getToolFavoritesByToolId(tool.id),
          storage.getToolDownloadsByToolId(tool.id),
        ]);

        // Group interactions by date for historical data
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const downloadHistory = last30Days.map(date => ({
          date,
          count: downloads.filter(d =>
            d.downloadedAt.toISOString().split('T')[0] === date
          ).length
        }));

        const viewHistory = last30Days.map(date => ({
          date,
          count: views.filter(v =>
            v.viewedAt.toISOString().split('T')[0] === date
          ).length
        }));

        const favoriteHistory = last30Days.map(date => ({
          date,
          count: favorites.filter(f =>
            f.createdAt.toISOString().split('T')[0] === date
          ).length
        }));

        return {
          id: tool.id,
          name: tool.name,
          downloads: downloads.length,
          views: views.length,
          favorites: favorites.length,
          downloadHistory,
          viewHistory,
          favoriteHistory,
        };
      })
    );

    res.json(metrics);
  });

  return httpServer;
}