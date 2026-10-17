# Section 7 — SQL Server Instances: DBA Interview Questions

## Quick refresher

**Installation order:** Virtual Machine (VM) → Operating System (OS) → SQL Server Database Engine (instance created during setup) → SQL Server Management Studio (SSMS).

During SQL Server Setup, choose **New SQL Server stand-alone installation**, select Database Engine Services, and configure an instance under **Instance Configuration**. SSMS is a separate management application, not an instance.

## Interview questions and answers

### Q1. What is a SQL Server instance?
An instance is an independently managed installation of the SQL Server Database Engine with its own system databases, services, configuration, and server-level security.

### Q2. What is the difference between a default instance and a named instance?
A machine can have **one default instance** (internal instance name `MSSQLSERVER`), reached as `SERVER01`, and additional **named instances**, reached as `SERVER01\\SQL2022`.

### Q3. How many SQL Server instances can be installed on one machine?
For typical SQL Server installations, the supported maximum is **50 instances: one default plus up to 49 named instances**, provided the edition and system resources permit.

### Q4. Where is an instance created during installation?
In SQL Server Installation Center, choose **New SQL Server stand-alone installation**, select Database Engine Services, then choose **Default instance** or **Named instance** on the **Instance Configuration** screen. Completing setup creates the instance.

### Q5. Why would a DBA create multiple instances on one server?
To separate workloads and allow independent server-level security, configuration, SQL Server versions, services, and maintenance. Example: `SERVER01\\DEV` and `SERVER01\\TEST`.

### Q6. Why use separate instances instead of separate databases in one instance?
Databases within one instance share instance-level services and settings. Separate instances provide greater isolation and permit different SQL Server versions and instance-level configuration. However, both instances still share the host VM's CPU, RAM, disks, and OS.

### Q7. Can you restart one SQL Server instance without restarting the others?
Yes. Instances have separate Database Engine services. Restarting one instance's service generally does not restart other instances, although host-level restarts or shared dependencies can affect all.

### Q8. Can different SQL Server versions run on the same VM?
Yes, supported SQL Server versions can be installed side by side as separate instances, subject to Microsoft compatibility and OS requirements.

### Q9. Is SSMS an instance?
No. **SSMS is a client management tool.** One SSMS installation can connect to and administer many SQL Server instances.

### Q10. Does installing multiple instances fully isolate production from testing?
No. Instances have separate SQL Server services and configurations but still compete for the same VM hardware resources. For stronger production isolation, separate VMs or hosts are preferable.

## Interview memory line
**VM → OS → SQL Server (instance) → SSMS.** An instance is **not** a database, and SSMS is **not** an instance.
