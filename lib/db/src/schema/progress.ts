import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const moduleProgressTable = pgTable("module_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  moduleId: text("module_id").notNull(),
  completedLessonIds: text("completed_lesson_ids").array().notNull().default([]),
  percentComplete: integer("percent_complete").notNull().default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertModuleProgressSchema = createInsertSchema(moduleProgressTable).omit({ id: true, updatedAt: true });
export type InsertModuleProgress = z.infer<typeof insertModuleProgressSchema>;
export type ModuleProgress = typeof moduleProgressTable.$inferSelect;
