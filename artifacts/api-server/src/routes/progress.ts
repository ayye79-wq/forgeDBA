import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { UpdateProgressParams, UpdateProgressBody } from "@workspace/api-zod";
import { db, moduleProgressTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getModuleDetail } from "../lib/content";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = auth.userId;
  next();
}

router.get("/progress", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId as string;

  const [rows, userRows] = await Promise.all([
    db.select().from(moduleProgressTable).where(eq(moduleProgressTable.userId, userId)),
    db.select().from(usersTable).where(eq(usersTable.userId, userId)),
  ]);

  const isPremium = userRows[0]?.isPremium ?? false;

  // Recalculate percentComplete live so stale DB values never mislead the UI
  const result = rows.map(r => {
    const completedLessonIds = r.completedLessonIds ?? [];
    const moduleDetail = getModuleDetail(r.moduleId, isPremium);
    const totalLessons = moduleDetail?.lessons.length ?? 0;
    const percentComplete = totalLessons > 0
      ? Math.round((completedLessonIds.length / totalLessons) * 100)
      : r.percentComplete;
    const isComplete = percentComplete === 100;
    return {
      moduleId: r.moduleId,
      completedLessonIds,
      percentComplete,
      completedAt: isComplete ? (r.completedAt?.toISOString() ?? null) : null,
    };
  });

  res.json(result);
});

router.post("/progress/:moduleId", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId as string;

  const params = UpdateProgressParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateProgressBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { moduleId } = params.data;
  const { lessonId, completed } = body.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.userId, userId));
  const isPremium = user?.isPremium ?? false;
  const moduleDetail = getModuleDetail(moduleId, isPremium);
  if (!moduleDetail) {
    res.status(404).json({ error: "Module not found" });
    return;
  }

  const [existing] = await db
    .select()
    .from(moduleProgressTable)
    .where(
      and(
        eq(moduleProgressTable.userId, userId),
        eq(moduleProgressTable.moduleId, moduleId)
      )
    );

  let completedLessonIds = existing?.completedLessonIds ?? [];

  if (completed && !completedLessonIds.includes(lessonId)) {
    completedLessonIds = [...completedLessonIds, lessonId];
  } else if (!completed) {
    completedLessonIds = completedLessonIds.filter(id => id !== lessonId);
  }

  const totalLessons = moduleDetail.lessons.length;
  const percentComplete = totalLessons > 0
    ? Math.round((completedLessonIds.length / totalLessons) * 100)
    : 0;

  const completedAt = percentComplete === 100 ? new Date() : null;

  let progressRow;
  if (existing) {
    [progressRow] = await db
      .update(moduleProgressTable)
      .set({ completedLessonIds, percentComplete, completedAt })
      .where(eq(moduleProgressTable.id, existing.id))
      .returning();
  } else {
    [progressRow] = await db
      .insert(moduleProgressTable)
      .values({ userId, moduleId, completedLessonIds, percentComplete, completedAt })
      .returning();
  }

  req.log.info({ userId, moduleId, percentComplete }, "Progress updated");

  res.json({
    moduleId: progressRow.moduleId,
    completedLessonIds: progressRow.completedLessonIds ?? [],
    percentComplete: progressRow.percentComplete,
    completedAt: progressRow.completedAt?.toISOString() ?? null,
  });
});

export default router;
