import { Link } from "wouter";
import { Clock, ChevronRight, BookOpen, Database } from "lucide-react";

export const BLOG_POSTS = [
  {
    slug: "how-to-restore-sql-server-database",
    title: "How to Restore a SQL Server Database from Backup",
    description: "Step-by-step guide to restoring a full backup, applying differential and log backups, and bringing your database online — even under pressure.",
    date: "April 28, 2026",
    readTime: "8 min read",
    category: "Disaster Recovery",
    content: `When a database goes down in production, every second counts. This guide walks you through the exact steps to restore a SQL Server database from backup — the way a real DBA does it.

## Understanding the Restore Chain

Before running any restore command, you need to understand the three types of backups and how they chain together:

- **Full backup** — A complete snapshot of the database at a point in time. Always the starting point of a restore.
- **Differential backup** — All changes since the last full backup. Applied after the full restore.
- **Transaction log backup** — All transactions since the last log backup. Applied in sequence for point-in-time recovery.

To restore to a specific point in time, you need: Full → Differential (optional) → Log files in sequence.

## Step 1: Find Your Backup Files

Before anything else, confirm what backups exist and where they are:

\`\`\`sql
-- See backup history for a specific database
SELECT 
    bs.database_name,
    bs.backup_start_date,
    bs.backup_finish_date,
    bs.type AS backup_type,  -- D=Full, I=Differential, L=Log
    bs.backup_size / 1024 / 1024 AS size_mb,
    bmf.physical_device_name
FROM msdb.dbo.backupset bs
JOIN msdb.dbo.backupmediafamily bmf 
    ON bs.media_set_id = bmf.media_set_id
WHERE bs.database_name = 'YourDatabase'
ORDER BY bs.backup_start_date DESC;
\`\`\`

## Step 2: Verify the Backup File is Readable

Never start a restore without verifying the backup first:

\`\`\`sql
-- Verify backup integrity
RESTORE VERIFYONLY 
FROM DISK = 'C:\\Backups\\YourDatabase_FULL.bak';

-- See what's inside a backup file
RESTORE HEADERONLY 
FROM DISK = 'C:\\Backups\\YourDatabase_FULL.bak';

RESTORE FILELISTONLY 
FROM DISK = 'C:\\Backups\\YourDatabase_FULL.bak';
\`\`\`

## Step 3: Restore the Full Backup

\`\`\`sql
-- Restore full backup WITH NORECOVERY 
-- (leaves DB in restoring state so you can apply more backups)
RESTORE DATABASE YourDatabase
FROM DISK = 'C:\\Backups\\YourDatabase_FULL.bak'
WITH 
    NORECOVERY,
    STATS = 10,  -- Show progress every 10%
    MOVE 'YourDatabase' TO 'D:\\Data\\YourDatabase.mdf',
    MOVE 'YourDatabase_log' TO 'E:\\Logs\\YourDatabase.ldf';
\`\`\`

## Step 4: Apply the Differential (if you have one)

\`\`\`sql
RESTORE DATABASE YourDatabase
FROM DISK = 'C:\\Backups\\YourDatabase_DIFF.bak'
WITH NORECOVERY;
\`\`\`

## Step 5: Apply Transaction Log Backups

Apply each log backup in chronological order:

\`\`\`sql
-- Apply each log backup sequentially
RESTORE LOG YourDatabase
FROM DISK = 'C:\\Backups\\YourDatabase_LOG_0900.bak'
WITH NORECOVERY;

RESTORE LOG YourDatabase
FROM DISK = 'C:\\Backups\\YourDatabase_LOG_1000.bak'
WITH NORECOVERY;

-- Last one: use RECOVERY to bring the database online
RESTORE LOG YourDatabase
FROM DISK = 'C:\\Backups\\YourDatabase_LOG_1100.bak'
WITH RECOVERY;
\`\`\`

## Step 6: Bring the Database Online

If you're doing a full restore with no additional log backups to apply:

\`\`\`sql
-- Skip this if you already used WITH RECOVERY above
RESTORE DATABASE YourDatabase WITH RECOVERY;

-- Verify the database is online
SELECT name, state_desc FROM sys.databases WHERE name = 'YourDatabase';
\`\`\`

## Common Errors and Fixes

**Error: "The tail of the log has not been backed up"**
SQL Server won't let you restore over a live database without backing up the tail log first:
\`\`\`sql
-- Back up the tail log before overwriting
BACKUP LOG YourDatabase 
TO DISK = 'C:\\Backups\\YourDatabase_TAILLOG.bak'
WITH NORECOVERY;
\`\`\`

**Error: "Exclusive access could not be obtained"**
Kill active connections first:
\`\`\`sql
ALTER DATABASE YourDatabase SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
-- Now run your RESTORE
ALTER DATABASE YourDatabase SET MULTI_USER;
\`\`\`

## The Real-World Checklist

Before restoring in production:
1. Confirm backup file path and size
2. Run RESTORE VERIFYONLY
3. Check that you have enough disk space
4. Back up the tail log if the database is live
5. Set SINGLE_USER mode if needed
6. Document what you did and when

This is exactly what you practice in the DBA Forge Backups & Restores module — with a real scenario where the CEO wants their deleted table back in 10 minutes.`,
  },
  {
    slug: "sql-server-backup-types-explained",
    title: "SQL Server Backup Strategy: Full, Differential, and Log Backups Explained",
    description: "Understand when to use each backup type, how they work together, and how to build a backup strategy that actually protects your production data.",
    date: "April 21, 2026",
    readTime: "7 min read",
    category: "Backups",
    content: `Most accidental data loss happens not because backups failed — but because no one tested them, or the backup strategy was wrong. Here is how to build a strategy that actually works.

## The Three Backup Types

### Full Backup
A complete copy of the entire database at a point in time.

\`\`\`sql
BACKUP DATABASE YourDatabase
TO DISK = 'C:\\Backups\\YourDatabase_FULL.bak'
WITH COMPRESSION, STATS = 10;
\`\`\`

**When to use:** Once daily (at minimum), typically overnight during low-traffic hours.

### Differential Backup
All pages that changed since the last full backup.

\`\`\`sql
BACKUP DATABASE YourDatabase
TO DISK = 'C:\\Backups\\YourDatabase_DIFF.bak'
WITH DIFFERENTIAL, COMPRESSION, STATS = 10;
\`\`\`

**When to use:** Every 4–6 hours during the day. Reduces how many log backups you need during restore.

### Transaction Log Backup
All committed transactions since the last log backup.

\`\`\`sql
BACKUP LOG YourDatabase
TO DISK = 'C:\\Backups\\YourDatabase_LOG.bak'
WITH COMPRESSION;
\`\`\`

**When to use:** Every 15–60 minutes for production databases. This enables point-in-time recovery.

**Important:** Transaction log backups only work if your database is in FULL or BULK_LOGGED recovery model.

## Checking Your Recovery Model

\`\`\`sql
SELECT name, recovery_model_desc 
FROM sys.databases 
WHERE name = 'YourDatabase';

-- Change to FULL recovery model
ALTER DATABASE YourDatabase SET RECOVERY FULL;
\`\`\`

## A Practical Backup Schedule

| Time | Backup Type | File Name |
|------|------------|-----------|
| 11pm | Full backup | DB_FULL_230000.bak |
| 6am | Differential | DB_DIFF_060000.bak |
| Every 30 min | Log backup | DB_LOG_HHMM.bak |

## Automating Backups with SQL Agent

\`\`\`sql
-- Create a SQL Agent job step (T-SQL)
-- This is typically done through SSMS or Ola Hallengren's scripts
EXEC msdb.dbo.sp_add_job @job_name = 'Nightly Full Backup';

EXEC msdb.dbo.sp_add_jobstep 
    @job_name = 'Nightly Full Backup',
    @step_name = 'Run Full Backup',
    @command = N'BACKUP DATABASE YourDatabase TO DISK = ''C:\\Backups\\YourDatabase_FULL_'' + CONVERT(varchar, GETDATE(), 112) + ''.bak'' WITH COMPRESSION';
\`\`\`

For production, use Ola Hallengren's free backup solution (ola.hallengren.com) — the industry standard.

## Verifying Backups Actually Work

A backup you haven't tested is not a backup. Monthly, run this:

\`\`\`sql
-- Restore to a test server
RESTORE DATABASE YourDatabase_TEST
FROM DISK = 'C:\\Backups\\YourDatabase_FULL.bak'
WITH MOVE 'YourDatabase' TO 'D:\\Test\\YourDatabase_TEST.mdf',
     MOVE 'YourDatabase_log' TO 'D:\\Test\\YourDatabase_TEST.ldf',
     RECOVERY;

-- Verify row counts match production
USE YourDatabase_TEST;
SELECT 'Orders' AS tbl, COUNT(*) AS cnt FROM Orders
UNION ALL
SELECT 'Customers', COUNT(*) FROM Customers;
\`\`\`

If the restore fails or row counts are off, you want to know that now — not at 2am when the CEO is calling.`,
  },
  {
    slug: "sql-server-transaction-log-full-fix",
    title: "SQL Server Transaction Log Full: How to Fix It Without Losing Data",
    description: "Your log file filled the disk and SQL Server is throwing errors. Here is exactly how to diagnose it, shrink the log safely, and prevent it from happening again.",
    date: "April 14, 2026",
    readTime: "6 min read",
    category: "Recovery Models",
    content: `"The transaction log for database X is full due to LOG_BACKUP" — this error brings down applications fast. Here is how to fix it without making things worse.

## Why Transaction Logs Fill Up

The log file keeps growing when SQL Server can't reuse the space inside it. The most common reasons:

\`\`\`sql
-- See why the log can't be reused
SELECT name, log_reuse_wait_desc 
FROM sys.databases 
WHERE name = 'YourDatabase';
\`\`\`

Common values:
- **LOG_BACKUP** — You're in FULL recovery model but aren't taking log backups
- **ACTIVE_TRANSACTION** — A long-running transaction is holding the log open
- **REPLICATION** — Log reader isn't running or is behind
- **NOTHING** — Log is healthy, can be reused

## The Most Common Cause: LOG_BACKUP

If log_reuse_wait_desc = LOG_BACKUP, you just need to take a log backup:

\`\`\`sql
-- This immediately frees up reusable log space
BACKUP LOG YourDatabase
TO DISK = 'C:\\Backups\\YourDatabase_LOG_emergency.bak'
WITH COMPRESSION;

-- Check the log size before and after
DBCC SQLPERF(LOGSPACE);
\`\`\`

## If the Disk is Already Full

If you have no space to write the backup, you need to free some first:

\`\`\`sql
-- Option 1: Delete old backup files manually (via OS)
-- Option 2: Backup to a different drive
BACKUP LOG YourDatabase
TO DISK = 'E:\\EmergencyBackups\\LOG_emergency.bak'
WITH COMPRESSION;
\`\`\`

## Shrinking the Log File (After Backup)

After taking a log backup, you can shrink the physical file:

\`\`\`sql
-- Check current log size
USE YourDatabase;
DBCC SQLPERF(LOGSPACE);

-- Shrink the log file (replace 'YourDatabase_log' with actual logical name)
DBCC SHRINKFILE (YourDatabase_log, 1024);  -- Target size in MB
\`\`\`

**Warning:** Never shrink the log file before backing it up. And never shrink it repeatedly — it causes fragmentation.

## When You're in SIMPLE Recovery Model

If log_reuse_wait = LOG_BACKUP but you don't want to take log backups, switch to SIMPLE:

\`\`\`sql
-- SIMPLE recovery: log truncates automatically at each CHECKPOINT
-- WARNING: You lose point-in-time recovery capability
ALTER DATABASE YourDatabase SET RECOVERY SIMPLE;
DBCC SHRINKFILE (YourDatabase_log, 512);
ALTER DATABASE YourDatabase SET RECOVERY FULL;  -- Switch back if needed
\`\`\`

## Finding Long-Running Transactions (ACTIVE_TRANSACTION)

If the cause is ACTIVE_TRANSACTION:

\`\`\`sql
-- Find the open transaction
DBCC OPENTRAN('YourDatabase');

-- More detail
SELECT 
    s.session_id,
    s.login_name,
    s.host_name,
    t.transaction_begin_time,
    DATEDIFF(MINUTE, t.transaction_begin_time, GETDATE()) AS minutes_open,
    st.text AS last_query
FROM sys.dm_tran_active_transactions t
JOIN sys.dm_tran_session_transactions st2 ON t.transaction_id = st2.transaction_id
JOIN sys.dm_exec_sessions s ON st2.session_id = s.session_id
CROSS APPLY sys.dm_exec_sql_text(s.most_recent_sql_handle) st;
\`\`\`

Kill the session if it's stuck:

\`\`\`sql
KILL 52;  -- Replace 52 with the session_id
\`\`\`

## Prevention: Set Up a Log Backup Job

Set up a SQL Agent job to back up the log every 30 minutes. If you're using Ola Hallengren's scripts, it's one line in the job command.

This is the scenario you work through in DBA Forge Module 3 — Recovery Models — where your log file is eating the disk on a Friday at 4pm.`,
  },
  {
    slug: "sql-server-slow-query-performance-tuning",
    title: "SQL Server Slow Query? How to Find and Fix It",
    description: "A query that ran in 2 seconds now takes 40. Here is the step-by-step diagnostic process every DBA uses to find the bottleneck and fix it.",
    date: "April 7, 2026",
    readTime: "9 min read",
    category: "Performance",
    content: `Someone just pinged you: "The app is slow. Can you check SQL Server?" Here is exactly how to diagnose it — methodically and without guessing.

## Step 1: Find the Top Offenders Right Now

\`\`\`sql
-- Top 10 queries by total CPU time
SELECT TOP 10
    total_elapsed_time / execution_count / 1000 AS avg_ms,
    execution_count,
    total_logical_reads / execution_count AS avg_logical_reads,
    SUBSTRING(st.text, (qs.statement_start_offset/2)+1, 
        ((CASE qs.statement_end_offset 
            WHEN -1 THEN DATALENGTH(st.text)
            ELSE qs.statement_end_offset 
          END - qs.statement_start_offset)/2)+1) AS query_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
ORDER BY total_elapsed_time / execution_count DESC;
\`\`\`

## Step 2: Check for Blocking

A query can seem slow when it's actually waiting on a lock:

\`\`\`sql
-- Find blocking chains
SELECT 
    blocking.session_id AS blocker_session,
    blocked.session_id AS blocked_session,
    blocked.wait_type,
    blocked.wait_time / 1000 AS wait_seconds,
    SUBSTRING(st.text, 1, 200) AS blocked_query
FROM sys.dm_exec_sessions blocked
JOIN sys.dm_exec_sessions blocking ON blocked.blocking_session_id = blocking.session_id
CROSS APPLY sys.dm_exec_sql_text(blocked.most_recent_sql_handle) st;
\`\`\`

## Step 3: Look at the Execution Plan

For a specific slow query, get the actual execution plan in SSMS:
1. Open the query
2. Click "Include Actual Execution Plan" (Ctrl+M)
3. Run the query
4. Click the Execution Plan tab

**What to look for:**
- **Fat arrows** — large row estimates mean data volumes are high
- **Warning triangles** — missing indexes, implicit conversions, spills to disk
- **Table scans** on large tables — missing index opportunity
- **Key lookups** — the index exists but isn't covering the query

## Step 4: Check Index Usage

\`\`\`sql
-- Missing index suggestions (SQL Server generates these automatically)
SELECT 
    ROUND(migs.avg_total_user_cost * migs.avg_user_impact * (migs.user_seeks + migs.user_scans), 0) AS estimated_improvement,
    mid.statement AS table_name,
    mid.equality_columns,
    mid.inequality_columns,
    mid.included_columns
FROM sys.dm_db_missing_index_group_stats migs
JOIN sys.dm_db_missing_index_groups mig ON migs.group_handle = mig.index_group_handle
JOIN sys.dm_db_missing_index_details mid ON mig.index_handle = mid.index_handle
ORDER BY estimated_improvement DESC;
\`\`\`

\`\`\`sql
-- Find unused indexes (wasting write overhead)
SELECT 
    OBJECT_NAME(i.object_id) AS table_name,
    i.name AS index_name,
    i.type_desc,
    ius.user_seeks,
    ius.user_scans,
    ius.user_lookups,
    ius.user_updates
FROM sys.indexes i
LEFT JOIN sys.dm_db_index_usage_stats ius 
    ON i.object_id = ius.object_id AND i.index_id = ius.index_id
WHERE OBJECTPROPERTY(i.object_id, 'IsUserTable') = 1
    AND (ius.user_seeks = 0 OR ius.user_seeks IS NULL)
    AND i.type_desc <> 'HEAP'
ORDER BY ius.user_updates DESC;
\`\`\`

## Step 5: Check Wait Statistics

Wait stats tell you what SQL Server is waiting on:

\`\`\`sql
SELECT TOP 10
    wait_type,
    waiting_tasks_count,
    wait_time_ms / 1000 AS wait_seconds,
    max_wait_time_ms / 1000 AS max_wait_seconds,
    100.0 * wait_time_ms / SUM(wait_time_ms) OVER () AS pct
FROM sys.dm_os_wait_stats
WHERE wait_type NOT IN (
    'SLEEP_TASK', 'BROKER_TO_FLUSH', 'BROKER_TASK_STOP', 'CLR_AUTO_EVENT',
    'DISPATCHER_QUEUE_SEMAPHORE', 'FT_IFTS_SCHEDULER_IDLE_WAIT',
    'HADR_FILESTREAM_IOMGR_IOCOMPLETION', 'HADR_WORK_QUEUE', 'LAZYWRITER_SLEEP',
    'LOGMGR_QUEUE', 'ONDEMAND_TASK_QUEUE', 'REQUEST_FOR_DEADLOCK_SEARCH',
    'RESOURCE_QUEUE', 'SERVER_IDLE_CHECK', 'SLEEP_DBSTARTUP',
    'SLEEP_DCOMSTARTUP', 'SLEEP_MASTERDBREADY', 'SLEEP_MASTERMDREADY',
    'SLEEP_MASTERUPGRADED', 'SLEEP_MSDBSTARTUP', 'SLEEP_SYSTEMTASK',
    'SLEEP_TEMPDBSTARTUP', 'SNI_HTTP_ACCEPT', 'SP_SERVER_DIAGNOSTICS_SLEEP',
    'SQLTRACE_BUFFER_FLUSH', 'WAITFOR', 'XE_DISPATCHER_WAIT', 'XE_TIMER_EVENT'
)
ORDER BY wait_time_ms DESC;
\`\`\`

Key wait types and what they mean:
- **CXPACKET** — Parallelism, possibly too many threads on one query
- **LCK_M_*** — Locking/blocking problems
- **PAGEIOLATCH_SH** — Slow disk I/O, or buffer pool too small
- **SOS_SCHEDULER_YIELD** — CPU pressure

## Quick Wins

1. **Statistics are stale** — Run \`UPDATE STATISTICS YourTable\` or \`EXEC sp_updatestats\`
2. **Parameter sniffing** — Add \`OPTION (RECOMPILE)\` to force a fresh plan
3. **Implicit conversions** — Match data types in WHERE clauses exactly (don't compare varchar to int)
4. **Covering indexes** — Add included columns to avoid key lookups

This diagnostic process is what you work through in DBA Forge Module 4 — Performance Tuning — where a query that took 2 seconds now takes 40.`,
  },
];

export default function Blog() {
  return (
    <div className="container max-w-screen-xl px-4 py-12 mx-auto">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary border border-primary/20">
            <BookOpen className="h-3.5 w-3.5" />
            DBA Knowledge Base
          </div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
            SQL Server DBA Guides
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Practical guides for real production scenarios. No fluff — just the T-SQL and decision-making that gets you through incidents.
          </p>
        </div>

        <div className="space-y-6">
          {BLOG_POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <div className="group bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {post.category}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">{post.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground/70">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <div className="shrink-0 self-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <ChevronRight className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-card border border-primary/20 rounded-xl p-8 text-center space-y-4">
          <Database className="h-10 w-10 text-primary mx-auto" />
          <h3 className="text-xl font-bold text-foreground">Want hands-on practice?</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            These guides cover the theory. DBA Forge puts you in the scenario — production is down, the CEO is calling, and you have to fix it.
          </p>
          <Link href="/modules">
            <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm">
              Start Training Free
              <ChevronRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
