export interface Lesson {
  id: string;
  title: string;
  type: "scenario" | "lesson" | "code" | "mistakes" | "simulation" | "lab" | "checklist";
  content: string;
  codeExample?: string;
  options?: string[];
  correctOption?: number;
  explanation?: string;
  checklistItems?: string[];
  order: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  isFree: boolean;
  estimatedMinutes: number;
  topics: string[];
  lessons: Lesson[];
}

export const modules: Module[] = [
  {
    id: "fundamentals",
    title: "SQL Server Fundamentals",
    description: "Understand what SQL Server is, its core components, and how data is physically stored. Build the foundation that everything else depends on.",
    order: 1,
    isFree: true,
    estimatedMinutes: 45,
    topics: ["SQL Server architecture", "System databases", "Database files", "Instances", "SSMS basics"],
    lessons: [
      {
        id: "fund-scenario",
        title: "Your First Day as a DBA",
        type: "scenario",
        content: "You just accepted your first DBA role. Your manager hands you access to a SQL Server instance and says: 'Get familiar with it. We have three production databases running on here.' You open SSMS for the first time. Where do you even start?\n\nBefore you can protect, tune, or troubleshoot a SQL Server, you need to know what you are looking at. Let's build that foundation.",
        order: 1,
      },
      {
        id: "fund-lesson-1",
        title: "What is SQL Server?",
        type: "lesson",
        content: "SQL Server is Microsoft's relational database management system (RDBMS). It stores, retrieves, and manages structured data for applications — everything from small business software to enterprise ERP systems.\n\nKey components you need to know:\n\n**Database Engine** — The core service that stores and processes data. This is what DBAs primarily manage.\n\n**SQL Server Agent** — A job scheduling service. Automates backups, maintenance, reports, and any recurring task.\n\n**SQL Server Management Studio (SSMS)** — The GUI tool for connecting to and managing SQL Server instances. Your daily workspace.\n\n**System Databases** — Four special databases SQL Server creates automatically:\n- **master** — Stores server-level configuration, logins, linked servers\n- **model** — Template for new databases (settings here are inherited)\n- **msdb** — SQL Agent jobs, backup history, alerts\n- **tempdb** — Temporary objects and working space. Recreated on every restart.\n\nUnderstand these four and you understand the heartbeat of the server.",
        order: 2,
      },
      {
        id: "fund-code-1",
        title: "Exploring Your Instance",
        type: "code",
        content: "Every DBA should know these essential queries for understanding a SQL Server instance at a glance.",
        codeExample: `-- See all databases on this instance
SELECT name, state_desc, recovery_model_desc, log_reuse_wait_desc
FROM sys.databases
ORDER BY name;

-- Check SQL Server version and edition
SELECT @@VERSION;
SELECT SERVERPROPERTY('Edition') AS Edition,
       SERVERPROPERTY('ProductVersion') AS Version,
       SERVERPROPERTY('ProductLevel') AS SP;

-- List all data and log files for a database
USE YourDatabaseName;
SELECT name, physical_name, type_desc, 
       size * 8 / 1024 AS size_mb,
       max_size
FROM sys.database_files;

-- Check who is connected right now
SELECT session_id, login_name, host_name, program_name, status
FROM sys.dm_exec_sessions
WHERE is_user_process = 1;`,
        order: 3,
      },
      {
        id: "fund-mistakes",
        title: "Common Mistakes: Fundamentals",
        type: "mistakes",
        content: "**Mistake 1: Touching system databases without understanding them**\nNever store application data in master, model, msdb, or tempdb. Especially tempdb — everything in it disappears on restart.\n\n**Mistake 2: Ignoring the SQL Server error log**\nThe error log in SSMS under Management > SQL Server Logs is your first stop when something goes wrong. Most beginners don't know it exists.\n\n**Mistake 3: Confusing an instance with a database**\nOne SQL Server instance can host many databases. Instance = the server service. Database = a specific collection of data. The distinction matters when you discuss access, backups, and configuration.\n\n**Mistake 4: Running production queries without a WHERE clause**\nA single UPDATE without a WHERE clause can corrupt an entire table. Always test with SELECT first. Always.",
        order: 4,
      },
      {
        id: "fund-simulation",
        title: "Scenario: tempdb is Full",
        type: "simulation",
        content: "Your monitoring alert fires at 2am: tempdb is 99% full and the server is throwing errors. What is your first action?",
        options: [
          "Restart the SQL Server service to reset tempdb",
          "Find and kill the session consuming the most tempdb space",
          "Add another data file to tempdb to increase capacity",
          "Delete rows from tempdb manually"
        ],
        correctOption: 1,
        explanation: "The correct first action is to find and kill the session consuming the most tempdb space using sys.dm_db_task_space_usage and sys.dm_exec_sessions. Restarting SQL Server clears tempdb but also kills all active connections — a drastic action you avoid unless nothing else works. Adding a file helps capacity but doesn't solve the root cause. You cannot delete rows from tempdb manually — it is managed by SQL Server internally.",
        order: 5,
      },
      {
        id: "fund-lab",
        title: "Lab: Explore Your Instance",
        type: "lab",
        content: "**Objective:** Get familiar with a SQL Server instance from the DBA perspective.\n\n**Tasks:**\n\n1. Connect to your SQL Server instance using SSMS.\n\n2. Run the version query to identify what version and edition you are running.\n\n3. List all databases and note their recovery models. Which databases are in FULL recovery? Which are in SIMPLE?\n\n4. Expand the System Databases folder in SSMS. Right-click on msdb and open a New Query. Run:\n```sql\nSELECT TOP 10 * FROM msdb.dbo.sysjobs ORDER BY date_created DESC;\n```\nWhat SQL Agent jobs are configured?\n\n5. Check the error log for any warnings. Look under Management > SQL Server Logs > Current.\n\n**Challenge:** Find which database on your instance has the largest log file. Write the query yourself using sys.databases and sys.master_files.",
        order: 6,
      },
      {
        id: "fund-checklist",
        title: "Module 1 DBA Checklist",
        type: "checklist",
        content: "Before moving on, confirm you can do each of these:",
        checklistItems: [
          "Explain the difference between a SQL Server instance and a database",
          "Name the four system databases and describe what each one does",
          "Connect to a SQL Server instance using SSMS",
          "Query sys.databases to see all databases and their recovery models",
          "Locate and read the SQL Server error log",
          "Identify what version and edition of SQL Server is running",
          "Explain what tempdb is and why it resets on restart"
        ],
        order: 7,
      },
      {
        id: "fund-code-2",
        title: "SQL Server Configuration Manager Essentials",
        type: "code",
        content: "SQL Server Configuration Manager controls services and network protocols. DBAs use it when a service won't start, to change ports, or to enable remote connections. Here are the T-SQL equivalents for common configuration tasks.",
        codeExample: `-- Check which SQL Server services are running (from T-SQL)
SELECT servicename, status_desc, startup_type_desc, service_account
FROM sys.dm_server_services;

-- Check current server-level configuration settings
SELECT name, value, value_in_use, description
FROM sys.configurations
ORDER BY name;

-- Enable remote connections (run in SSMS, also requires firewall port 1433 open)
EXEC sys.sp_configure 'show advanced options', 1;
RECONFIGURE;

EXEC sys.sp_configure 'remote access', 1;
RECONFIGURE;

-- Check the maximum server memory setting
SELECT name, value_in_use
FROM sys.configurations
WHERE name = 'max server memory (MB)';

-- Set max server memory (leave ~10% or 4GB for OS)
-- Example: 24GB server → set SQL Server max to 20480 MB
EXEC sys.sp_configure 'max server memory (MB)', 20480;
RECONFIGURE WITH OVERRIDE;

-- Check what port SQL Server is listening on
SELECT local_net_address, local_tcp_port, auth_scheme
FROM sys.dm_exec_connections
WHERE session_id = @@SPID;

-- Find the SQL Server error log location
EXEC sys.xp_readerrorlog 0, 1, N'Logging SQL Server messages', NULL, NULL, N'asc';`,
        order: 8,
      }
    ]
  },
  {
    id: "backups",
    title: "Backups and Restores",
    description: "Learn the three backup types, when to use each, and how to restore databases — including point-in-time recovery. The most critical DBA skill.",
    order: 2,
    isFree: false,
    estimatedMinutes: 60,
    topics: ["Full backups", "Differential backups", "Transaction log backups", "Restore process", "Point-in-time recovery", "Backup verification"],
    lessons: [
      {
        id: "backup-scenario",
        title: "The Midnight Call",
        type: "scenario",
        content: "It's 11:47pm. Your phone rings. It's the on-call developer: 'A developer ran DELETE FROM Orders without a WHERE clause on production. We lost everything. The CEO is asking when it will be back.' You have five minutes to figure out your recovery plan. What do you need to know?\n\n- What backup strategy is in place?\n- When was the last backup taken?\n- What is the recovery model of the database?\n\nIf you cannot answer these three questions right now about your production database, this module is essential.",
        order: 1,
      },
      {
        id: "backup-lesson-1",
        title: "The Three Backup Types",
        type: "lesson",
        content: "SQL Server has three backup types. Understanding when to use each is the core of any backup strategy.\n\n**Full Backup**\nA complete copy of the entire database at a point in time. The foundation of every backup strategy. You cannot restore without at least one full backup.\n- Slowest to take, largest file\n- Completely self-contained\n- Typically scheduled: nightly or weekly\n\n**Differential Backup**\nCaptures everything that has changed since the last full backup. Usually faster and smaller than a full backup, especially early in the backup cycle.\n- Requires a full backup to restore from\n- Grows larger as more changes accumulate since the last full\n- Typically scheduled: every 4-12 hours\n\n**Transaction Log Backup**\nCaptures all transactions since the last log backup. Only possible when the database is in FULL or BULK_LOGGED recovery model.\n- Smallest, fastest backup type\n- Required for point-in-time recovery\n- Typically scheduled: every 15-60 minutes\n- Also truncates the log file (prevents log growth)\n\n**Restore order:** Full → Differential (most recent) → Log backups in sequence",
        order: 2,
      },
      {
        id: "backup-code-1",
        title: "Backup and Restore Commands",
        type: "code",
        content: "These are the core T-SQL commands for every backup operation. Every DBA has these memorized.",
        codeExample: `-- Full backup
BACKUP DATABASE [YourDatabase]
TO DISK = 'C:\\Backups\\YourDatabase_Full.bak'
WITH INIT,           -- Overwrite existing file
     COMPRESSION,    -- Compress the backup
     STATS = 10;     -- Show progress every 10%

-- Differential backup
BACKUP DATABASE [YourDatabase]
TO DISK = 'C:\\Backups\\YourDatabase_Diff.bak'
WITH DIFFERENTIAL,
     INIT,
     COMPRESSION,
     STATS = 10;

-- Transaction log backup (TO DISK does not accept expressions directly -- use a variable)
DECLARE @BackupFile varchar(300);

SET @BackupFile = 'C:\\Backups\\YourDatabase_Log_'
                + CONVERT(varchar, GETDATE(), 112)
                + '.trn';

BACKUP LOG [YourDatabase]
TO DISK = @BackupFile
WITH INIT, COMPRESSION;

-- Restore: Full only (with RECOVERY = make database accessible)
RESTORE DATABASE [YourDatabase]
FROM DISK = 'C:\\Backups\\YourDatabase_Full.bak'
WITH RECOVERY;

-- Restore: Full + Differential + Logs
-- Step 1: Full backup with NORECOVERY (keeps DB in restoring state)
RESTORE DATABASE [YourDatabase]
FROM DISK = 'C:\\Backups\\YourDatabase_Full.bak'
WITH NORECOVERY;

-- Step 2: Most recent differential with NORECOVERY
RESTORE DATABASE [YourDatabase]
FROM DISK = 'C:\\Backups\\YourDatabase_Diff.bak'
WITH NORECOVERY;

-- Step 3: Log backups in order, RECOVERY on the last one
RESTORE LOG [YourDatabase]
FROM DISK = 'C:\\Backups\\YourDatabase_Log1.bak'
WITH NORECOVERY;

RESTORE LOG [YourDatabase]
FROM DISK = 'C:\\Backups\\YourDatabase_Log2.bak'
WITH RECOVERY;  -- Final step: bring database online

-- Point-in-time restore (stop at a specific moment)
RESTORE LOG [YourDatabase]
FROM DISK = 'C:\\Backups\\YourDatabase_Log2.bak'
WITH RECOVERY,
     STOPAT = '2024-03-15 11:43:00';  -- Before the accidental delete`,
        order: 3,
      },
      {
        id: "backup-mistakes",
        title: "Common Mistakes: Backups",
        type: "mistakes",
        content: "**Mistake 1: Thinking a full backup is enough**\nA nightly full backup means up to 24 hours of data loss on failure. Add differential and log backups to reduce that window.\n\n**Mistake 2: Never testing restores**\nA backup you have never tested is not a backup — it is a hope. Restore to a test server monthly. You do not want to discover a corrupt backup during an actual incident.\n\n**Mistake 3: Storing backups on the same drive as the database**\nIf the disk fails, you lose both the database and the backups. Always back up to a separate location — ideally off-server.\n\n**Mistake 4: Ignoring log backups, then being surprised when the log grows**\nIn FULL recovery model, the transaction log never truncates unless you take regular log backups. Without them, the log file grows until the disk is full.\n\n**Mistake 5: Restoring with RECOVERY before applying all log backups**\nOnce you restore with RECOVERY, the database comes online and you cannot apply more log backups. Always use NORECOVERY until the last step.",
        order: 4,
      },
      {
        id: "backup-simulation",
        title: "Scenario: Point-in-Time Recovery",
        type: "simulation",
        content: "A developer accidentally deleted all rows from the Customers table at exactly 14:32:07. Your last full backup was at midnight. You have differential backups every 4 hours and log backups every 15 minutes. What is the correct restore sequence to get back to 14:31:59?",
        options: [
          "Restore the full backup with RECOVERY, then restore the most recent log backup with STOPAT",
          "Restore the full backup with NORECOVERY, restore the 12:00 differential with NORECOVERY, apply log backups up to 14:31:59 with STOPAT on the last log",
          "Restore only the most recent log backup with STOPAT — no need for full or differential",
          "Restore the full backup with RECOVERY and then restore the differential"
        ],
        correctOption: 1,
        explanation: "The correct sequence is: Full backup (NORECOVERY) → Most recent differential before 14:32 which is the 12:00 diff (NORECOVERY) → Apply each log backup in order (NORECOVERY) → Final log backup with RECOVERY and STOPAT = '14:31:59'. You cannot skip the full backup or the differential. You cannot restore a log backup over a database that is already online (RECOVERY).",
        order: 5,
      },
      {
        id: "backup-lab",
        title: "Lab: Build a Restore Strategy",
        type: "lab",
        content: "**Objective:** Practice the full backup and restore cycle on a test database.\n\n**Setup:**\nCreate a test database:\n```sql\nCREATE DATABASE RestoreLab;\nALTER DATABASE RestoreLab SET RECOVERY FULL;\n```\n\n**Tasks:**\n\n1. Take a full backup of RestoreLab to a local folder\n\n2. Insert some test data:\n```sql\nUSE RestoreLab;\nCREATE TABLE Employees (Id INT IDENTITY PRIMARY KEY, Name NVARCHAR(100));\nINSERT INTO Employees VALUES ('Alice'), ('Bob'), ('Charlie');\n```\n\n3. Take a transaction log backup\n\n4. Delete all rows: DELETE FROM Employees\n\n5. Take another transaction log backup immediately after the delete\n\n6. Now restore RestoreLab to the point just before the DELETE using STOPAT\n\n**Challenge:** Verify the restore succeeded by querying the Employees table. Alice, Bob, and Charlie should be back.",
        order: 6,
      },
      {
        id: "backup-checklist",
        title: "Module 2 DBA Checklist",
        type: "checklist",
        content: "Confirm you can do each of these before moving on:",
        checklistItems: [
          "Explain the difference between full, differential, and transaction log backups",
          "Write T-SQL to take a full backup with compression",
          "Write T-SQL to restore a database using full + differential + log sequence",
          "Perform a point-in-time restore using STOPAT",
          "Explain why you use NORECOVERY on all but the final restore step",
          "Describe a sensible backup schedule for a production OLTP database",
          "Verify a backup file is restorable using RESTORE VERIFYONLY"
        ],
        order: 7,
      },
      {
        id: "backup-code-2",
        title: "Auditing Backup History with T-SQL",
        type: "code",
        content: "SQL Server stores all backup history in msdb. These queries let you answer 'when was the last backup?' in seconds — a question you will be asked during every incident.",
        codeExample: `-- Last successful backup for every user database
SELECT 
    d.name AS DatabaseName,
    MAX(b.backup_finish_date) AS LastBackupDate,
    DATEDIFF(HOUR, MAX(b.backup_finish_date), GETDATE()) AS HoursAgo,
    b.type AS BackupType
FROM sys.databases d
LEFT JOIN msdb.dbo.backupset b ON d.name = b.database_name
WHERE d.database_id > 4  -- exclude system databases
GROUP BY d.name, b.type
ORDER BY d.name, b.type;

-- Detailed backup history for a specific database (last 7 days)
SELECT TOP 50
    database_name,
    backup_start_date,
    backup_finish_date,
    CASE type
        WHEN 'D' THEN 'Full'
        WHEN 'I' THEN 'Differential'
        WHEN 'L' THEN 'Log'
    END AS BackupType,
    CAST(backup_size / 1048576.0 AS DECIMAL(10,2)) AS SizeMB,
    CAST(compressed_backup_size / 1048576.0 AS DECIMAL(10,2)) AS CompressedMB,
    physical_device_name
FROM msdb.dbo.backupset bs
JOIN msdb.dbo.backupmediafamily bmf ON bs.media_set_id = bmf.media_set_id
WHERE database_name = 'YourDatabase'
  AND backup_start_date > DATEADD(DAY, -7, GETDATE())
ORDER BY backup_start_date DESC;

-- Find databases with NO backup in the last 24 hours (run in monitoring)
SELECT d.name AS DatabaseName, 'NO BACKUP IN 24 HOURS' AS Alert
FROM sys.databases d
WHERE d.database_id > 4
  AND d.state_desc = 'ONLINE'
  AND NOT EXISTS (
    SELECT 1 FROM msdb.dbo.backupset b
    WHERE b.database_name = d.name
      AND b.type = 'D'
      AND b.backup_finish_date > DATEADD(HOUR, -24, GETDATE())
  );`,
        order: 8,
      }
    ]
  },
  {
    id: "recovery-models",
    title: "Recovery Models",
    description: "Understand FULL, SIMPLE, and BULK_LOGGED recovery models — what they mean for your log file, your backup strategy, and your data loss risk.",
    order: 3,
    isFree: false,
    estimatedMinutes: 40,
    topics: ["FULL recovery", "SIMPLE recovery", "BULK_LOGGED recovery", "Log file management", "Log truncation", "Choosing the right model"],
    lessons: [
      {
        id: "recovery-scenario",
        title: "The 120GB Log File",
        type: "scenario",
        content: "You inherit a production database from a departing DBA. The first thing you notice: the transaction log file is 120GB and the disk is almost full. The database itself is only 8GB. What happened?\n\nThe database is in FULL recovery model — but nobody ever set up log backups. The log has been growing for two years with nowhere to go. This is one of the most common disasters DBAs inherit. Understanding recovery models prevents it.",
        order: 1,
      },
      {
        id: "recovery-lesson-1",
        title: "The Three Recovery Models",
        type: "lesson",
        content: "The recovery model controls what SQL Server records in the transaction log and what backup options are available.\n\n**FULL Recovery Model**\nAll transactions are fully logged. The log never truncates automatically — only log backups truncate it.\n- Enables point-in-time recovery\n- Requires regular log backups to prevent log growth\n- Required for log shipping, Always On, mirroring\n- Use for: any production database where data loss is not acceptable\n\n**SIMPLE Recovery Model**\nSQL Server automatically truncates the log after each checkpoint. No log backups needed — or possible.\n- Log file stays small automatically\n- No point-in-time recovery — you can only restore to the last full or differential backup\n- Use for: development databases, test environments, or databases where you can afford some data loss\n\n**BULK_LOGGED Recovery Model**\nLike FULL, but bulk operations (BULK INSERT, SELECT INTO, index rebuilds) are minimally logged.\n- Reduces log growth during bulk operations\n- Slightly less point-in-time recovery capability during bulk operations\n- Use for: temporarily, during large data loads, then switch back to FULL\n\n**The critical rule:** If you put a database in FULL recovery model, you MUST take regular log backups. Without them, the log grows forever.",
        order: 2,
      },
      {
        id: "recovery-code-1",
        title: "Managing Recovery Models",
        type: "code",
        content: "How to check, change, and manage recovery models and the transaction log.",
        codeExample: `-- Check recovery model for all databases
SELECT name, recovery_model_desc, log_reuse_wait_desc
FROM sys.databases
ORDER BY name;

-- Change recovery model
ALTER DATABASE [YourDatabase] SET RECOVERY FULL;
ALTER DATABASE [YourDatabase] SET RECOVERY SIMPLE;
ALTER DATABASE [YourDatabase] SET RECOVERY BULK_LOGGED;

-- Check log file size and usage
DBCC SQLPERF(LOGSPACE);

-- Check why the log cannot truncate (log_reuse_wait_desc)
SELECT name, log_reuse_wait_desc
FROM sys.databases
WHERE name = 'YourDatabase';
-- Common values:
-- LOG_BACKUP: You need to take a log backup
-- ACTIVE_TRANSACTION: A long-running transaction is holding the log
-- CHECKPOINT: Normal, will resolve shortly

-- Shrink log file AFTER taking a log backup
-- (Only do this if you have a log backup - never as first step)
USE [YourDatabase];
BACKUP LOG [YourDatabase] TO DISK = 'C:\\Backups\\YourDatabase_log.trn';
DBCC SHRINKFILE (YourDatabase_log, 1);  -- Shrink to 1MB minimum

-- Switch to SIMPLE temporarily to allow shrink (emergency only)
-- Then switch BACK to FULL and take a FULL backup immediately
ALTER DATABASE [YourDatabase] SET RECOVERY SIMPLE;
DBCC SHRINKFILE (YourDatabase_log, 1);
ALTER DATABASE [YourDatabase] SET RECOVERY FULL;
BACKUP DATABASE [YourDatabase] TO DISK = 'C:\\Backups\\YourDatabase_Full.bak';`,
        order: 3,
      },
      {
        id: "recovery-mistakes",
        title: "Common Mistakes: Recovery Models",
        type: "mistakes",
        content: "**Mistake 1: Setting FULL recovery and forgetting log backups**\nThe single most common cause of full disks in SQL Server environments. If you switch to FULL recovery, add log backups immediately.\n\n**Mistake 2: Shrinking the log file without a log backup first**\nShrinking clears the reusable space but does not help if log_reuse_wait_desc is LOG_BACKUP. Take the log backup first, then shrink.\n\n**Mistake 3: Leaving production databases in SIMPLE recovery**\nSIMPLE means no point-in-time recovery. If something goes wrong, you can only restore to the last full or differential backup — potentially hours of data loss.\n\n**Mistake 4: Not taking a full backup after changing recovery models**\nIf you switch from SIMPLE to FULL, you must take a full backup immediately. Without it, the log chain is broken and you cannot do point-in-time recovery.\n\n**Mistake 5: Shrinking database files repeatedly**\nShrinking causes index fragmentation. Only shrink when genuinely necessary — not as routine maintenance.",
        order: 4,
      },
      {
        id: "recovery-simulation",
        title: "Scenario: Log File Full",
        type: "simulation",
        content: "Your database is in FULL recovery model. The transaction log file is 98% full and growing. log_reuse_wait_desc shows LOG_BACKUP. The last log backup was three days ago. What do you do FIRST?",
        options: [
          "Shrink the log file using DBCC SHRINKFILE",
          "Switch to SIMPLE recovery model to auto-truncate the log",
          "Take a transaction log backup immediately",
          "Add more disk space to the log drive"
        ],
        correctOption: 2,
        explanation: "Take a log backup immediately. The log cannot truncate because log_reuse_wait_desc = LOG_BACKUP — it is waiting for a log backup before it can reuse space. Taking a log backup allows SQL Server to mark the inactive portion of the log as reusable. Shrinking first would not help — the log is full of active entries. Switching to SIMPLE loses your log chain and point-in-time recovery capability. Adding disk space buys time but does not solve the root cause.",
        order: 5,
      },
      {
        id: "recovery-lab",
        title: "Lab: Investigate a Runaway Log",
        type: "lab",
        content: "**Objective:** Diagnose and resolve a growing transaction log.\n\n**Setup:**\n```sql\nCREATE DATABASE LogLab;\nALTER DATABASE LogLab SET RECOVERY FULL;\n```\n\n**Tasks:**\n\n1. Check the current log usage with DBCC SQLPERF(LOGSPACE). Note the starting size.\n\n2. Run several large inserts to grow the log:\n```sql\nUSE LogLab;\nCREATE TABLE BigTable (Id INT IDENTITY, Data NVARCHAR(MAX));\nGO\nINSERT INTO BigTable (Data)\nSELECT REPLICATE('X', 1000) FROM sys.objects CROSS JOIN sys.objects;\nGO 5\n```\n\n3. Check log usage again. Note how much it grew.\n\n4. Check log_reuse_wait_desc for LogLab — what is it waiting for?\n\n5. Take a transaction log backup.\n\n6. Check log usage again. Did the used percentage drop?\n\n7. Shrink the log file.\n\n**Challenge:** Explain in writing why you had to take the log backup before shrinking was effective.",
        order: 6,
      },
      {
        id: "recovery-checklist",
        title: "Module 3 DBA Checklist",
        type: "checklist",
        content: "Confirm you can do each of these:",
        checklistItems: [
          "Explain the three recovery models and when to use each",
          "Query sys.databases to see the recovery model and log_reuse_wait_desc",
          "Change a database's recovery model using T-SQL",
          "Diagnose a full transaction log using log_reuse_wait_desc",
          "Resolve a full log in FULL recovery model without losing the log chain",
          "Explain why shrinking is not the first step when the log is full",
          "Explain what happens to log backups if you switch from SIMPLE to FULL without taking a full backup"
        ],
        order: 7,
      },
      {
        id: "recovery-code-2",
        title: "Monitoring Transaction Log Health",
        type: "code",
        content: "These queries give you a real-time picture of log file usage, Virtual Log Files (VLFs), and what is preventing log truncation — essential for preventing 'log is full' emergencies before they happen.",
        codeExample: `-- Check log file usage for all databases right now
SELECT 
    d.name AS DatabaseName,
    d.recovery_model_desc AS RecoveryModel,
    df.name AS LogFileName,
    df.size * 8 / 1024 AS LogSizeMB,
    FILEPROPERTY(df.name, 'SpaceUsed') * 8 / 1024 AS UsedMB,
    100 - CAST(FILEPROPERTY(df.name, 'SpaceUsed') AS FLOAT) / df.size * 100 AS FreePercent,
    d.log_reuse_wait_desc AS WhyLogCantTruncate
FROM sys.databases d
JOIN sys.master_files df ON d.database_id = df.database_id
WHERE df.type_desc = 'LOG'
ORDER BY LogSizeMB DESC;

-- Check VLF count for a database (high VLF count slows recovery and log reads)
-- Run this in context of each database
DBCC LOGINFO;
-- VLFs > 1000 is a red flag. A healthy log has < 100 VLFs.

-- How to fix VLF fragmentation (only do during maintenance window):
-- 1. Shrink log to near-zero (temporarily)
DBCC SHRINKFILE (YourDatabase_log, 1);
-- 2. Grow log back to target size in ONE step (avoids many small autogrowth VLFs)
ALTER DATABASE [YourDatabase]
    MODIFY FILE (NAME = YourDatabase_log, SIZE = 4096MB);

-- Monitor log backup frequency: are log backups keeping up with log growth?
SELECT TOP 20
    database_name,
    backup_finish_date,
    CAST(backup_size / 1048576.0 AS DECIMAL(10,2)) AS SizeMB
FROM msdb.dbo.backupset
WHERE type = 'L'
  AND database_name = 'YourDatabase'
ORDER BY backup_finish_date DESC;`,
        order: 8,
      }
    ]
  },
  {
    id: "security",
    title: "Security and Permissions",
    description: "Master SQL Server security — logins, users, roles, and the principle of least privilege. Learn to grant access correctly and audit who can do what.",
    order: 4,
    isFree: false,
    estimatedMinutes: 50,
    topics: ["Logins vs users", "Server roles", "Database roles", "GRANT DENY REVOKE", "Schema ownership", "Security auditing"],
    lessons: [
      {
        id: "security-scenario",
        title: "The Overprivileged Consultant",
        type: "scenario",
        content: "An external consultant needed temporary access to run reports on your production database. Someone gave them sysadmin role. They left the company three months ago, but the login was never removed. You are now doing a security review and find it.\n\nThis is not unusual — it happens at most companies. Fixing it is step one. Understanding how to prevent it is what this module is about.",
        order: 1,
      },
      {
        id: "security-lesson-1",
        title: "Logins vs Users: The Most Confused Concept",
        type: "lesson",
        content: "The distinction between logins and users confuses nearly every SQL Server beginner. Here is the model:\n\n**Login** — A server-level principal. Lives in the master database. How you authenticate to the SQL Server instance.\n- SQL Server Login: username + password stored in SQL Server\n- Windows Login: authenticates via Windows/Active Directory (preferred in enterprise)\n\n**User** — A database-level principal. Lives inside a specific database. How you get permissions within that database.\n- Each database has its own users\n- A login must be mapped to a user in each database it needs access to\n\n**The relationship:** Login → mapped to → User in Database\n\nA login without a user in a database cannot access that database. A user without a login cannot authenticate to the server.\n\n**Server Roles** — Predefined groups of server-level permissions:\n- sysadmin: unrestricted access to everything. Give this to almost nobody.\n- dbcreator: can create databases\n- securityadmin: can manage logins\n- bulkadmin: can run BULK INSERT\n\n**Database Roles** — Predefined groups of database-level permissions:\n- db_owner: full control of a database\n- db_datareader: SELECT on all tables\n- db_datawriter: INSERT, UPDATE, DELETE on all tables\n- db_ddladmin: can run DDL (CREATE TABLE, ALTER, DROP)\n- public: every user is a member — be careful what you grant here",
        order: 2,
      },
      {
        id: "security-code-1",
        title: "Managing Logins, Users, and Permissions",
        type: "code",
        content: "The essential commands for creating and managing SQL Server security principals.",
        codeExample: `-- Create a SQL Server login
CREATE LOGIN AppUser WITH PASSWORD = 'Str0ngP@ssword!';

-- Create a Windows login
CREATE LOGIN [DOMAIN\\username] FROM WINDOWS;

-- Create a user in a database and map it to a login
USE [YourDatabase];
CREATE USER AppUser FOR LOGIN AppUser;

-- Add user to a database role
ALTER ROLE db_datareader ADD MEMBER AppUser;
ALTER ROLE db_datawriter ADD MEMBER AppUser;

-- Grant specific permissions (more granular control)
GRANT SELECT ON dbo.Orders TO AppUser;
GRANT EXECUTE ON dbo.GetOrderById TO AppUser;

-- Deny a specific permission (overrides GRANT)
DENY DELETE ON dbo.Orders TO AppUser;

-- Revoke a permission
REVOKE SELECT ON dbo.Products FROM AppUser;

-- See effective permissions for a user
EXECUTE AS USER = 'AppUser';
SELECT * FROM fn_my_permissions(NULL, 'DATABASE');
REVERT;

-- Audit: Find all logins and their server roles
SELECT sp.name AS LoginName, sp.type_desc, srm.role_principal_id,
       spr.name AS ServerRole
FROM sys.server_principals sp
LEFT JOIN sys.server_role_members srm ON sp.principal_id = srm.member_principal_id
LEFT JOIN sys.server_principals spr ON srm.role_principal_id = spr.principal_id
WHERE sp.type IN ('S', 'U', 'G')
ORDER BY sp.name;

-- Audit: Find all database users and their roles
SELECT dp.name AS UserName, dp.type_desc, drm.role_principal_id,
       dpr.name AS DatabaseRole
FROM sys.database_principals dp
LEFT JOIN sys.database_role_members drm ON dp.principal_id = drm.member_principal_id
LEFT JOIN sys.database_principals dpr ON drm.role_principal_id = dpr.principal_id
WHERE dp.type IN ('S', 'U', 'G')
ORDER BY dp.name;

-- Disable a login without deleting it (useful for offboarding)
ALTER LOGIN AppUser DISABLE;

-- Drop a user and login (offboarding)
USE [YourDatabase];
DROP USER AppUser;
USE [master];
DROP LOGIN AppUser;`,
        order: 3,
      },
      {
        id: "security-mistakes",
        title: "Common Mistakes: Security",
        type: "mistakes",
        content: "**Mistake 1: Giving developers sysadmin**\nEver. It is never necessary for application access. db_owner is already too much for most developers. Use least privilege: grant only what is needed.\n\n**Mistake 2: Using sa account for application connections**\nThe sa account is the most targeted SQL Server account. Disable it. Create a dedicated application login with only the permissions the app needs.\n\n**Mistake 3: Granting permissions to individual users instead of roles**\nWhen that user leaves, you chase down every permission grant across every database. Use roles. Add users to roles. Remove users from roles when they leave.\n\n**Mistake 4: Never auditing permissions**\nLogins accumulate over years. The consultant who left, the developer who moved teams, the service account for a decommissioned app — they all stay in SQL Server until someone audits. Schedule quarterly access reviews.\n\n**Mistake 5: Confusing deny and revoke**\nDENY explicitly blocks a permission and overrides any GRANT — even if the user is in a role that has that permission. REVOKE removes a previously granted or denied permission. If you want to be sure someone cannot do something, use DENY.",
        order: 4,
      },
      {
        id: "security-simulation",
        title: "Scenario: Minimal Access for an App",
        type: "simulation",
        content: "A new web application needs to read from three tables and execute two stored procedures in your database. What is the most appropriate permission setup?",
        options: [
          "Add the application login to the sysadmin server role",
          "Add the application user to the db_owner database role",
          "Grant SELECT on the three tables and EXECUTE on the two stored procedures to a dedicated application user",
          "Add the application user to db_datareader for broad read access"
        ],
        correctOption: 2,
        explanation: "The correct answer is to grant only what is needed: SELECT on the specific three tables and EXECUTE on the two stored procedures. This is the principle of least privilege. sysadmin and db_owner are both vastly over-privileged — if the application is compromised, an attacker would have full server or database control. db_datareader grants SELECT on all tables, which gives the application access to data it should not see. Specific grants are more work upfront but dramatically reduce the attack surface.",
        order: 5,
      },
      {
        id: "security-lab",
        title: "Lab: Set Up Application Access",
        type: "lab",
        content: "**Objective:** Create a properly secured login for a read-only reporting application.\n\n**Tasks:**\n\n1. Create a database for this exercise:\n```sql\nCREATE DATABASE SecurityLab;\n```\n\n2. Create some test tables:\n```sql\nUSE SecurityLab;\nCREATE TABLE Customers (Id INT PRIMARY KEY, Name NVARCHAR(100));\nCREATE TABLE Orders (Id INT PRIMARY KEY, CustomerId INT, Amount DECIMAL(10,2));\nCREATE TABLE SensitiveData (Id INT PRIMARY KEY, SocialSecurityNo NVARCHAR(20));\nINSERT INTO Customers VALUES (1, 'Acme Corp'), (2, 'Global Inc');\nINSERT INTO Orders VALUES (1, 1, 500.00), (2, 2, 1200.00);\n```\n\n3. Create a login and user for a reporting application. It should be able to read from Customers and Orders only — NOT from SensitiveData.\n\n4. Test the permissions: use EXECUTE AS USER to confirm the user can read Customers and Orders but gets a permission denied error on SensitiveData.\n\n5. Now create a second user for an admin application that needs to INSERT and UPDATE Orders but still cannot access SensitiveData.\n\n**Challenge:** Write a query that shows all users in SecurityLab and their effective permissions on each table.",
        order: 6,
      },
      {
        id: "security-checklist",
        title: "Module 4 DBA Checklist",
        type: "checklist",
        content: "Confirm you can do each of these:",
        checklistItems: [
          "Explain the difference between a login and a database user",
          "Create a SQL Server login and map it to a database user",
          "Add a user to a database role",
          "Grant specific permissions using GRANT on individual objects",
          "Use DENY to explicitly block a permission",
          "Audit all logins and their server roles using sys.server_principals",
          "Audit all database users and their database roles",
          "Disable a login without deleting it",
          "Explain the principle of least privilege and why sa should be disabled"
        ],
        order: 7,
      },
      {
        id: "security-code-2",
        title: "Permission Audit: Who Can Do What?",
        type: "code",
        content: "A DBA is regularly asked 'does user X have access to Y?' and 'who has access to this database?' These queries answer those questions fast, without guessing.",
        codeExample: `-- Full permission audit: all permissions for all users in current database
SELECT 
    dp.name AS PrincipalName,
    dp.type_desc AS PrincipalType,
    p.state_desc AS PermissionState,
    p.permission_name AS Permission,
    COALESCE(o.name, 'DATABASE') AS ObjectName,
    COALESCE(o.type_desc, '') AS ObjectType
FROM sys.database_permissions p
JOIN sys.database_principals dp ON p.grantee_principal_id = dp.principal_id
LEFT JOIN sys.objects o ON p.major_id = o.object_id
WHERE dp.type NOT IN ('R')  -- exclude roles, show only users
ORDER BY dp.name, o.name;

-- Who is a member of the sysadmin role? (run in master)
SELECT sp.name AS LoginName, sp.type_desc, sp.is_disabled
FROM sys.server_principals sp
JOIN sys.server_role_members srm ON sp.principal_id = srm.member_principal_id
JOIN sys.server_principals r ON srm.role_principal_id = r.principal_id
WHERE r.name = 'sysadmin'
ORDER BY sp.name;

-- Who can access a specific database?
SELECT dp.name AS UserName, dp.type_desc, 
       dp.default_schema_name,
       dp.create_date
FROM sys.database_principals dp
WHERE dp.type IN ('S','U','G')  -- SQL, Windows, Group logins
  AND dp.name NOT IN ('dbo','guest','INFORMATION_SCHEMA','sys')
ORDER BY dp.name;

-- Check if a specific login exists and what databases they can access
SELECT 
    sp.name AS LoginName,
    sp.is_disabled,
    sp.type_desc,
    dp.name AS DatabaseUser,
    d.name AS DatabaseName
FROM sys.server_principals sp
JOIN sys.databases d ON 1=1
LEFT JOIN sys.database_principals dp ON dp.sid = sp.sid
WHERE sp.name = 'AppUser'  -- replace with login name
ORDER BY d.name;

-- Orphaned users (user exists in database but login was deleted)
EXEC sp_change_users_login 'Report';`,
        order: 8,
      }
    ]
  },
  {
    id: "sql-agent",
    title: "SQL Agent Jobs",
    description: "Automate DBA work with SQL Server Agent — create jobs, schedule maintenance, configure alerts, and build the automated routines that define a mature database environment.",
    order: 5,
    isFree: false,
    estimatedMinutes: 45,
    topics: ["SQL Agent architecture", "Creating jobs and steps", "Scheduling", "Operators and alerts", "Maintenance plans", "Job history and monitoring"],
    lessons: [
      {
        id: "agent-scenario",
        title: "The Forgotten Backup",
        type: "scenario",
        content: "Your predecessor manually ran backups every morning — when he remembered. Some days he was sick. Some days he forgot. One morning you need to restore from last night and discover the last backup was four days ago.\n\nSQL Server Agent exists precisely to remove humans from routine tasks. If a DBA has to manually run a backup, eventually it will not get run. This module is about building automation that runs whether or not you are there.",
        order: 1,
      },
      {
        id: "agent-lesson-1",
        title: "SQL Server Agent Architecture",
        type: "lesson",
        content: "SQL Server Agent is a Windows service that runs separately from the SQL Server Database Engine. It manages jobs, schedules, alerts, and notifications.\n\n**Key concepts:**\n\n**Job** — A named collection of one or more steps that Agent executes on a schedule or on demand.\n\n**Job Step** — A single unit of work within a job. Steps can be T-SQL scripts, PowerShell commands, SSIS packages, or operating system commands. Each step can succeed or fail independently.\n\n**Schedule** — Defines when a job runs. Jobs can have multiple schedules (run daily at 2am AND on the first of every month).\n\n**Operator** — A person or group that receives notifications. Defined with an email address. Jobs and alerts can notify operators on success, failure, or completion.\n\n**Alert** — A response to a SQL Server error, performance condition, or WMI event. Alerts can run a job or notify an operator automatically.\n\n**Where jobs live:** msdb database. All job definitions, schedules, and history are stored in msdb.dbo.sysjobs, msdb.dbo.sysjobsteps, msdb.dbo.sysjobschedules.\n\n**Important:** SQL Server Agent must be running as a Windows service for any jobs to execute. Check it under SQL Server Configuration Manager or in SSMS under SQL Server Agent.",
        order: 2,
      },
      {
        id: "agent-code-1",
        title: "Creating Jobs with T-SQL",
        type: "code",
        content: "While SSMS has a GUI for creating jobs, knowing the T-SQL is essential for scripting, documentation, and deploying jobs across environments.",
        codeExample: `-- Create a nightly full backup job

-- Step 1: Create the job
EXEC msdb.dbo.sp_add_job
    @job_name = N'Nightly Full Backup - Production',
    @description = N'Takes a full backup of all production databases nightly',
    @category_name = N'Database Maintenance';

-- Step 2: Add a job step (the actual work)
EXEC msdb.dbo.sp_add_jobstep
    @job_name = N'Nightly Full Backup - Production',
    @step_name = N'Backup All User Databases',
    @command = N'
DECLARE @DatabaseName NVARCHAR(128);
DECLARE @BackupPath NVARCHAR(500);
DECLARE @Timestamp NVARCHAR(20) = CONVERT(NVARCHAR, GETDATE(), 112);

DECLARE db_cursor CURSOR FOR
    SELECT name FROM sys.databases
    WHERE state_desc = ''ONLINE''
    AND name NOT IN (''tempdb'', ''model'')
    AND source_database_id IS NULL;  -- exclude snapshots

OPEN db_cursor;
FETCH NEXT FROM db_cursor INTO @DatabaseName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @BackupPath = ''C:\Backups\'' + @DatabaseName + ''_Full_'' + @Timestamp + ''.bak'';
    
    BACKUP DATABASE @DatabaseName
    TO DISK = @BackupPath
    WITH INIT, COMPRESSION, STATS = 10;
    
    FETCH NEXT FROM db_cursor INTO @DatabaseName;
END

CLOSE db_cursor;
DEALLOCATE db_cursor;
',
    @subsystem = N'TSQL',
    @on_success_action = 1,  -- 1 = Quit with success
    @on_fail_action = 2;     -- 2 = Quit with failure

-- Step 3: Create a schedule (nightly at 1:00 AM)
EXEC msdb.dbo.sp_add_schedule
    @schedule_name = N'Nightly 1AM',
    @freq_type = 4,        -- 4 = Daily
    @freq_interval = 1,    -- Every 1 day
    @active_start_time = 10000;  -- 01:00:00 AM

-- Step 4: Attach the schedule to the job
EXEC msdb.dbo.sp_attach_schedule
    @job_name = N'Nightly Full Backup - Production',
    @schedule_name = N'Nightly 1AM';

-- Step 5: Assign to the local server
EXEC msdb.dbo.sp_add_jobserver
    @job_name = N'Nightly Full Backup - Production';

-- View all jobs and their last run status
SELECT j.name, j.enabled,
       jh.run_date, jh.run_time,
       CASE jh.run_status
           WHEN 0 THEN 'Failed'
           WHEN 1 THEN 'Succeeded'
           WHEN 2 THEN 'Retry'
           WHEN 3 THEN 'Canceled'
       END AS LastRunStatus,
       jh.message
FROM msdb.dbo.sysjobs j
LEFT JOIN msdb.dbo.sysjobhistory jh 
    ON j.job_id = jh.job_id AND jh.step_id = 0
ORDER BY j.name;`,
        order: 3,
      },
      {
        id: "agent-mistakes",
        title: "Common Mistakes: SQL Agent",
        type: "mistakes",
        content: "**Mistake 1: SQL Server Agent is stopped**\nJobs do not run if Agent is not running. Check Agent status after server restarts, and set it to start automatically in SQL Server Configuration Manager.\n\n**Mistake 2: No notification on job failure**\nJobs fail silently unless you configure operators and failure notifications. Always configure email alerts for failed jobs — especially backups.\n\n**Mistake 3: Job steps that run as sysadmin unnecessarily**\nEach job step runs under a proxy account or the SQL Agent service account. Use a dedicated, least-privilege proxy account for job steps that access external resources.\n\n**Mistake 4: Not monitoring job history**\nSQL Agent stores history but truncates it by default (1000 rows). For important jobs, review history weekly. Set up alerts for failures rather than manually checking.\n\n**Mistake 5: Scheduling all jobs at the same time**\nIf every maintenance job runs at 2:00 AM, they compete for resources. Stagger maintenance: backups at 1 AM, index maintenance at 2 AM, integrity checks at 3 AM.",
        order: 4,
      },
      {
        id: "agent-simulation",
        title: "Scenario: Failed Backup Job",
        type: "simulation",
        content: "Your nightly backup job has been failing silently for the past week. You only discover this when a developer asks for a restore and you realize the last successful backup was 7 days ago. What should you set up to prevent this happening again?",
        options: [
          "Check the job history every morning manually",
          "Configure an operator with an email address and set the job to notify the operator on failure",
          "Run the backup job every hour so you notice sooner when it fails",
          "Switch to manual backups so you always know when they run"
        ],
        correctOption: 1,
        explanation: "Configure an operator (email address) and set the job to send an email notification on failure. This is the professional answer: automation that tells you when it breaks. Manually checking every morning is exactly the kind of human-dependent process that fails eventually. Running hourly does not solve the alerting problem. Manual backups re-introduce the problem this module exists to solve.",
        order: 5,
      },
      {
        id: "agent-lab",
        title: "Lab: Automate Your Backup Strategy",
        type: "lab",
        content: "**Objective:** Create a complete automated backup strategy using SQL Agent jobs.\n\n**Tasks:**\n\n1. Create three SQL Agent jobs:\n   - **Full Backup Job** — runs nightly at 1:00 AM, backs up all user databases\n   - **Differential Backup Job** — runs every 6 hours (7 AM, 1 PM, 7 PM), skips the 1 AM slot\n   - **Log Backup Job** — runs every 30 minutes, for databases in FULL recovery\n\n2. Create an operator with your email address (or a dummy address for practice).\n\n3. Configure all three jobs to notify the operator on failure.\n\n4. Manually run the Full Backup job and verify it succeeds by checking the job history.\n\n5. Verify the backup file exists in your backup folder.\n\n**Challenge:** Write a T-SQL query that checks if any of your jobs failed in the last 24 hours and returns the error message. This is what your monitoring query would look like.",
        order: 6,
      },
      {
        id: "agent-checklist",
        title: "Module 5 DBA Checklist",
        type: "checklist",
        content: "Confirm you can do each of these:",
        checklistItems: [
          "Explain the relationship between jobs, steps, schedules, and operators",
          "Check whether SQL Server Agent is running",
          "Create a SQL Agent job with T-SQL using sp_add_job and sp_add_jobstep",
          "Create a schedule and attach it to a job",
          "Configure an operator and set up failure notifications",
          "Check job history to see the last run status and error messages",
          "Explain why jobs should be staggered rather than all run at the same time"
        ],
        order: 7,
      },
      {
        id: "agent-code-2",
        title: "Database Mail: Email Alerts That Actually Work",
        type: "code",
        content: "Database Mail is SQL Server's built-in email system. Set it up once and every job failure, alert, and notification flows to your inbox automatically. Here is the complete setup.",
        codeExample: `-- Step 1: Enable Database Mail (if not already enabled)
EXEC sp_configure 'show advanced options', 1;
RECONFIGURE;
EXEC sp_configure 'Database Mail XPs', 1;
RECONFIGURE;

-- Step 2: Create a Database Mail account
EXEC msdb.dbo.sysmail_add_account_sp
    @account_name = 'DBA Alerts Account',
    @description = 'SQL Server DBA Alert Account',
    @email_address = 'dba-alerts@yourcompany.com',
    @display_name = 'SQL Server DBA Alerts',
    @mailserver_name = 'smtp.yourcompany.com',
    @port = 25,
    @enable_ssl = 0;
    -- For Office 365: @port = 587, @enable_ssl = 1, @username, @password

-- Step 3: Create a Database Mail profile and associate the account
EXEC msdb.dbo.sysmail_add_profile_sp
    @profile_name = 'DBA Alert Profile',
    @description = 'Profile for DBA job alerts';

EXEC msdb.dbo.sysmail_add_profileaccount_sp
    @profile_name = 'DBA Alert Profile',
    @account_name = 'DBA Alerts Account',
    @sequence_number = 1;

-- Step 4: Make profile the default
EXEC msdb.dbo.sysmail_add_principalprofile_sp
    @profile_name = 'DBA Alert Profile',
    @principal_name = 'public',
    @is_default = 1;

-- Step 5: Send a test email
EXEC msdb.dbo.sp_send_dbmail
    @profile_name = 'DBA Alert Profile',
    @recipients = 'you@yourcompany.com',
    @subject = 'Database Mail Test',
    @body = 'Database Mail is configured and working.';

-- Check Database Mail queue and sent items
SELECT TOP 10 * FROM msdb.dbo.sysmail_sentitems ORDER BY sent_date DESC;
SELECT TOP 10 * FROM msdb.dbo.sysmail_faileditems ORDER BY last_mod_date DESC;

-- Create an operator (recipient for job failure alerts)
EXEC msdb.dbo.sp_add_operator
    @name = N'DBA Team',
    @enabled = 1,
    @email_address = N'dba@yourcompany.com';`,
        order: 8,
      }
    ]
  },
  {
    id: "daily-operations",
    title: "Daily DBA Operations",
    description: "Learn the actual rhythm of a production SQL Server day shift: handoff, monitoring, incident triage, access requests, change control, capacity planning, and evidence-based handoff.",
    order: 6,
    isFree: false,
    estimatedMinutes: 150,
    topics: [
      "Shift handoff and ticket triage",
      "Morning health checks",
      "Always On monitoring",
      "Backup failure investigation",
      "SQL Agent dependencies",
      "Blocking and session termination",
      "Production access requests",
      "Change implementation",
      "Capacity forecasting",
      "Operational documentation"
    ],
    lessons: [
      {
        id: "daily-ops-scenario",
        title: "Your First Production Day Shift",
        type: "scenario",
        content: "It is 6:00 AM. The night DBA hands you a failed transaction-log backup, one recovered Always On warning, and a quiet production estate. During the day, new tickets will arrive from monitoring, application support, developers, and change management.\n\nA working DBA does not solve everything with one clever query. You must establish priority, gather evidence, communicate with the correct owner, protect recoverability and availability, validate every change, update tickets, and leave a handoff the next DBA can trust.\n\nThis module teaches every responsibility used in ForgeDBA's Guided Scenarios and Live Shift Simulator. Complete the lessons and lab before treating the simulator as an assessment.",
        order: 1,
      },
      {
        id: "daily-ops-shift-control",
        title: "How a DBA Controls the Shift",
        type: "lesson",
        content: "A production shift starts with situational awareness, not random clicking.\n\n**1. Read the handoff**\nIdentify unresolved incidents, failed jobs, degraded replicas, planned changes, temporary access, and work that has a deadline. Do not assume the previous shift resolved an item just because the alert is old.\n\n**2. Establish the operational picture**\nReview monitoring, database state, backup freshness, SQL Agent failures, Always On health, disk capacity, and active critical tickets. Confirm current state with SQL Server evidence.\n\n**3. Triage by risk and impact**\n- P1: active outage, data-loss risk, or severe degradation\n- P2: important failure or request with limited current impact\n- P3: planned or preventative work\n\nRecoverability failures may be P1 even when users see no outage. A failed log backup silently increases the recovery-point risk.\n\n**4. Work through ownership**\nThe DBA owns the database diagnosis and coordination, but not every underlying system. Storage belongs to the storage or Wintel/VM team, network paths to the network team, application behavior to the application team, and vendor files to the integration owner. Escalate with evidence, impact, and a requested action.\n\n**5. Close the loop**\nEvery item ends with validation and documentation. Record what failed, what evidence you collected, what changed, how you proved recovery, and any remaining owner or deadline.",
        order: 2,
      },
      {
        id: "daily-ops-health",
        title: "Morning Health Checks and Always On",
        type: "lesson",
        content: "A morning health check answers one question: can the production estate safely begin the business day?\n\nReview these areas in a consistent order:\n- SQL Server service and instance availability\n- database state and recovery status\n- backup freshness and failed backup jobs\n- SQL Agent failures since the previous handoff\n- Always On replica connectivity, synchronization, and health\n- blocking, long-running sessions, and abnormal waits\n- data, log, tempdb, and backup-volume capacity\n- error-log entries that require follow-up\n\n**Always On interpretation**\nSYNCHRONIZED and HEALTHY indicate that a synchronous replica is caught up and ready for expected failover behavior. SYNCHRONIZING may be normal for asynchronous replicas, but a new or prolonged change requires investigation. NOT SYNCHRONIZING, DISCONNECTED, or NOT HEALTHY needs immediate attention.\n\nA warning that recovered is not ignored. Record its start and end time, verify present health, look for repetition, and continue monitoring. Do not force a failover merely to prove that the secondary works. Failover testing belongs to an approved change with application owners and a rollback plan.",
        codeExample: `-- Database state and recovery model
SELECT name, state_desc, recovery_model_desc, log_reuse_wait_desc
FROM sys.databases
ORDER BY name;

-- Always On replica and database synchronization health
SELECT
    ag.name AS AvailabilityGroup,
    ar.replica_server_name,
    ars.role_desc,
    ars.connected_state_desc,
    drs.database_id,
    DB_NAME(drs.database_id) AS DatabaseName,
    drs.synchronization_state_desc,
    drs.synchronization_health_desc
FROM sys.availability_groups ag
JOIN sys.availability_replicas ar
  ON ag.group_id = ar.group_id
JOIN sys.dm_hadr_availability_replica_states ars
  ON ar.replica_id = ars.replica_id
LEFT JOIN sys.dm_hadr_database_replica_states drs
  ON ar.replica_id = drs.replica_id
ORDER BY ag.name, ar.replica_server_name, DatabaseName;

-- SQL Server services
SELECT servicename, status_desc, startup_type_desc, service_account
FROM sys.dm_server_services;`,
        order: 3,
      },
      {
        id: "daily-ops-backup-112",
        title: "Failed Log Backup and OS Error 112",
        type: "lesson",
        content: "Windows operating-system error 112 means: **There is not enough space on the disk.**\n\nWhen SQL Server reports error 112 during a backup, distinguish between the database files and the backup destination. The database may remain online while the backup share or backup volume is full. Restarting SQL Server does not create storage space and adds unnecessary user impact.\n\n**Investigation sequence**\n1. Read the job or backup error and identify the exact destination path.\n2. Check free space on the destination drive or share.\n3. Review backup history to identify the last successful full, differential, and log backups.\n4. Confirm the recovery model and current recoverability risk.\n5. Engage the storage/Wintel owner or follow the approved retention runbook. Never delete unknown files simply to make room.\n6. Rerun the failed log backup after space is available.\n7. Verify success in msdb and confirm subsequent log backups continue normally.\n8. Document the failure window and corrective action.\n\nA successful rerun preserves the log-backup sequence. If log backups were missed for an extended period, calculate the increased recovery-point exposure and communicate it.",
        codeExample: `-- Local fixed-drive free space in MB
EXEC master.dbo.xp_fixeddrives;

-- Detailed backup history and destination
SELECT TOP (50)
    bs.database_name,
    bs.backup_start_date,
    bs.backup_finish_date,
    CASE bs.type WHEN 'D' THEN 'Full' WHEN 'I' THEN 'Differential' WHEN 'L' THEN 'Log' END AS BackupType,
    bmf.physical_device_name,
    CAST(bs.backup_size / 1048576.0 AS decimal(12,2)) AS BackupSizeMB
FROM msdb.dbo.backupset bs
JOIN msdb.dbo.backupmediafamily bmf
  ON bs.media_set_id = bmf.media_set_id
WHERE bs.database_name = 'FIN-PROD'
ORDER BY bs.backup_finish_date DESC;

-- Rerun only after destination capacity is restored
BACKUP LOG [FIN-PROD]
TO DISK = 'B:\\SQLBackups\\FIN-PROD_Log.trn'
WITH COMPRESSION, CHECKSUM, STATS = 10;`,
        order: 4,
      },
      {
        id: "daily-ops-agent-dependencies",
        title: "SQL Agent Failures and External Dependencies",
        type: "lesson",
        content: "A failed SQL Agent job is not automatically a SQL Server problem. Jobs often depend on files, network shares, credentials, APIs, SSIS packages, or upstream applications.\n\nStart with job history. Identify the exact failed step, message, start time, retry behavior, and whether earlier steps committed data. Then determine ownership.\n\nFor a missing vendor file:\n1. Verify the configured path and expected filename.\n2. Confirm whether the file exists and whether the Agent service account can access it.\n3. Check the upstream delivery dashboard or contact the integration owner.\n4. Do not repeatedly rerun a job while its dependency is missing. Repeated retries create noise and can duplicate work if an earlier step is not idempotent.\n5. Rerun after the dependency is available.\n6. Validate the job result using row counts, control totals, timestamps, and downstream confirmation.\n\nThe ticket should clearly distinguish the failed SQL Agent step from the actual root cause: delayed upstream delivery, permission failure, network problem, or job logic.",
        codeExample: `-- Recent SQL Agent job outcomes
SELECT TOP (100)
    j.name AS JobName,
    h.step_id,
    h.step_name,
    h.run_status,
    h.run_date,
    h.run_time,
    h.message
FROM msdb.dbo.sysjobhistory h
JOIN msdb.dbo.sysjobs j ON h.job_id = j.job_id
WHERE j.name = 'CustomerImport'
ORDER BY h.instance_id DESC;

-- Start the job after its dependency is available
EXEC msdb.dbo.sp_start_job @job_name = N'CustomerImport';`,
        order: 5,
      },
      {
        id: "daily-ops-blocking",
        title: "Blocking Triage Without Making It Worse",
        type: "lesson",
        content: "Blocking occurs when one session holds a lock another session needs. Waiting sessions are usually victims; the lead blocker is the session at the head of the chain. Killing every waiting session increases user impact without removing the cause.\n\n**Safe investigation sequence**\n1. Confirm the business symptom and affected application.\n2. Capture the blocking chain, wait types, SQL text, login, host, transaction age, and lead blocker.\n3. Determine whether the blocker is active work, an abandoned transaction, or an approved report/change.\n4. Estimate rollback work before termination. KILL WITH STATUSONLY can report rollback progress after termination.\n5. Contact the application/report owner when possible and obtain the appropriate operational approval.\n6. Terminate only the lead blocker when impact justifies it.\n7. Validate that waits and application latency recover.\n8. Preserve the evidence for root-cause analysis.\n\nLCK_M_S means a session is waiting for a shared lock. It identifies the wait category, not automatically the guilty query. Follow the blocking_session_id chain to the root.",
        codeExample: `-- Active requests, waits, and blockers
SELECT
    r.session_id,
    r.blocking_session_id,
    r.status,
    r.wait_type,
    r.wait_time,
    r.open_transaction_count,
    s.login_name,
    s.host_name,
    DB_NAME(r.database_id) AS DatabaseName,
    SUBSTRING(t.text,
      (r.statement_start_offset / 2) + 1,
      ((CASE r.statement_end_offset WHEN -1 THEN DATALENGTH(t.text)
         ELSE r.statement_end_offset END - r.statement_start_offset) / 2) + 1
    ) AS CurrentStatement
FROM sys.dm_exec_requests r
JOIN sys.dm_exec_sessions s ON r.session_id = s.session_id
CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) t
WHERE r.session_id <> @@SPID
ORDER BY r.blocking_session_id DESC, r.session_id;

-- Legacy quick view; useful for orientation, not sufficient evidence alone
EXEC sp_who2;

-- Use only after evidence, ownership, impact, and rollback are understood
KILL 184;
KILL 184 WITH STATUSONLY;`,
        order: 6,
      },
      {
        id: "daily-ops-access",
        title: "Production Access Requests and Least Privilege",
        type: "lesson",
        content: "Approval does not make excessive access safe. A manager may approve the business need, but the DBA must translate that need into the smallest technical permission that completes the task.\n\nBefore granting production access, confirm:\n- the exact task and objects involved\n- the environment and database\n- the required actions: read, execute, alter, or deploy\n- the approving authority and ticket\n- start time, expiration, and removal owner\n- whether an existing role already provides the approved access\n\nA developer who needs to execute and inspect one procedure does not need db_owner. Grant EXECUTE and VIEW DEFINITION on that procedure, make the access time-bound, test it using the intended identity, and schedule removal. Never share a DBA service account.\n\nRecord the before state, commands executed, validation, expiration, and removal task. Privileged access should be attributable to one identity.",
        codeExample: `USE [SALES-PROD];

-- Example of object-level least privilege
GRANT EXECUTE ON OBJECT::dbo.usp_OrderTrace TO [DOMAIN\\DeveloperName];
GRANT VIEW DEFINITION ON OBJECT::dbo.usp_OrderTrace TO [DOMAIN\\DeveloperName];

-- Verify effective permissions under the user's database identity
EXECUTE AS USER = 'DOMAIN\\DeveloperName';
SELECT * FROM fn_my_permissions('dbo.usp_OrderTrace', 'OBJECT');
REVERT;

-- Remove when the approved window ends
REVOKE EXECUTE ON OBJECT::dbo.usp_OrderTrace FROM [DOMAIN\\DeveloperName];
REVOKE VIEW DEFINITION ON OBJECT::dbo.usp_OrderTrace FROM [DOMAIN\\DeveloperName];`,
        order: 7,
      },
      {
        id: "daily-ops-change",
        title: "Executing an Approved Production Change",
        type: "lesson",
        content: "The DBA's job during a production deployment is controlled execution—not improvisation. An approved change defines scope, window, owners, validation, and rollback.\n\n**Before execution**\n- confirm the change/CAB approval and maintenance window\n- verify the script matches the reviewed package\n- confirm backup and recovery readiness\n- review blocking, long transactions, free space, and dependencies\n- confirm application, QA, and rollback owners are present\n- record the pre-change baseline\n\n**During execution**\nRun only the approved script. Capture start time, messages, row counts, duration, and unexpected behavior. Stop and escalate if actual behavior exceeds scope or a stop condition is reached. Do not rewrite the procedure directly in production because you noticed an unrelated improvement.\n\n**After execution**\nValidate the database objects, application smoke tests, error rate, latency, waits, job behavior, and monitoring. Keep the change under observation for the agreed period. Close only after technical and business validation. If validation fails, follow the tested rollback—not an improvised rescue.",
        checklistItems: [
          "Approval and maintenance window verified",
          "Exact production script checksum or version verified",
          "Backup and rollback readiness confirmed",
          "Blocking, transactions, and capacity checked",
          "Application and QA owners present",
          "Approved script executed without scope expansion",
          "Database and application validation passed",
          "Monitoring remained healthy and evidence was attached"
        ],
        order: 8,
      },
      {
        id: "daily-ops-capacity",
        title: "Capacity Forecasting Before It Becomes an Incident",
        type: "lesson",
        content: "Capacity work is preventative DBA work. Waiting for a disk to reach 95% turns a predictable trend into an emergency.\n\nA useful capacity review includes current size, free space, growth during a defined period, the fastest-growing files or tables, autogrowth configuration, retention opportunities, and a forecast date for the next threshold.\n\nAt 83% used with six percentage points of growth per month, a 90% threshold is less than three weeks away. That is enough evidence to open a planned request with the storage or Wintel/VM team. Include the required capacity, business system, forecast, requested completion date, and owner.\n\nDo not use routine database shrinking as a capacity strategy. Shrinking can create fragmentation and does not remove the cause of continued growth. First determine whether growth is legitimate, caused by retention, caused by a stalled log-reuse condition, or caused by poor file/autogrowth configuration.",
        codeExample: `-- Database file size, used space, free space, and autogrowth
SELECT
    DB_NAME() AS DatabaseName,
    name AS LogicalFile,
    type_desc,
    physical_name,
    size * 8.0 / 1024 AS SizeMB,
    FILEPROPERTY(name, 'SpaceUsed') * 8.0 / 1024 AS UsedMB,
    (size - FILEPROPERTY(name, 'SpaceUsed')) * 8.0 / 1024 AS FreeMB,
    CASE WHEN is_percent_growth = 1
         THEN CAST(growth AS varchar(20)) + '%'
         ELSE CAST(growth * 8.0 / 1024 AS varchar(20)) + ' MB'
    END AS Autogrowth
FROM sys.database_files;

-- Largest tables by reserved space
SELECT TOP (20)
    s.name AS SchemaName,
    t.name AS TableName,
    SUM(p.rows) AS RowCount,
    SUM(a.total_pages) * 8.0 / 1024 AS ReservedMB
FROM sys.tables t
JOIN sys.schemas s ON t.schema_id = s.schema_id
JOIN sys.indexes i ON t.object_id = i.object_id
JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
JOIN sys.allocation_units a ON p.partition_id = a.container_id
GROUP BY s.name, t.name
ORDER BY ReservedMB DESC;`,
        order: 9,
      },
      {
        id: "daily-ops-handoff",
        title: "Ticket Evidence and End-of-Shift Handoff",
        type: "lesson",
        content: "A good handoff allows another DBA to continue safely without reconstructing your entire shift. 'Everything looks good' is not a handoff. A list of ticket numbers alone is also insufficient.\n\nFor each important item, record:\n- **Status:** resolved, monitoring, waiting, or open\n- **Impact:** users, recoverability, performance, or no current impact\n- **Evidence:** error, query result, timestamp, validation, or monitoring state\n- **Action taken:** exact change, rerun, escalation, or permission grant\n- **Validation:** how you proved recovery or success\n- **Remaining risk:** what could still go wrong\n- **Next action:** a concrete step\n- **Owner and deadline:** one accountable team/person and a time\n\nExample: 'INC-2084 resolved 06:22. FIN-PROD log backup failed with OS error 112 because backup volume B: had 812 MB free. Storage cleared expired staging files; rerun succeeded and msdb history confirms the log sequence continued. Monitor next scheduled backup at 06:30. Owner: day DBA.'\n\nTimed access must always be handed off if removal occurs after your shift. Capacity work must include the infrastructure request, owner, target date, and current risk.",
        order: 10,
      },
      {
        id: "daily-ops-lab",
        title: "Lab: Rehearse a Normal DBA Day",
        type: "lab",
        content: "**Objective:** Practice every skill before entering Live Shift. Use a non-production SQL Server instance or written evidence where a feature such as Always On is unavailable.\n\n**Part 1 — Start-of-shift control**\n1. Write a five-item overnight handoff containing one unresolved issue.\n2. Rank the work as P1, P2, or P3 and explain the business/data risk.\n3. Run database-state, backup-history, failed-job, and disk-capacity checks.\n\n**Part 2 — Backup failure**\n1. Review the error-112 runbook.\n2. Identify the backup destination and available space.\n3. Write the escalation message you would send to the storage/Wintel owner.\n4. Run a test log backup and verify it in msdb.\n\n**Part 3 — Job dependency**\n1. Inspect job history and identify the failed step.\n2. Document the upstream dependency and owner.\n3. Rerun only after the dependency is present.\n4. Validate using a row count or control total.\n\n**Part 4 — Blocking**\n1. Create two test sessions where one transaction blocks another.\n2. Capture the blocking chain, SQL text, login, host, wait type, and transaction state.\n3. Estimate the business impact and rollback risk before ending the blocker.\n4. Validate that waits clear.\n\n**Part 5 — Access, change, and capacity**\n1. Translate a db_owner request into object-level permissions with an expiration.\n2. Build a change checklist containing prechecks, rollback, validation, and monitoring.\n3. Collect file and table sizes and write a capacity request containing a forecast and owner.\n\n**Part 6 — Handoff**\nWrite the final handoff for all five parts. Another learner should be able to state current status, remaining risk, next action, owner, and deadline without asking you a question.\n\nAfter completing this lab, run Guided Scenarios for coaching and then Live Shift without using the lesson as a script.",
        order: 11,
      },
      {
        id: "daily-ops-checklist",
        title: "Live Shift Readiness Checklist",
        type: "checklist",
        content: "You are ready for the simulator when you can do all of the following without guessing:",
        checklistItems: [
          "Triage handoff work by user impact, availability, recoverability, and deadline",
          "Run and interpret a production morning health check",
          "Interpret Always On synchronization and health states without forcing an unnecessary failover",
          "Explain OS error 112 and investigate the actual backup destination",
          "Review backup history, rerun a log backup, and verify success",
          "Diagnose a SQL Agent step failure and coordinate an external dependency",
          "Capture a blocking chain and identify the lead blocker before considering KILL",
          "Translate a broad access request into time-bound least privilege",
          "Execute an approved change using prechecks, validation, monitoring, and rollback criteria",
          "Collect capacity evidence and forecast a threshold date",
          "Write a handoff containing status, evidence, risk, next action, owner, and deadline"
        ],
        order: 12,
      }
    ]
  }
];

export function getModuleSummaries(isPremium: boolean) {
  return modules.map(m => ({
    id: m.id,
    title: m.title,
    description: m.description,
    order: m.order,
    isFree: m.isFree,
    isLocked: !m.isFree && !isPremium,
    lessonCount: m.lessons.length,
    estimatedMinutes: m.estimatedMinutes,
    topics: m.topics,
  }));
}

export function getModuleDetail(moduleId: string, isPremium: boolean) {
  const m = modules.find(mod => mod.id === moduleId);
  if (!m) return null;
  const isLocked = !m.isFree && !isPremium;
  const sortedLessons = m.lessons.sort((a, b) => a.order - b.order);
  return {
    ...m,
    isLocked,
    lessons: isLocked
      ? sortedLessons.map((l, idx) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          order: l.order,
          content: idx === 0 ? l.content : "",
        }))
      : sortedLessons,
  };
}
