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

## Class Notes — October 17, 2026: Launching SSMS and connection troubleshooting

### Q11. After installing SQL Server and SSMS on a VM, which program do you open?
Log in to the VM and launch **SQL Server Management Studio (SSMS)** from the Start menu, not SQL Server Installation Center. The SQL Server Database Engine normally runs as a Windows service. In SSMS, choose the server/instance name and connect (e.g., `localhost` for a local default instance or `localhost\\SQL2022` for a named instance).

### Q12. How can you tell which SSMS version is opening, before connecting?
Read the small version label on the **bottom-left of the SSMS splash screen**. The classroom screenshot showed **v20.2.1**. After launching, **Help → About** also provides the SSMS version. This is separate from the SQL Server Database Engine version.

### Q13. What does 'A connection was successfully established with the server, but then an error occurred during the login process ... The certificate chain was issued by an authority that is not trusted' mean?
The network connection to SQL Server succeeded, but encrypted-connection certificate validation failed because the server's certificate chain was not trusted by the SSMS client. It does **not** mean SSMS or the Database Engine needs reinstalling.

### Q14. How did we resolve the certificate trust error in our training VM?
In SSMS, dismiss the error → return to **Connect to Server** → open **Options >>** → find **Trust server certificate** (under Connection Properties or the relevant connection/security tab depending on the SSMS version) → enable it → try **Connect** again. This bypasses certificate-chain validation and is suitable only when you knowingly trust the training server; it is **not** the preferred production fix.

### Q15. What is the correct fix for a SQL Server certificate trust issue in production?
Configure SQL Server to present a valid TLS certificate matching the server name, with a certificate chain trusted by the connecting clients. Do not routinely bypass certificate validation in production.

**Today's memory line:** Launch SSMS → read its version on the splash screen → connect to SQL Server → if certificate-chain validation fails in a trusted lab, select *Trust server certificate*.
