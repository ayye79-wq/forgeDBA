import app from "./app";
import { logger } from "./lib/logger";
import { db, moduleProgressTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// One-time idempotent data migration: credit fund-code-2 (a lesson added after
// launch) for any user who completed the original 6 fundamentals lessons.
// Safe to leave in permanently — the WHERE guard prevents double-application.
async function runDataMigrations() {
  try {
    const result = await db.execute(sql`
      UPDATE ${moduleProgressTable}
      SET
        completed_lesson_ids = array_append(completed_lesson_ids, 'fund-code-2'),
        percent_complete = ROUND(
          (array_length(array_append(completed_lesson_ids, 'fund-code-2'), 1)::numeric / 8) * 100
        )
      WHERE module_id = 'fundamentals'
        AND NOT ('fund-code-2' = ANY(completed_lesson_ids))
        AND 'fund-scenario'  = ANY(completed_lesson_ids)
        AND 'fund-code-1'    = ANY(completed_lesson_ids)
        AND 'fund-lab'       = ANY(completed_lesson_ids)
        AND 'fund-checklist' = ANY(completed_lesson_ids)
    `);
    const count = (result as any).rowCount ?? 0;
    if (count > 0) {
      logger.info({ count }, "Data migration: credited fund-code-2 to existing users");
    }
  } catch (err) {
    logger.warn({ err }, "Data migration skipped (non-fatal)");
  }
}

runDataMigrations().then(() => {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
});
