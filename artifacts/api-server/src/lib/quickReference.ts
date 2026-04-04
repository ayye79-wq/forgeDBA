export const quickReferenceSections = [
  {
    id: "backup-commands",
    title: "Backup Commands",
    icon: "Shield",
    cards: [
      {
        id: "qr-full-backup",
        title: "Full Backup",
        syntax: "BACKUP DATABASE [db] TO DISK = 'path.bak' WITH INIT, COMPRESSION, STATS = 10;",
        description: "Complete backup of the entire database. Foundation of every backup strategy.",
        example: "BACKUP DATABASE [Production] TO DISK = 'C:\\Backups\\Prod_Full.bak' WITH INIT, COMPRESSION, STATS = 10;"
      },
      {
        id: "qr-diff-backup",
        title: "Differential Backup",
        syntax: "BACKUP DATABASE [db] TO DISK = 'path.bak' WITH DIFFERENTIAL, INIT, COMPRESSION;",
        description: "Backs up all changes since the last full backup. Faster than a full backup.",
        example: "BACKUP DATABASE [Production] TO DISK = 'C:\\Backups\\Prod_Diff.bak' WITH DIFFERENTIAL, INIT, COMPRESSION;"
      },
      {
        id: "qr-log-backup",
        title: "Transaction Log Backup",
        syntax: "BACKUP LOG [db] TO DISK = 'path.bak' WITH INIT, COMPRESSION;",
        description: "Backs up transaction log and truncates it. Required for point-in-time recovery. FULL recovery model only.",
        example: "BACKUP LOG [Production] TO DISK = 'C:\\Backups\\Prod_Log.bak' WITH INIT, COMPRESSION;"
      },
      {
        id: "qr-verify-backup",
        title: "Verify Backup",
        syntax: "RESTORE VERIFYONLY FROM DISK = 'path.bak';",
        description: "Verifies a backup file is readable without performing a full restore.",
        example: "RESTORE VERIFYONLY FROM DISK = 'C:\\Backups\\Production_Full.bak';"
      }
    ]
  },
  {
    id: "restore-commands",
    title: "Restore Commands",
    icon: "RotateCcw",
    cards: [
      {
        id: "qr-restore-full",
        title: "Restore Full Backup",
        syntax: "RESTORE DATABASE [db] FROM DISK = 'path.bak' WITH RECOVERY;",
        description: "Restores a full backup and brings the database online. Use NORECOVERY if you need to apply more backups.",
        example: "RESTORE DATABASE [Production] FROM DISK = 'C:\\Backups\\Prod_Full.bak' WITH RECOVERY;"
      },
      {
        id: "qr-restore-sequence",
        title: "Full + Diff + Log Sequence",
        syntax: "RESTORE DATABASE ... WITH NORECOVERY;\nRESTORE DATABASE ... WITH NORECOVERY;\nRESTORE LOG ... WITH RECOVERY;",
        description: "Standard restore sequence. NORECOVERY on all but the final step. RECOVERY on the last backup to bring database online.",
        example: "RESTORE DATABASE [Prod] FROM DISK='Full.bak' WITH NORECOVERY;\nRESTORE DATABASE [Prod] FROM DISK='Diff.bak' WITH NORECOVERY;\nRESTORE LOG [Prod] FROM DISK='Log.bak' WITH RECOVERY;"
      },
      {
        id: "qr-point-in-time",
        title: "Point-in-Time Restore",
        syntax: "RESTORE LOG [db] FROM DISK = 'log.bak' WITH RECOVERY, STOPAT = 'datetime';",
        description: "Stops applying the log at a specific moment in time. Use on the last log backup in the sequence.",
        example: "RESTORE LOG [Prod] FROM DISK='C:\\Backups\\Log.bak' WITH RECOVERY, STOPAT = '2024-03-15 14:31:59';"
      },
      {
        id: "qr-restore-headeronly",
        title: "Check Backup Contents",
        syntax: "RESTORE HEADERONLY FROM DISK = 'path.bak';",
        description: "Shows metadata about what is in a backup file without restoring it.",
        example: "RESTORE HEADERONLY FROM DISK = 'C:\\Backups\\Production_Full.bak';"
      }
    ]
  },
  {
    id: "recovery-models",
    title: "Recovery Models",
    icon: "Database",
    cards: [
      {
        id: "qr-check-recovery",
        title: "Check Recovery Model",
        syntax: "SELECT name, recovery_model_desc, log_reuse_wait_desc FROM sys.databases;",
        description: "Shows recovery model and why the log cannot truncate (if applicable).",
        example: "SELECT name, recovery_model_desc, log_reuse_wait_desc FROM sys.databases ORDER BY name;"
      },
      {
        id: "qr-change-recovery",
        title: "Change Recovery Model",
        syntax: "ALTER DATABASE [db] SET RECOVERY { FULL | SIMPLE | BULK_LOGGED };",
        description: "Changes the recovery model. After switching from SIMPLE to FULL, take a full backup immediately.",
        example: "ALTER DATABASE [Production] SET RECOVERY FULL;\nBACKUP DATABASE [Production] TO DISK = 'C:\\Backups\\Prod_Full_AfterChange.bak';"
      },
      {
        id: "qr-log-space",
        title: "Check Log File Usage",
        syntax: "DBCC SQLPERF(LOGSPACE);",
        description: "Shows log size and percent used for all databases. First check when investigating log growth.",
        example: "DBCC SQLPERF(LOGSPACE);\n-- Look for databases with high Log Space Used (%)"
      },
      {
        id: "qr-shrink-log",
        title: "Shrink Log File",
        syntax: "BACKUP LOG [db] TO DISK='log.bak';\nDBCC SHRINKFILE ([logfile_name], target_mb);",
        description: "Take a log backup first to truncate inactive log, then shrink. Never shrink before a log backup.",
        example: "USE [Production];\nBACKUP LOG [Production] TO DISK = 'C:\\Backups\\log.bak' WITH INIT;\nDBCC SHRINKFILE (Production_log, 100);"
      }
    ]
  },
  {
    id: "security",
    title: "Security & Permissions",
    icon: "Lock",
    cards: [
      {
        id: "qr-create-login",
        title: "Create a Login",
        syntax: "CREATE LOGIN [name] WITH PASSWORD = 'password';",
        description: "Creates a server-level login. For Windows logins: CREATE LOGIN [DOMAIN\\user] FROM WINDOWS;",
        example: "CREATE LOGIN AppUser WITH PASSWORD = 'Str0ng!Pass';\nCREATE LOGIN [DOMAIN\\johndoe] FROM WINDOWS;"
      },
      {
        id: "qr-create-user",
        title: "Create a Database User",
        syntax: "USE [db]; CREATE USER [user] FOR LOGIN [login];",
        description: "Maps a server login to a database user. Run inside the target database.",
        example: "USE [Production];\nCREATE USER AppUser FOR LOGIN AppUser;"
      },
      {
        id: "qr-grant-permissions",
        title: "Grant / Deny / Revoke",
        syntax: "GRANT SELECT ON [table] TO [user];\nDENY DELETE ON [table] TO [user];\nREVOKE SELECT ON [table] FROM [user];",
        description: "GRANT gives permission. DENY blocks it (overrides GRANT). REVOKE removes the explicit grant or deny.",
        example: "GRANT SELECT ON dbo.Orders TO ReportUser;\nDENY DELETE ON dbo.Orders TO AppUser;\nALTER ROLE db_datareader ADD MEMBER ReportUser;"
      },
      {
        id: "qr-audit-logins",
        title: "Audit All Logins",
        syntax: "SELECT name, type_desc, is_disabled FROM sys.server_principals WHERE type IN ('S','U','G') ORDER BY name;",
        description: "Lists all server logins. Look for disabled logins, old service accounts, and unused logins.",
        example: "SELECT sp.name, sp.type_desc, sp.is_disabled, spr.name AS ServerRole\nFROM sys.server_principals sp\nLEFT JOIN sys.server_role_members srm ON sp.principal_id = srm.member_principal_id\nLEFT JOIN sys.server_principals spr ON srm.role_principal_id = spr.principal_id\nWHERE sp.type IN ('S','U','G') ORDER BY sp.name;"
      }
    ]
  },
  {
    id: "sql-agent",
    title: "SQL Server Agent",
    icon: "Clock",
    cards: [
      {
        id: "qr-check-agent",
        title: "Check Agent Status",
        syntax: "-- In SSMS: look for SQL Server Agent in Object Explorer\n-- Running = green arrow, Stopped = red square",
        description: "SQL Server Agent must be running for any scheduled jobs to execute. Set to auto-start in SQL Server Configuration Manager.",
        example: "-- Check via T-SQL:\nSELECT servicename, status_desc FROM sys.dm_server_services\nWHERE servicename LIKE 'SQL Server Agent%';"
      },
      {
        id: "qr-job-history",
        title: "Check Job History",
        syntax: "SELECT j.name, jh.run_date, jh.run_time, jh.run_status, jh.message FROM msdb.dbo.sysjobs j LEFT JOIN msdb.dbo.sysjobhistory jh ON j.job_id = jh.job_id AND jh.step_id = 0 ORDER BY jh.run_date DESC;",
        description: "Shows the last run status of all SQL Agent jobs. run_status: 0=Failed, 1=Succeeded, 2=Retry, 3=Canceled.",
        example: "-- Find failed jobs in the last 24 hours:\nSELECT j.name, jh.run_date, jh.message FROM msdb.dbo.sysjobs j\nJOIN msdb.dbo.sysjobhistory jh ON j.job_id = jh.job_id\nWHERE jh.step_id = 0 AND jh.run_status = 0\nAND jh.run_date >= CONVERT(INT, CONVERT(VARCHAR, GETDATE()-1, 112));"
      },
      {
        id: "qr-run-job",
        title: "Run a Job Manually",
        syntax: "EXEC msdb.dbo.sp_start_job @job_name = 'JobName';",
        description: "Starts a job immediately without waiting for its schedule.",
        example: "EXEC msdb.dbo.sp_start_job @job_name = 'Nightly Full Backup - Production';"
      },
      {
        id: "qr-disable-job",
        title: "Enable / Disable a Job",
        syntax: "EXEC msdb.dbo.sp_update_job @job_name = 'JobName', @enabled = 0;  -- 0=disable, 1=enable",
        description: "Disables a job without deleting it. Useful during maintenance windows.",
        example: "-- Disable during maintenance:\nEXEC msdb.dbo.sp_update_job @job_name = 'Index Maintenance', @enabled = 0;\n-- Re-enable after:\nEXEC msdb.dbo.sp_update_job @job_name = 'Index Maintenance', @enabled = 1;"
      }
    ]
  },
  {
    id: "monitoring",
    title: "Monitoring & Troubleshooting",
    icon: "Activity",
    cards: [
      {
        id: "qr-active-sessions",
        title: "Active Sessions",
        syntax: "SELECT session_id, login_name, host_name, status, cpu_time, memory_usage FROM sys.dm_exec_sessions WHERE is_user_process = 1;",
        description: "Shows all active user connections. Good first check when investigating server load.",
        example: "SELECT session_id, login_name, host_name, program_name, status,\n       cpu_time, memory_usage, total_elapsed_time / 1000 AS elapsed_sec\nFROM sys.dm_exec_sessions WHERE is_user_process = 1\nORDER BY cpu_time DESC;"
      },
      {
        id: "qr-blocking",
        title: "Find Blocking",
        syntax: "SELECT blocking_session_id, session_id, wait_type, wait_time FROM sys.dm_exec_requests WHERE blocking_session_id > 0;",
        description: "Shows which sessions are blocked and what is blocking them.",
        example: "SELECT r.session_id, r.blocking_session_id, r.wait_type,\n       r.wait_time / 1000 AS wait_sec,\n       t.text AS blocked_query\nFROM sys.dm_exec_requests r\nCROSS APPLY sys.dm_exec_sql_text(r.sql_handle) t\nWHERE r.blocking_session_id > 0;"
      },
      {
        id: "qr-disk-usage",
        title: "Database Disk Usage",
        syntax: "EXEC sp_spaceused;  -- Current database\n-- Or for all databases:",
        description: "Shows data and log file sizes and free space for a database.",
        example: "-- All files with sizes:\nSELECT DB_NAME(database_id) AS DatabaseName,\n       name AS FileName, type_desc,\n       size * 8 / 1024 AS SizeMB,\n       FILEPROPERTY(name, 'SpaceUsed') * 8 / 1024 AS UsedMB\nFROM sys.master_files ORDER BY database_id, type;"
      },
      {
        id: "qr-error-log",
        title: "Read Error Log",
        syntax: "EXEC sp_readerrorlog 0, 1, 'search_term';",
        description: "Reads the SQL Server error log. First param: 0=current, 1=previous. Third param: optional search string.",
        example: "-- Find errors in current log:\nEXEC sp_readerrorlog 0, 1, 'Error';\n-- Find login failures:\nEXEC sp_readerrorlog 0, 1, 'Login failed';"
      }
    ]
  }
];
