---
title: "Pen-Testing 101: From Nmap Scan to Meterpreter Shell"
description: "A beginner's guide to the phases of a penetration test, using Nmap, OpenVAS, and Metasploit to go from initial reconnaissance to a full system compromise."
categories: ["Tutorial", "Security", "Hacking"]
tags: ["PenTesting", "Nmap", "Metasploit", "OpenVAS", "RedTeam", "BlueTeam"]
date: 2023-12-05
---

To be a great defender, you have to learn to think like an attacker. Understanding the tools and methodologies used to compromise a system is one of the most effective ways to build a robust defense. The best way to learn this is by doing it in a safe, controlled lab environment.

As part of my Information Security coursework, I conducted a series of penetration tests against vulnerable virtual machines. This article is a beginner-friendly walkthrough of that process, distilled into the three core phases of any ethical hack: **Reconnaissance**, **Vulnerability Scanning**, and **Exploitation**.

Our mission: To start with nothing but an IP address and end with a full-access command shell on the target machine.

### Our Lab Setup

-   **The Attacker:** A Kali Linux virtual machine, pre-loaded with all the necessary security tools.
-   **The Target:** A deliberately vulnerable VM (in this case, Metasploitable 2 and a Windows VM) running on the same network.

> **Ethical Hacking Disclaimer:** All activities described here were performed in an isolated, private lab environment against machines I had explicit permission to attack. Never attempt these techniques on any network or system you do not own.

### Phase 1: Reconnaissance - Mapping the Terrain with Nmap

The first step of any attack is to figure out what you're up against. You can't attack a target you can't see. This phase is all about mapping the digital landscape. Our primary tool for this is **Nmap** (Network Mapper).

I started by running a simple but powerful Nmap scan from my Kali machine against my Windows target's IP address:

```bash
nmap -T4 -A -v 10.11.202.174
```
-   `-T4`: Sets a more aggressive timing template for a faster scan.
-   `-A`: Enables OS detection, version detection, script scanning, and traceroute. It's the "give me all the info" flag.
-   `-v`: Verbose mode, which gives us more real-time feedback.

The results came back quickly, giving me my first crucial pieces of intelligence:

```
PORT      STATE SERVICE
80/tcp    open  http        PMSoftware Simple Web Server 2.2
135/tcp   open  msrpc       Microsoft Windows RPC
139/tcp   open  netbios-ssn Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds
12345/tcp open  netbus      NetBus trojan 1.70

Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
```
**The Takeaway:** In just a few seconds, I knew I was dealing with a Windows machine. More importantly, I had a list of open doors (ports) and the services running behind them. I saw a web server on port 80, standard Windows services, and something very interesting on port 12345: a known trojan. This gave me multiple potential avenues for an attack.

### Phase 2: Vulnerability Scanning - Finding the Weak Spot with GVM (OpenVAS)

Just because a port is open doesn't mean it's vulnerable. The next step is to take the list of services we found and cross-reference them with a massive database of known exploits. For this, I used **Greenbone Vulnerability Management (GVM)**, the open-source successor to OpenVAS.

I configured GVM to run a full scan against my other target, the Metasploitable 2 VM. After the scan completed, the report was a goldmine of critical flaws. One finding, in particular, stood out with a maximum severity score of 10.0:

> **Vulnerability:** Distributed Ruby (dRuby/DRb) Multiple Remote Code Execution Vulnerabilities
>
> **Summary:** The remote rexec service is running. This allows unauthenticated users to execute arbitrary code.

**The Takeaway:** This is the golden ticket. GVM didn't just find a potential weakness; it found a known, critical **Remote Code Execution (RCE)** vulnerability. This means there's a high probability that I can use this flaw to run my own commands directly on the server.

### Phase 3: Exploitation - Getting a Shell with Metasploit & Armitage

Now it's time to act. We have our target and our specific vulnerability. The final step is to use an **exploit** to gain access. The undisputed king of exploitation frameworks is **Metasploit**. To make it more user-friendly, I used **Armitage**, its graphical front-end.

The process was methodical:
1.  **Launch Armitage:** This connects to the Metasploit database in the background.
2.  **Add Host:** I added the IP address of my Metasploitable target.
3.  **Find Exploit:** I searched through Metasploit's massive library of exploits for "dRuby" and quickly found the one that matched the GVM finding.
4.  **Configure and Launch:** I double-clicked the exploit, set the `RHOSTS` (Remote Host) option to my target's IP address, and clicked "Launch."

After a few seconds, the magic happened. The computer icon for my target in the Armitage interface turned **bright red with lightning bolts**, the visual confirmation of a successful compromise.

I had gained access. Now, the goal was to get an interactive shell. I right-clicked the compromised host and selected **`Meterpreter Shell`**.

A new tab opened with the prompt I was looking for:
```
meterpreter > 
```
I was in. The Meterpreter shell is an advanced, in-memory payload that gives an attacker incredible control over the victim machine. To prove my access, I ran a simple command:

```
meterpreter > mkdir NaolM
Creating directory: NaolM
meterpreter > 
```
I had created a folder on the remote machine's file system from my attacker machine. I had full control.

### Conclusion: The Defender's Mindset

This walkthrough is a simplified example, but it perfectly illustrates the attacker's methodology. It's not random guesswork; it's a systematic process of **mapping, identifying, and exploiting** a specific, known weakness.

By understanding this process, we as defenders know exactly where to focus our efforts.
-   We know to **minimize our attack surface** by closing unnecessary ports (Phase 1).
-   We know to **run our own vulnerability scans** to find and patch flaws like the dRuby vulnerability before an attacker does (Phase 2).
-   We know to **monitor our logs** for the signs of compromise, like suspicious shell activity or the creation of strange new directories (Phase 3).

Learning to think like an attacker isn't about becoming one. It's about building a proactive, intelligent defense that anticipates their next move.