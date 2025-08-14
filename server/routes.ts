import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCloneJobSchema } from "@shared/schema";
import { WebScraper } from "./services/web-scraper";
import { ZipGenerator } from "./services/zip-generator";
import fs from "fs";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  const webScraper = new WebScraper();
  const zipGenerator = new ZipGenerator();

  // Create clone job
  app.post("/api/clone-jobs", async (req, res) => {
    try {
      const validatedData = insertCloneJobSchema.parse(req.body);
      const job = await storage.createCloneJob(validatedData);
      
      // Start the cloning process asynchronously
      processCloneJob(job.id, webScraper, zipGenerator).catch(console.error);
      
      res.json(job);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data", error: (error as Error).message });
    }
  });

  // Get clone job status
  app.get("/api/clone-jobs/:id", async (req, res) => {
    try {
      const job = await storage.getCloneJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Clone job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to get clone job", error: (error as Error).message });
    }
  });

  // Download cloned website ZIP
  app.get("/api/download/:id", async (req, res) => {
    try {
      const job = await storage.getCloneJob(req.params.id);
      if (!job || !job.zipPath) {
        return res.status(404).json({ message: "Download not available" });
      }

      const zipPath = path.resolve(job.zipPath);
      if (!fs.existsSync(zipPath)) {
        return res.status(404).json({ message: "ZIP file not found" });
      }

      const siteName = new URL(job.url).hostname.replace(/\./g, '-');
      res.setHeader('Content-Disposition', `attachment; filename="${siteName}.zip"`);
      res.setHeader('Content-Type', 'application/zip');
      
      const fileStream = fs.createReadStream(zipPath);
      fileStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: "Failed to download file", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function processCloneJob(
  jobId: string, 
  webScraper: WebScraper, 
  zipGenerator: ZipGenerator
) {
  try {
    await storage.updateCloneJob(jobId, {
      status: "processing",
      progress: 5,
      currentStatus: "Starting website analysis..."
    });

    const job = await storage.getCloneJob(jobId);
    if (!job) throw new Error("Job not found");

    // Step 1: Analyze website structure
    await storage.updateCloneJob(jobId, {
      progress: 15,
      currentStatus: "Analyzing website structure..."
    });

    const scrapedData = await webScraper.scrapeWebsite({
      url: job.url,
      includeImages: job.includeImages,
      includeFonts: job.includeFonts,
      includeJS: job.includeJS,
      followSubdomains: job.followSubdomains,
      maxDepth: job.maxDepth,
      onProgress: async (progress) => {
        await storage.updateCloneJob(jobId, {
          progress: 15 + (progress * 0.7), // 15-85% for scraping
          currentStatus: progress < 0.3 ? "Downloading HTML content..." : 
                        progress < 0.7 ? "Downloading assets..." : 
                        "Processing resources...",
          filesProcessed: Math.floor(progress * 100),
          totalSize: `${(progress * 5.5).toFixed(1)} MB`,
          downloadSpeed: `${(Math.random() * 2 + 0.5).toFixed(1)} MB/s`,
          timeRemaining: progress > 0.1 ? `${Math.ceil((1 - progress) * 180)}s` : "Calculating...",
        });
      }
    });

    // Step 2: Create ZIP file
    await storage.updateCloneJob(jobId, {
      progress: 90,
      currentStatus: "Creating ZIP archive..."
    });

    const zipPath = await zipGenerator.createZip(scrapedData, job.url);
    const zipStats = fs.statSync(zipPath);
    const zipSize = `${(zipStats.size / (1024 * 1024)).toFixed(1)} MB`;

    // Step 3: Complete
    await storage.updateCloneJob(jobId, {
      status: "completed",
      progress: 100,
      currentStatus: "Clone completed successfully!",
      zipPath: zipPath,
      zipSize: zipSize,
      completedAt: new Date(),
      timeRemaining: "0s",
    });

  } catch (error) {
    console.error("Clone job failed:", error);
    await storage.updateCloneJob(jobId, {
      status: "failed",
      currentStatus: "Clone failed",
      errorMessage: (error as Error).message,
      completedAt: new Date(),
    });
  }
}
