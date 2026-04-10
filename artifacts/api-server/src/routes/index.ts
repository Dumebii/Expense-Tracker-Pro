import { Router, type IRouter } from "express";
import healthRouter from "./health";
import expensesRouter from "./expenses";
import incomeRouter from "./income";
import financialsRouter from "./financials";
import openaiRouter from "./openai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(expensesRouter);
router.use(incomeRouter);
router.use(financialsRouter);
router.use(openaiRouter);

export default router;
