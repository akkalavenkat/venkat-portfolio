---
title: "The problem of executing untrusted code"
date: "2026-03-28"
excerpt: "Running arbitrary user-submitted code safely is harder than it looks. A walkthrough of the threat model and the approaches — static analysis, Security Manager, Unix accounts, sandboxing, and full VM isolation — and why each one falls short until you go far enough."

tags: "java,security,virtualization,system-design"
source: "original"
---

When I built the automated grading backend for my Master's thesis in 2015, the core engineering problem wasn't "how do I compile Java code." It was: how do I let a stranger's code run on my server without trusting it at all?

This is a problem online judges (LeetCode, HackerRank, Codeforces) deal with at scale today. At the time, most academic automated graders simply didn't — they executed student submissions directly on the host, accepted the risk, and hoped for the best. Hollingsworth noticed this as early as 1960: "it was possible for a student to submit a program that would cause deliberate damage to the grader software." Decades later, the research field had largely ignored it.

This post walks through the threat model and each approach I evaluated before landing on full VM-per-user isolation. Most of these trade-offs still apply if you're building any system that executes user-supplied code.

## The threat model

The threats aren't hypothetical. Give students a code editor and an execute button, and sooner or later you'll see:

- **Infinite loops** — code that runs forever, monopolising CPU
- **Memory exhaustion** — allocating as much heap as the JVM will allow
- **File system attacks** — reading, overwriting, or deleting files on the host
- **Fork bombs** — spawning threads or processes recursively until the host is unusable
- **Network probing** — opening sockets to internal services the student should never reach
- **Inter-tenant attacks** — if isolation is shared, reaching a neighbouring student's environment

The last one is subtle. Even if you restrict the host, if students share an execution environment, one student's code can interfere with another's results, or worse, read their submissions.

## Approach 1: Static analysis

The first instinct is to inspect the code before running it. Reject anything that looks dangerous.

```java
// Reject if source contains these patterns
List<String> forbidden = List.of(
    "System.exit", "Runtime.exec", "ProcessBuilder",
    "File", "FileWriter", "Socket", "Thread"
);
```

This fails immediately in practice. Static pattern matching on source code is trivially bypassed using reflection, dynamic class loading, or simply obfuscating the call. More fundamentally, static analysis cannot reason about runtime behaviour — a loop that terminates normally on small inputs may run indefinitely on the test input the grader uses.

Static analysis is useful as a first-pass signal or for style checking (Checkstyle, SpotBugs), but it is not a security control.

## Approach 2: Java Security Manager

The JVM's Security Manager (deprecated in Java 17, removed in Java 21) allowed you to install a policy that intercepted privileged operations — file I/O, network access, process creation — and enforced a permit/deny decision at runtime.

```java
System.setSecurityManager(new SecurityManager() {
    @Override
    public void checkWrite(String file) {
        throw new SecurityException("File writes not permitted");
    }

    @Override
    public void checkConnect(String host, int port) {
        throw new SecurityException("Network access not permitted");
    }
});
```

This looks appealing. It's lightweight, operates at the JVM level, and requires no infrastructure.

The problems:

1. **Policy completeness** — the Security Manager has dozens of permission types. A misconfigured or incomplete policy leaves holes. Getting it right requires deep JVM internals knowledge, and the attack surface is large.
2. **Same-process execution** — the student code runs in the same JVM as the grader. A sufficiently creative exploit (native code via JNI, reflection to disable the Security Manager itself) could escape.
3. **No resource limits** — Security Manager controls access permissions, not CPU time or memory allocation. An infinite loop still locks the thread; a large allocation still triggers an OOM.
4. **Deprecated for a reason** — Oracle removed it because it was too complex to use correctly and too easy to misconfigure.

Useful as a defence-in-depth layer, not a primary control.

## Approach 3: Unix accounts

The Unix permission model gives you a cheaper form of isolation: run each submission as a separate OS user with restricted permissions.

