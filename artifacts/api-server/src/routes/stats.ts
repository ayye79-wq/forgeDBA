import { Router, type IRouter } from "express";
import { db, usersTable, moduleProgressTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { modules } from "../lib/content";

const router: IRouter = Router();

router.get("/stats/overview", async (_req, res): Promise<void> => {
  const totalModules = modules.length;
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  const [premiumCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(usersTable)
    .where(eq(usersTable.isPremium, true));

  const [enrollmentCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(usersTable);

  res.json({
    totalModules,
    totalLessons,
    premiumUsers: Number(premiumCount?.count ?? 0),
    totalEnrollments: Number(enrollmentCount?.count ?? 0),
  });
});

export default router;
