import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { practiceQuestions } from "../lib/practiceTest";

const router: IRouter = Router();

router.get("/practice-test", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.json(practiceQuestions);
});

export default router;
