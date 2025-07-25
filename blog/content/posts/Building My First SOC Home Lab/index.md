---
title: "Building My First SOC Home Lab: From Zero to Threat Hunting"
description: "A personal journey and step-by-step guide to setting up a functional Security Operations Center (SOC) home lab using a mix of physical and virtual machines."
categories: ["Tutorial", "Security", "HomeLab"]
tags: ["SOC", "Splunk", "VirtualBox", "ThreatHunting", "BlueTeam"]
date: 2024-10-19
---

In cybersecurity, theory can only take you so far. Reading about threat detection is one thing; actually building the system that finds the threat is another entirely. As an aspiring security professional, I knew I needed to get hands-on. I needed to move beyond textbooks and into a real, functioning environment where I could see attacks happen and, more importantly, learn how to catch them.

So, I decided to build my own Security Operations Center (SOC).

This article is my personal journey and a step-by-step guide on how I built a SOC home lab from scratch. My goal wasn't just to install some software; it was to create a realistic, hybrid corporate network where I could simulate attacks, centralize logs, and hunt for threats using industry-standard tools. If you've been wanting to do the same, I hope my experience can give you a clear roadmap.

### The Vision: A Realistic Hybrid Network

My plan was to create a small network with a dedicated "Security Server" acting as the brain. To make the simulation as realistic as possible, I decided to use a mix of physical and virtual machines. This hybrid approach mirrors many real-world corporate environments.

Here was my lab architecture:

   ```
    +---------------------+          +-----------------------+          +-------------------+
    | Windows Server 22 vm|          | Kali Linux (VM)       |          | Windows 10 (VM)   |
    | 192.168.0.150       |<-------->| 192.168.0.130         |<-------->| 192.168.0.120     |
    +---------------------+          +-----------------------+          +-------------------+
                                                ^
                                                |
                                                v
                                 +--------------------------------+
                                 |  Windows 11 (Splunk Enterprise)|
                                 |  192.168.0.196 (Receiver)      |
                                 +--------------------------------+
                                                ^
                                                |
                                                |
                                                v
                                      +------------------+
                                      | Windows 10       |
                                      | 192.168.0.131    |
                                      +------------------+
                   (All forward logs to the Windows 11 machine running Splunk)

```

-   **The SOC Server (Log Receiver):** My physical Windows 11 desktop, running **Splunk Enterprise**
-   **The Endpoint Fleet (Log Sources):**
    -   A **Windows Server 2022 VM** (Virtual)
    -   A **Windows 10 VM** (Virtual)
    -   A **Kali Linux VM** (Virtual, to act as both an endpoint and an attacker)
    -   Another **physical Windows 10 laptop**

All these devices, both physical and virtual, would be configured to forward their system and security logs to my central Splunk instance.

### Step 1: Building the Endpoints (Physical & Virtual)

First, I needed to create the virtual part of my fleet. I chose **VirtualBox** because it's free, powerful, and easy to use.

1.  **Create the VMs:** I downloaded the ISOs for Windows Server, Windows 10, and Kali Linux and created a new virtual machine for each one.
2.  **Network Configuration is Key:** This is the most important part for enabling communication. I set the network mode for each VM to **"Bridged Adapter."** This makes the VMs act like separate physical machines on my home network, allowing them to get their own IP addresses and communicate directly with my physical Splunk server.
3.  **Assign Static IPs:** To keep things predictable for log forwarding, I assigned static IPs to each machine (both virtual and physical) on my `192.168.0.x` subnet.

With this, my hybrid corporate network was born.

### Step 2: Setting Up the Brain - Splunk Enterprise

Next, I installed Splunk Enterprise on my main physical Windows 11 machine. The installation is a straightforward wizard. The critical post-install step is configuring Splunk to listen for incoming logs.

In the Splunk Web UI (at `http://localhost:8000`):
1.  Go to **Settings > Forwarding and Receiving**.
2.  Under **Configure Receiving**, I clicked **"New Receiving Port"** and enabled port `9997`.

This tells Splunk, "Be ready to accept log data on TCP port 9997." My SOC server was now ready to listen.

### Step 3: Getting the Logs Flowing with the Universal Forwarder

A SIEM is useless without data. To get logs from all my endpoints to the Splunk server, I used the **Splunk Universal Forwarder**. This is a lightweight agent that you install on each machine you want to monitor.

**For my Windows Fleet (Physical & Virtual):**
I followed the same process on my Windows Server VM, my Windows 10 VM, and my physical Windows 10 laptop.
1.  I installed the Universal Forwarder, and during the setup wizard, I pointed it to my Splunk server's IP address (`192.168.0.196`) and receiving port (`9997`).
2.  After installation, I opened a Command Prompt as an Administrator and ran a few simple commands to tell the forwarder *what* to send:
    ```bash
    # Navigate to the forwarder's bin directory
    cd "C:\Program Files\SplunkUniversalForwarder\bin"
    
    # Tell it which logs to monitor
    splunk add monitor WinEventLog://Security
    splunk add monitor WinEventLog://System
    
    # Restart the forwarder to apply changes
    splunk restart
    ```

**For my Kali Linux VM:**
The process was similar but used Linux commands. After installing the `.deb` package for the forwarder:
```bash
# Navigate to the forwarder's bin directory
cd /opt/splunkforwarder/bin/

# Point it to the Splunk server (with auth for Linux)
sudo ./splunk add forward-server 192.168.0.196:9997 -auth admin:yourpassword

# Tell it to monitor the system log file
sudo ./splunk add monitor /var/log/syslog

# Restart the forwarder
sudo ./splunk restart
```

### Step 4: The Moment of Truth - Verifying Log Flow

With everything configured, it was time to see if it worked. I logged into my Splunk server and navigated to the **Search & Reporting** app. I typed in a simple, powerful search query:

```splunk
index=* | stats count by host, sourcetype
```

Success! The search results showed a table with event counts from each of my hosts, both physical and virtual, and the different log types (`WinEventLog:Security`, `linux_syslog`). The data was flowing. My SOC was alive.

### Step 5: From Monitoring to Threat Hunting

Now for the fun part. With the logs centralized, I could finally start hunting for threats. I decided to simulate a common attack: a brute-force login attempt.

1.  **The "Attack":** On my Kali machine, I tried (and failed) to log into my Windows Server machine via RDP multiple times with incorrect passwords.
2.  **The Hunt:** In Splunk, I knew that failed Windows logins generate `EventCode=4625`. I wrote a simple Splunk Processing Language (SPL) query to find this activity:

    ```splunk
    index=windows sourcetype="WinEventLog:Security" EventCode=4625 
    | stats count by user, src_ip
    | where count > 5
    ```

    This query looks for failed logins, groups them by the user and source IP, and shows me any attempts that happened more than five times. Instantly, my "attack" from the Kali IP address appeared on the screen.

I then saved this search as a real-time **Alert**. Now, my SOC will automatically notify me anytime this pattern occurs. I had gone from zero to having an automated brute-force detection rule.

### A Foundation to Build On

This home lab is just the beginning. My next steps are to integrate a network intrusion detection system like Suricata and to start mapping my detection rules to the MITRE ATT&CK framework.

Building this lab was one of the most rewarding learning experiences I've ever had. It demystified how a SOC works and gave me a sandbox to safely test, break, and fix things. If you want to dive deeper into the technical details, firewall rules, and troubleshooting steps, feel free to check out my full project documentation on [GitHub](https://github.com/NaolMengistu/SOC-Lab).

You don't need an enterprise budget to learn enterprise skills. All you need is a bit of curiosity, a few open-source tools, and the willingness to build.