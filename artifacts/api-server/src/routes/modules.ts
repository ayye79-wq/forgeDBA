import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { GetModuleParams } from "@workspace/api-zod";
import { getModuleSummaries, getModuleDetail } from "../lib/content";

const router: IRouter = Router();

router.get("/modules", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.userId;

  let isPremium = false;
  if (userId) {
    const { db, usersTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select().from(usersTable).where(eq(usersTable.userId, userId));
    isPremium = user?.isPremium ?? false;
  }

  const summaries = getModuleSummaries(isPremium);
  res.json(summaries);
});

router.get("/modules/:moduleId", async (req, res): Promise<void> => {
  const params = GetModuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const auth = getAuth(req);
  const userId = auth?.userId;

  let isPremium = false;
  if (userId) {
    const { db, usersTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select().from(usersTable).where(eq(usersTable.userId, userId));
    isPremium = user?.isPremium ?? false;
  }

  const module = getModuleDetail(params.data.moduleId, isPremium);
  if (!module) {
    res.status(404).json({ error: "Module not found" });
    return;
  }

  res.json(module);
});

export default router;
