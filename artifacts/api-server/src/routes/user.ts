import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable, moduleProgressTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/user/profile", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const clerkUser = auth?.sessionClaims;
  const email = (clerkUser?.email as string) ?? "";

  let user = await db.select().from(usersTable).where(eq(usersTable.userId, userId)).then(r => r[0]);

  if (!user) {
    [user] = await db.insert(usersTable).values({
      userId,
      email,
      isPremium: false,
    }).returning();
  }

  const progressRows = await db
    .select()
    .from(moduleProgressTable)
    .where(eq(moduleProgressTable.userId, userId));

  const modulesCompleted = progressRows.filter(p => p.percentComplete === 100).length;
  const totalLessonsCompleted = progressRows.reduce(
    (sum, p) => sum + (p.completedLessonIds?.length ?? 0),
    0
  );

  res.json({
    userId: user.userId,
    email: user.email || email,
    isPremium: user.isPremium,
    premiumSince: user.premiumSince?.toISOString() ?? null,
    modulesCompleted,
    totalLessonsCompleted,
  });
});

export default router;
