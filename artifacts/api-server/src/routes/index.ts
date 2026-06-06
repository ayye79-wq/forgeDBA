import { Router, type IRouter } from "express";
import healthRouter from "./health";
import modulesRouter from "./modules";
import progressRouter from "./progress";
import quickReferenceRouter from "./quickReference";
import userRouter from "./user";
import paymentsRouter from "./payments";
import statsRouter from "./stats";
import leadsRouter from "./leads";
import askRouter from "./ask";
import practiceTestRouter from "./practiceTest";

const router: IRouter = Router();

router.use(healthRouter);
router.use(modulesRouter);
router.use(progressRouter);
router.use(quickReferenceRouter);
router.use(userRouter);
router.use(paymentsRouter);
router.use(statsRouter);
router.use(leadsRouter);
router.use(askRouter);
router.use(practiceTestRouter);

export default router;
