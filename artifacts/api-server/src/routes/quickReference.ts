import { Router, type IRouter } from "express";
import { quickReferenceSections } from "../lib/quickReference";

const router: IRouter = Router();

router.get("/quick-reference", async (_req, res): Promise<void> => {
  res.json(quickReferenceSections);
});

export default router;
