import { Router, type IRouter } from "express";
import { db, leadsTable } from "@workspace/db";

const router: IRouter = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/leads", async (req, res): Promise<void> => {
  const { email, source = "homepage" } = req.body ?? {};

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    res.status(400).json({ error: "A valid email address is required." });
    return;
  }

  try {
    await db.insert(leadsTable).values({
      email: email.trim().toLowerCase(),
      source: typeof source === "string" ? source : "homepage",
    }).onConflictDoNothing();

    res.json({ success: true, message: "You're in. We'll be in touch." });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
