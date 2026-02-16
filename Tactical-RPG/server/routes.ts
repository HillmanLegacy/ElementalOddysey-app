import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSaveSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/saves", async (_req, res) => {
    try {
      const saves = await storage.getSaves();
      res.json(saves);
    } catch (err) {
      res.status(500).json({ message: "Failed to load saves" });
    }
  });

  app.get("/api/saves/:id", async (req, res) => {
    try {
      const save = await storage.getSave(req.params.id);
      if (!save) return res.status(404).json({ message: "Save not found" });
      res.json(save);
    } catch (err) {
      res.status(500).json({ message: "Failed to load save" });
    }
  });

  app.post("/api/saves", async (req, res) => {
    try {
      const parsed = insertGameSaveSchema.parse(req.body);
      const save = await storage.upsertSave(parsed);
      res.status(201).json(save);
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Invalid save data" });
    }
  });

  app.delete("/api/saves/:id", async (req, res) => {
    try {
      await storage.deleteSave(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete save" });
    }
  });

  return httpServer;
}
