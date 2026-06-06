export interface PracticeQuestion {
  id: string;
  moduleId: string;
  moduleTitle: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const practiceQuestions: PracticeQuestion[] = [
  // Module 1 — Fundamentals
  {
    id: "m1q1",
    moduleId: "fundamentals",
    moduleTitle: "SQL Server Fundamentals",
    question: "What is the primary purpose of the SQL Server transaction log?",
    options: [
      "Cache frequently accessed data pages in memory",
      "Record all database changes to support recovery and replication",
      "Store query execution plans for reuse",
      "Track index fragmentation levels",
    ],
    correctIndex: 1,
    explanation:
      "The transaction log records every modification made to a database (inserts, updates, deletes, schema changes). This enables crash recovery, point-in-time restores, and feeds replication/Always On Availability Groups.",
  },
  {
    id: "m1q2",
    moduleId: "fundamentals",
    moduleTitle: "SQL Server Fundamentals",
    question: "What does a clustered index determine for a table?",
    options: [
      "Which columns are visible to a query",
      "The physical storage order of rows on disk",
      "The maximum number of rows a table can hold",
      "How SQL Server parallelises query execution",
    ],
    correctIndex: 1,
    explanation:
      "A clustered index defines the physical order of rows in the table. The leaf level of a clustered index IS the table data — there is no separate row store. A table can have only one clustered index.",
  },
  {
    id: "m1q3",
    moduleId: "fundamentals",
    moduleTitle: "SQL Server Fundamentals",
    question: "Which system database contains instance-level configuration and all server login definitions?",
    options: ["tempdb", "model", "msdb", "master"],
    correctIndex: 3,
    explanation:
      "master stores instance configuration, all logins, linked servers, endpoints, and references to every user database. Losing master without a backup requires a full instance rebuild.",
  },
  {
    id: "m1q4",
    moduleId: "fundamentals",
    moduleTitle: "SQL Server Fundamentals",
    question: "Which statement correctly distinguishes TRUNCATE TABLE from DELETE?",
    options: [
      "TRUNCATE fires row-level triggers; DELETE does not",
      "DELETE resets the identity column; TRUNCATE does not",
      "TRUNCATE cannot be used on a table referenced by an active foreign key constraint",
      "DELETE is minimally logged; TRUNCATE is fully logged",
    ],
    correctIndex: 2,
    explanation:
      "TRUNCATE is DDL, minimally logged, and resets the identity counter — but SQL Server blocks it if the table is referenced by an enabled foreign key. DELETE is fully logged DML and fires row-level triggers.",
  },
  {
    id: "m1q5",
    moduleId: "fundamentals",
    moduleTitle: "SQL Server Fundamentals",
    question: "What does DBCC CHECKDB do?",
    options: [
      "Clears the procedure cache and buffer pool",
      "Checks the logical and physical integrity of all objects in a database",
      "Rebuilds all indexes and updates all statistics",
      "Reclaims unused space from data files",
    ],
    correctIndex: 1,
    explanation:
      "DBCC CHECKDB checks allocation structures, index integrity, and page-level consistency. It is the authoritative way to detect corruption and should be run regularly on every production database.",
  },
  {
    id: "m1q6",
    moduleId: "fundamentals",
    moduleTitle: "SQL Server Fundamentals",
    question: "What is a 'covering index' in SQL Server?",
    options: [
      "An index that spans multiple tables via a view",
      "An index whose key and included columns satisfy all columns needed by a query, avoiding a key lookup",
      "A clustered index created with FILLFACTOR = 100",
      "An index automatically created on foreign key columns",
    ],
    correctIndex: 1,
    explanation:
      "A covering index includes all columns a query needs (via key columns or INCLUDE columns), so the engine can satisfy the query entirely from the index without a separate key lookup back to the clustered index.",
  },
  {
    id: "m1q7",
    moduleId: "fundamentals",
    moduleTitle: "SQL Server Fundamentals",
    question: "What is a 'heap' in SQL Server?",
    options: [
      "A temporary sort structure created in tempdb during query execution",
      "A table that has no clustered index",
      "A memory area used to cache query plans",
      "A special filegroup for large object storage",
    ],
    correctIndex: 1,
    explanation:
      "A heap is a table without a clustered index. Rows are stored in no particular order and located via Index Allocation Map (IAM) pages. Heaps can cause forwarded record overhead during updates.",
  },
  {
    id: "m1q8",
    moduleId: "fundamentals",
    moduleTitle: "SQL Server Fundamentals",
    question: "Which ACID property guarantees that committed transactions survive a system crash?",
    options: [
      "Atomicity — all or nothing execution",
      "Consistency — data always moves from one valid state to another",
      "Isolation — concurrent transactions do not interfere",
      "Durability — committed changes are written to stable storage",
    ],
    correctIndex: 3,
    explanation:
      "Durability means once a COMMIT is acknowledged, the changes persist even if the server crashes immediately after. SQL Server achieves this by writing log records to disk (the Write-Ahead Log) before confirming the commit.",
  },

  // Module 2 — Backups
  {
    id: "m2q1",
    moduleId: "backups",
    moduleTitle: "Backup Strategies",
    question: "Which backup type requires a prior full backup before it can be restored?",
    options: [
      "Copy-only backup",
      "Full backup",
      "Differential backup",
      "Filegroup backup",
    ],
    correctIndex: 2,
    explanation:
      "A differential backup captures all pages changed since the last full backup. To restore it you must first restore the full backup (with NORECOVERY), then apply the differential. Transaction log backups also require a full backup base.",
  },
  {
    id: "m2q2",
    moduleId: "backups",
    moduleTitle: "Backup Strategies",
    question: "What does a differential backup capture?",
    options: [
      "All pages modified since the previous differential backup",
      "All pages modified since the most recent full backup",
      "Only the transaction log records since the last backup",
      "A snapshot of the database at the moment of execution",
    ],
    correctIndex: 1,
    explanation:
      "SQL Server tracks changed extents using the Differential Changed Map (DCM). A differential backup always captures every page changed since the last full backup — not since the last differential. This means each differential is cumulative.",
  },
  {
    id: "m2q3",
    moduleId: "backups",
    moduleTitle: "Backup Strategies",
    question: "What is the purpose of BACKUP DATABASE ... WITH COPY_ONLY?",
    options: [
      "Creates a compressed backup distributed across multiple files",
      "Creates an out-of-band backup that does not affect the differential base",
      "Backs up only system databases",
      "Creates an encrypted copy stored to a secondary location",
    ],
    correctIndex: 1,
    explanation:
      "WITH COPY_ONLY takes a backup without resetting the differential base or breaking the log backup chain. It is used for ad hoc copies (developer refreshes, migrations) without disturbing the production backup strategy.",
  },
  {
    id: "m2q4",
    moduleId: "backups",
    moduleTitle: "Backup Strategies",
    question: "Which command verifies a backup file is complete and readable without performing a full restore?",
    options: [
      "DBCC CHECKDB WITH BACKUP",
      "RESTORE VERIFYONLY",
      "BACKUP VERIFY ONLY",
      "RESTORE HEADERONLY",
    ],
    correctIndex: 1,
    explanation:
      "RESTORE VERIFYONLY reads the backup set and validates checksums and completeness without writing any data. RESTORE HEADERONLY returns metadata (database name, dates, LSNs) but does not verify data integrity.",
  },
  {
    id: "m2q5",
    moduleId: "backups",
    moduleTitle: "Backup Strategies",
    question: "What is meant by the term 'backup chain'?",
    options: [
      "The sequence of SQL Agent jobs that execute backup operations",
      "The ordered set of full, differential, and log backups required to restore to a specific point in time",
      "A linked list of backup devices configured in a media set",
      "The encryption key hierarchy applied to a backup set",
    ],
    correctIndex: 1,
    explanation:
      "The backup chain defines what you need to restore: typically one full backup, optionally the latest differential, then all subsequent log backups up to the recovery point. A gap in the chain (e.g. missing log file) breaks the restore.",
  },
  {
    id: "m2q6",
    moduleId: "backups",
    moduleTitle: "Backup Strategies",
    question: "Which file extension is the industry convention for SQL Server transaction log backup files?",
    options: [".bak", ".dff", ".trn", ".log"],
    correctIndex: 2,
    explanation:
      ".trn is the conventional extension for log backups, while .bak is used for full and differential backups. Extensions do not affect functionality — SQL Server does not enforce them — but following the convention prevents confusion during a restore.",
  },
  {
    id: "m2q7",
    moduleId: "backups",
    moduleTitle: "Backup Strategies",
    question: "A DBA needs to take a one-off manual backup before a schema change without affecting the nightly differential. Which option should they use?",
    options: [
      "BACKUP DATABASE ... WITH DIFFERENTIAL",
      "BACKUP DATABASE ... WITH COPY_ONLY",
      "BACKUP DATABASE ... WITH INIT",
      "BACKUP DATABASE ... WITH CHECKSUM, SKIP",
    ],
    correctIndex: 1,
    explanation:
      "WITH COPY_ONLY is specifically designed for this scenario. It creates a complete backup but does not reset the differential change tracking bitmap, so the next scheduled differential backup still captures only the changes since the last regular full backup.",
  },
  {
    id: "m2q8",
    moduleId: "backups",
    moduleTitle: "Backup Strategies",
    question: "What is the recommended minimum backup strategy for a production OLTP database with a 1-hour Recovery Point Objective (RPO)?",
    options: [
      "Weekly full backup only",
      "Daily full backup + weekly differential",
      "Daily full backup + hourly transaction log backups",
      "Continuous database mirroring with no separate backups",
    ],
    correctIndex: 2,
    explanation:
      "A 1-hour RPO means you can lose at most 1 hour of data. This requires transaction log backups at least every hour. The database must be in Full or Bulk-Logged recovery model. Always verify backups can be restored.",
  },

  // Module 3 — Recovery Models
  {
    id: "m3q1",
    moduleId: "recovery-models",
    moduleTitle: "Recovery Models",
    question: "Which recovery model is required to perform a point-in-time restore?",
    options: [
      "Simple — because log is automatically managed",
      "Bulk-Logged — because it supports all restore types",
      "Full — because the complete log chain is preserved",
      "Any recovery model supports point-in-time restore",
    ],
    correctIndex: 2,
    explanation:
      "Point-in-time restore requires an unbroken chain of transaction log backups, which is only possible under Full (or Bulk-Logged for non-bulk intervals). Simple recovery truncates the log at each checkpoint, making log backup impossible.",
  },
  {
    id: "m3q2",
    moduleId: "recovery-models",
    moduleTitle: "Recovery Models",
    question: "In Simple recovery model, when does SQL Server automatically truncate the transaction log?",
    options: [
      "Every 24 hours on a scheduled timer",
      "After each successful BACKUP LOG operation",
      "At each CHECKPOINT, once active transactions are complete",
      "When the log file reaches 80% of its maximum size",
    ],
    correctIndex: 2,
    explanation:
      "In Simple recovery, the log is truncated (inactive VLFs are marked reusable) at CHECKPOINT once there are no active transactions referencing those records. This prevents log growth but also prevents log backups.",
  },
  {
    id: "m3q3",
    moduleId: "recovery-models",
    moduleTitle: "Recovery Models",
    question: "What happens to the log backup chain when a database is switched from Full to Simple recovery model?",
    options: [
      "Nothing — the existing chain remains intact",
      "The chain is broken; you must take a new full backup after switching back to Full",
      "SQL Server automatically archives the existing log chain to msdb",
      "Log backups continue but are stored in a compressed format",
    ],
    correctIndex: 1,
    explanation:
      "Switching to Simple recovery breaks the log chain because the log is no longer maintained for backup purposes. After switching back to Full, you must take a new full backup before transaction log backups become useful again.",
  },
  {
    id: "m3q4",
    moduleId: "recovery-models",
    moduleTitle: "Recovery Models",
    question: "Which recovery model minimises transaction log growth during bulk operations like BCP imports or SELECT INTO?",
    options: [
      "Simple — truncates log automatically",
      "Full — fully logs all operations",
      "Bulk-Logged — minimally logs specific bulk operations",
      "There is no difference between recovery models for bulk operations",
    ],
    correctIndex: 2,
    explanation:
      "Bulk-Logged recovery minimally logs operations like BCP, BULK INSERT, SELECT INTO, index rebuilds, and text operations. This dramatically reduces log growth. However, if bulk operations occur, the log backup must include the associated data extents.",
  },
  {
    id: "m3q5",
    moduleId: "recovery-models",
    moduleTitle: "Recovery Models",
    question: "What is a Virtual Log File (VLF) and why does VLF count matter?",
    options: [
      "A VLF is a network packet used for log shipping; high counts increase latency",
      "A VLF is the internal subdivision of the transaction log file; too many VLFs slow startup and recovery",
      "A VLF is a verified log format checksum; counts indicate backup integrity",
      "A VLF is a memory buffer for log writes; counts reflect write pressure",
    ],
    correctIndex: 1,
    explanation:
      "The transaction log is divided internally into Virtual Log Files. Excessive VLF counts (thousands) occur when the log grows in many small auto-growth events. This significantly slows database startup, recovery, and log backup restore operations.",
  },
  {
    id: "m3q6",
    moduleId: "recovery-models",
    moduleTitle: "Recovery Models",
    question: "Why does a database in Full recovery model have an ever-growing transaction log if no log backups are scheduled?",
    options: [
      "SQL Server pre-allocates log space for anticipated future operations",
      "Log records cannot be truncated until a log backup marks them as no longer needed",
      "Full recovery model disables auto-shrink for all files",
      "Index rebuild operations lock the log from truncation",
    ],
    correctIndex: 1,
    explanation:
      "In Full recovery, log truncation only occurs after a transaction log backup. Without regular log backups, active (backed-up) log records accumulate indefinitely, causing the log to grow until the disk fills or the file hits its maximum size.",
  },
  {
    id: "m3q7",
    moduleId: "recovery-models",
    moduleTitle: "Recovery Models",
    question: "A database has just been switched from Simple to Full recovery model. What must you do immediately to make log backups meaningful?",
    options: [
      "Run DBCC CHECKDB to validate the database",
      "Restart the SQL Server service",
      "Take a full database backup to start the log backup chain",
      "Take a transaction log backup to capture any pending changes",
    ],
    correctIndex: 2,
    explanation:
      "After switching to Full recovery, the log backup chain does not exist yet. You must take a full backup first. Until then, log backups cannot be used for point-in-time restore because there is no baseline to apply them against.",
  },
  {
    id: "m3q8",
    moduleId: "recovery-models",
    moduleTitle: "Recovery Models",
    question: "Which command returns transaction log space usage across ALL databases on a SQL Server instance?",
    options: [
      "sys.dm_db_log_space_usage",
      "SELECT * FROM sys.databases",
      "DBCC SQLPERF(LOGSPACE)",
      "sys.dm_os_performance_counters WHERE counter_name = 'Log File(s) Size (KB)'",
    ],
    correctIndex: 2,
    explanation:
      "DBCC SQLPERF(LOGSPACE) returns log size, log space used (%), and status for every database in one result set. sys.dm_db_log_space_usage only shows the current database. It is a quick diagnostic first step when log files are growing unexpectedly.",
  },

  // Module 4 — Security
  {
    id: "m4q1",
    moduleId: "security",
    moduleTitle: "SQL Server Security",
    question: "What is the key architectural difference between a SQL Server Login and a User?",
    options: [
      "Logins are database-level; Users are instance-level",
      "Logins are instance-level server principals; Users are database-level principals mapped to a Login",
      "Logins use only Windows Authentication; Users use SQL Authentication",
      "There is no functional difference — the terms are interchangeable",
    ],
    correctIndex: 1,
    explanation:
      "A Login is a server-level principal that authenticates to the instance. A User is a database-level principal that maps a Login to a database identity. This separation means a login can be mapped to different usernames in different databases, or to no database at all.",
  },
  {
    id: "m4q2",
    moduleId: "security",
    moduleTitle: "SQL Server Security",
    question: "What level of access does membership in the db_owner fixed database role grant?",
    options: [
      "Read-only access to all tables and views",
      "The ability to create logins on the SQL Server instance",
      "Full control over the database, including the ability to drop it",
      "Permission to manage SQL Agent jobs for that database",
    ],
    correctIndex: 2,
    explanation:
      "db_owner members can perform any activity in the database — create/drop objects, manage permissions, shrink files, and even drop the database itself. It should be granted sparingly. Developers rarely need db_owner; db_datareader + db_datawriter is often sufficient.",
  },
  {
    id: "m4q3",
    moduleId: "security",
    moduleTitle: "SQL Server Security",
    question: "What does the 'principle of least privilege' mean in a SQL Server security context?",
    options: [
      "Grant users the maximum permissions they could ever need to avoid future disruptions",
      "Grant users only the minimum permissions required to perform their specific job function",
      "Restrict all non-DBA users to read-only access on all databases",
      "Use only Windows Authentication and never create SQL logins",
    ],
    correctIndex: 1,
    explanation:
      "Least privilege means granting only what is necessary. A reporting user needs SELECT, not INSERT/UPDATE/DELETE. An app service account needs EXECUTE on specific stored procedures, not db_owner. Over-privileged accounts dramatically increase breach impact.",
  },
  {
    id: "m4q4",
    moduleId: "security",
    moduleTitle: "SQL Server Security",
    question: "Which server-level role grants complete, unrestricted control over a SQL Server instance?",
    options: ["db_owner", "securityadmin", "sysadmin", "serveradmin"],
    correctIndex: 2,
    explanation:
      "sysadmin members can do anything on the instance — create/drop databases, manage logins, override all security checks. The sa login and the local Windows Administrators group are sysadmin by default. Membership should be strictly limited.",
  },
  {
    id: "m4q5",
    moduleId: "security",
    moduleTitle: "SQL Server Security",
    question: "What does Row-Level Security (RLS) do in SQL Server?",
    options: [
      "Encrypts individual rows based on a certificate hierarchy",
      "Restricts which rows a user can query or modify based on an inline table-valued predicate function",
      "Partitions a table by user so each user sees only their own partition",
      "Creates a trigger that audits and blocks unauthorised row deletions",
    ],
    correctIndex: 1,
    explanation:
      "RLS uses a security policy bound to a predicate function. The function is evaluated per row, transparently filtering SELECT, INSERT, UPDATE, and DELETE results without changing application queries. It is invisible to the application.",
  },
  {
    id: "m4q6",
    moduleId: "security",
    moduleTitle: "SQL Server Security",
    question: "What does EXECUTE AS in a stored procedure allow?",
    options: [
      "Schedule the procedure to execute at a specific time via SQL Agent",
      "Execute the procedure under a specified user's security context, not the caller's",
      "Execute a query against a remote linked server",
      "Override a DENY permission for the duration of the procedure",
    ],
    correctIndex: 1,
    explanation:
      "EXECUTE AS switches the security context during execution. EXECUTE AS OWNER lets a stored procedure access objects the owner has access to, even if the caller does not. This enables 'ownership chaining' patterns without granting direct table permissions.",
  },
  {
    id: "m4q7",
    moduleId: "security",
    moduleTitle: "SQL Server Security",
    question: "How does Transparent Data Encryption (TDE) protect a SQL Server database?",
    options: [
      "Encrypts selected columns using a certificate, visible only to authorised users",
      "Encrypts all data files (.mdf, .ndf) and the log file (.ldf) at rest using AES encryption",
      "Encrypts network traffic between client applications and the SQL Server instance",
      "Encrypts backup files only — live data files remain unencrypted",
    ],
    correctIndex: 1,
    explanation:
      "TDE performs real-time I/O encryption of the data and log files at the page level. Data is decrypted when read into the buffer pool. It protects against theft of physical media but does not protect against an authenticated user with SELECT permissions.",
  },
  {
    id: "m4q8",
    moduleId: "security",
    moduleTitle: "SQL Server Security",
    question: "A user can authenticate to the SQL Server instance but receives 'Cannot open database' when connecting to a specific database. What is the most likely cause?",
    options: [
      "The user's Login does not have the sysadmin server role",
      "The Login exists at the instance level but has no corresponding User in that database",
      "The database is offline or in single-user mode",
      "The Login's password has expired and needs resetting",
    ],
    correctIndex: 1,
    explanation:
      "Authentication (Login) and authorisation (User) are separate. A successful login proves identity at the instance level. Without a User mapping in the target database, SQL Server denies access. The fix is CREATE USER [LoginName] FOR LOGIN [LoginName] in the database.",
  },

  // Module 5 — SQL Agent
  {
    id: "m5q1",
    moduleId: "sql-agent",
    moduleTitle: "SQL Server Agent",
    question: "What is a SQL Agent Job Step?",
    options: [
      "A scheduled time window during which a job is permitted to run",
      "A discrete unit of work within a job that can use T-SQL, SSIS, PowerShell, CmdExec, or other subsystems",
      "An automated notification sent when a job completes or fails",
      "A dependency link between two separate SQL Agent jobs",
    ],
    correctIndex: 1,
    explanation:
      "A job can contain one or more steps, each with its own subsystem type and failure/success routing. Steps execute sequentially by default, but you can configure branching logic — on success go to step 3, on failure go to step 5 — to build complex workflows.",
  },
  {
    id: "m5q2",
    moduleId: "sql-agent",
    moduleTitle: "SQL Server Agent",
    question: "What does a SQL Agent Operator define?",
    options: [
      "The SQL Server login that owns and runs a job",
      "A named contact (email address, pager, or net send) that receives job notifications",
      "The subsystem type (T-SQL, SSIS, PowerShell) used in a job step",
      "A proxy account that supplies credentials for a job step",
    ],
    correctIndex: 1,
    explanation:
      "An Operator is a named individual or team with contact information. Job notifications and alerts are sent to Operators, not directly to email addresses. This decouples jobs from specific people — you update the Operator, not every job.",
  },
  {
    id: "m5q3",
    moduleId: "sql-agent",
    moduleTitle: "SQL Server Agent",
    question: "What is the primary purpose of SQL Agent Alerts?",
    options: [
      "Schedule jobs to run on a recurring basis",
      "Respond automatically to SQL Server events, error numbers, or performance conditions",
      "Send an email whenever a SQL Server login fails authentication",
      "Monitor disk space and suspend jobs when free space drops below a threshold",
    ],
    correctIndex: 1,
    explanation:
      "SQL Agent Alerts fire in response to three trigger types: SQL Server error numbers (e.g. severity 17+), performance conditions (e.g. CPU > 90%), and WMI events. They can notify an Operator and/or execute a response job automatically.",
  },
  {
    id: "m5q4",
    moduleId: "sql-agent",
    moduleTitle: "SQL Server Agent",
    question: "In which system database are SQL Agent job definitions, schedules, and history stored?",
    options: ["master", "tempdb", "msdb", "model"],
    correctIndex: 2,
    explanation:
      "msdb is the SQL Agent database. It stores sysjobs, sysjobsteps, sysjobschedules, sysjobhistory, sysalerts, sysoperators, and the backup/restore history. Losing msdb without a backup means losing all job definitions.",
  },
  {
    id: "m5q5",
    moduleId: "sql-agent",
    moduleTitle: "SQL Server Agent",
    question: "A job step is configured with 'On Failure: Go to next step.' The step fails at runtime. What happens?",
    options: [
      "The job stops immediately and is marked as Failed",
      "The step retries automatically up to three times before moving on",
      "Execution continues with the next step in sequence",
      "An Alert fires and the job is paused until manually resumed",
    ],
    correctIndex: 2,
    explanation:
      "Step-level flow control is independent of job-level outcome. 'Go to next step' on failure means execution proceeds regardless of the step's exit code. The job's overall success or failure is determined by the last step's outcome and the job-level completion action.",
  },
  {
    id: "m5q6",
    moduleId: "sql-agent",
    moduleTitle: "SQL Server Agent",
    question: "What is a SQL Agent Proxy, and when is it required?",
    options: [
      "A network proxy that routes Agent connections through a firewall",
      "A credential that allows a job step to run under a specific Windows identity other than the Agent service account",
      "A read-only replica used so reporting jobs do not hit the primary",
      "A linked server used to execute job steps on a remote SQL instance",
    ],
    correctIndex: 1,
    explanation:
      "By default, non-T-SQL job steps (CmdExec, PowerShell, SSIS, etc.) run under the Agent service account. A Proxy maps a Windows Credential to a subsystem, allowing a step to run as a different, less-privileged Windows account — an important security boundary.",
  },
  {
    id: "m5q7",
    moduleId: "sql-agent",
    moduleTitle: "SQL Server Agent",
    question: "Why does the SQL Agent service account choice have security implications?",
    options: [
      "The service account must be sysadmin to run any job type",
      "Job steps running without a proxy inherit the Agent service account's OS-level permissions, creating risk if the account is over-privileged",
      "SQL Agent ignores the service account and always runs as the job owner",
      "The service account controls which users can create or modify SQL Agent jobs",
    ],
    correctIndex: 1,
    explanation:
      "T-SQL steps run under the job owner's database security context, but CmdExec, PowerShell, and ActiveX steps without a proxy run as the Agent service account. An over-privileged service account (e.g. Local System or Domain Admin) means a malicious or poorly written job step can cause serious damage.",
  },
  {
    id: "m5q8",
    moduleId: "sql-agent",
    moduleTitle: "SQL Server Agent",
    question: "Which table in msdb stores the execution history of SQL Agent job runs?",
    options: [
      "msdb.dbo.sysjobs",
      "msdb.dbo.sysjobsteps",
      "msdb.dbo.sysjobhistory",
      "msdb.dbo.sysalerts",
    ],
    correctIndex: 2,
    explanation:
      "sysjobhistory contains one row per step execution, including run date/time, duration, outcome, and message text. sysjobs stores job definitions, sysjobsteps stores step configurations, and sysalerts stores alert definitions.",
  },
];
