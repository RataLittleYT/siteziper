import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cloneJobs = pgTable("clone_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  progress: integer("progress").notNull().default(0),
  includeImages: boolean("include_images").notNull().default(true),
  includeFonts: boolean("include_fonts").notNull().default(true),
  includeJS: boolean("include_js").notNull().default(true),
  followSubdomains: boolean("follow_subdomains").notNull().default(false),
  maxDepth: integer("max_depth").notNull().default(3),
  currentStatus: text("current_status").default("Initializing..."),
  filesProcessed: integer("files_processed").default(0),
  totalSize: text("total_size").default("0 B"),
  downloadSpeed: text("download_speed").default("0 B/s"),
  timeRemaining: text("time_remaining").default("Unknown"),
  zipPath: text("zip_path"),
  zipSize: text("zip_size"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
});

export const insertCloneJobSchema = createInsertSchema(cloneJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertCloneJob = z.infer<typeof insertCloneJobSchema>;
export type CloneJob = typeof cloneJobs.$inferSelect;