```bash
# Create a restricted user for this submission
useradd -M -s /bin/bash student_run_42
su -s /bin/bash student_run_42 -c "java -cp /submissions/42 Main"
```

Combined with `ulimit` for CPU and memory bounds:

```bash
ulimit -t 10       # 10 seconds CPU
ulimit -v 262144   # 256MB virtual memory
ulimit -f 0        # No file creation
```

This is meaningfully stronger than Security Manager. Kernel-enforced process isolation means the student cannot affect other users' files or processes (assuming correct permissions). Resource limits apply at the OS level regardless of what the code does internally.

The remaining problems:

- A single compromised host is still a compromised host. If the student finds a kernel exploit or escalates privileges, they own the machine and all other student environments on it.
- All submissions share the same kernel, network stack, and OS resources.
- `ulimit` limits are per-process, not per-submission tree — a fork bomb can still spin up child processes before hitting the limit.

For a university setting this might be acceptable. For anything at scale, or where the host machine has value beyond the grading task itself, it is not sufficient.

## Approach 4: Full VM isolation

The approach the thesis ultimately implemented: each student gets a dedicated virtual machine, cloned from a known-good base image on demand.

```text
[Moodle Plugin]
     |
     | REST API call
     v
[VM Management API]  ←→  [Oracle VirtualBox SDK]
     |
     | SSH
     v
[SliTaz Linux VM — per student]
     └── Java compiler + runtime only
```

The VM is minimal — SliTaz Linux, a 30MB distribution, with only the Java toolchain installed. No other services, no network routes to internal infrastructure, no shared file system with the host or other VMs.

The REST API handled the lifecycle:

```http
POST /vm/clone          → clone base image, assign to student
POST /vm/{id}/start     → boot the VM
POST /vm/{id}/execute   → SSH in, write source, compile, run, return output
POST /vm/{id}/stop      → shut down
DELETE /vm/{id}         → delete clone
```

![Deployment layout from the thesis — Moodle platform, VirtualBox host running vBoxWebSrv, and isolated SliTaz Linux VMs as separate machines on the same intranet](/images/blog/DeploymentDiagram.png)

The security guarantee is simple: even if student code completely destroys the VM — deletes every file, corrupts the OS, fills the disk — the damage is contained to that one ephemeral clone. The host is unaffected. Other students are unaffected. Clone a new one and continue.

This is the same model online judges use today, now typically implemented with containers (Docker, gVisor) or microVMs (Firecracker) instead of full VMs. The 2015 thesis noted Docker as the natural next step in the future work section — at the time it was too new to rely on.

## The trade-off table

| Approach               | CPU/memory limits | File system isolation | Host protection | Per-user isolation | Overhead |
| ---------------------- | ----------------- | --------------------- | --------------- | ------------------ | -------- |
| Static analysis        | No                | No                    | No              | No                 | Minimal  |
| Security Manager       | No                | Partial               | Partial         | No                 | Low      |
| Unix accounts + ulimit | Yes               | Yes                   | Partial         | No                 | Low      |
| Full VM / container    | Yes               | Yes                   | Yes             | Yes                | High     |

The progression is clear: each step closes more of the threat model at the cost of more infrastructure complexity.

## What I'd do today

The same layered architecture, but with containers replacing VMs at the execution layer:

- **gVisor** (Google's sandboxed container runtime) or **Firecracker** microVMs for kernel-level isolation without full VM overhead
- **cgroups v2** for hard CPU and memory limits per execution
- A short-lived container per submission (not per user), recycled after each run
- Network namespace isolation to block all egress by default
- Read-only root filesystem with a small writable `/tmp` mount, discarded after execution

The Moodle plugin and REST API abstraction from the thesis still applies — the execution layer is just swapped out beneath the API contract.

The core lesson holds: if you are executing code you don't trust, the only safe boundary is one that the attacking code cannot reach across. That boundary needs to be enforced by the kernel or hypervisor, not the runtime you are executing the code inside.
