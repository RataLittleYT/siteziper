import { type CloneJob, type InsertCloneJob } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getCloneJob(id: string): Promise<CloneJob | undefined>;
  createCloneJob(job: InsertCloneJob): Promise<CloneJob>;
  updateCloneJob(id: string, updates: Partial<CloneJob>): Promise<CloneJob | undefined>;
  deleteCloneJob(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private cloneJobs: Map<string, CloneJob>;

  constructor() {
    this.cloneJobs = new Map();
  }

  async getCloneJob(id: string): Promise<CloneJob | undefined> {
    return this.cloneJobs.get(id);
  }

  async createCloneJob(insertJob: InsertCloneJob): Promise<CloneJob> {
    const id = randomUUID();
    const job: CloneJob = {
      ...insertJob,
      id,
      status: "pending",
      progress: 0,
      currentStatus: "Initializing...",
      filesProcessed: 0,
      totalSize: "0 B",
      downloadSpeed: "0 B/s",
      timeRemaining: "Unknown",
      zipPath: null,
      zipSize: null,
      createdAt: new Date(),
      completedAt: null,
      errorMessage: null,
      metadata: null,
    };
    this.cloneJobs.set(id, job);
    return job;
  }

  async updateCloneJob(id: string, updates: Partial<CloneJob>): Promise<CloneJob | undefined> {
    const job = this.cloneJobs.get(id);
    if (!job) return undefined;

    const updatedJob = { ...job, ...updates };
    this.cloneJobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteCloneJob(id: string): Promise<boolean> {
    return this.cloneJobs.delete(id);
  }
}

export const storage = new MemStorage();
