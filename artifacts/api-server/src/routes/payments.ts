import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable, paymentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { VerifyPaymentQueryParams } from "@workspace/api-zod";
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

router.post("/payments/create-checkout", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId as string;

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    logger.warn("Stripe not configured — returning mock checkout URL");
    res.json({
      url: `${req.protocol}://${req.get("host")}/payment-success?session_id=mock_session_${Date.now()}`,
      sessionId: `mock_session_${Date.now()}`,
    });
    return;
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecretKey);

    const origin = `${req.protocol}://${req.get("host")}`;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 6900,
            product_data: {
              name: "DBA Forge — Full Course Access",
              description: "Lifetime access to all 5 modules, labs, simulations, and future content",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/modules`,
      metadata: { userId },
    });

    await db.insert(paymentsTable).values({
      userId,
      stripeSessionId: session.id,
      status: "pending",
    }).onConflictDoNothing();

    res.json({ url: session.url!, sessionId: session.id });
  } catch (err) {
    req.log.error({ err }, "Failed to create checkout session");
    res.status(500).json({ error: "Failed to create payment session" });
  }
});

router.get("/payments/verify", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.userId as string;

  const queryParams = VerifyPaymentQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: "Missing session_id" });
    return;
  }

  const { session_id } = queryParams.data;

  if (session_id.startsWith("mock_session_")) {
    await db.insert(usersTable).values({
      userId,
      email: "",
      isPremium: true,
      premiumSince: new Date(),
    }).onConflictDoUpdate({
      target: usersTable.userId,
      set: { isPremium: true, premiumSince: new Date() },
    });

    res.json({ success: true, isPremium: true, message: "Access granted. Welcome to DBA Forge." });
    return;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    res.status(400).json({ error: "Payment system not configured" });
    return;
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeSecretKey);

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      res.status(400).json({ error: "Payment not completed", success: false, isPremium: false, message: "Payment was not completed" });
      return;
    }

    if (session.metadata?.userId !== userId) {
      res.status(403).json({ error: "Session does not belong to this user", success: false, isPremium: false, message: "Invalid session" });
      return;
    }

    await db.insert(usersTable).values({
      userId,
      email: session.customer_details?.email ?? "",
      isPremium: true,
      premiumSince: new Date(),
    }).onConflictDoUpdate({
      target: usersTable.userId,
      set: { isPremium: true, premiumSince: new Date() },
    });

    await db.update(paymentsTable)
      .set({ status: "completed" })
      .where(eq(paymentsTable.stripeSessionId, session_id));

    req.log.info({ userId, sessionId: session_id }, "Payment verified, user upgraded to premium");

    res.json({ success: true, isPremium: true, message: "Payment verified. You now have full access to DBA Forge." });
  } catch (err) {
    req.log.error({ err }, "Error verifying payment");
    res.status(500).json({ error: "Failed to verify payment", success: false, isPremium: false, message: "Verification failed" });
  }
});

export default router;
