---
title: "Building an Enterprise Sysadmin Home Lab: A Hands-On Learning Environment"
description: "Learn how to build a production-grade virtualized lab environment that teaches network security, identity management, Linux administration, and defensive security operations using pfSense, Active Directory, Suricata IDS/IPS, and penetration testing tools."
categories: ["Sysadmin", "Security", "Tutorial"]
tags: ["pfSense", "Active Directory", "Suricata", "Kali Linux", "VirtualBox", "Home Lab", "IDS/IPS", "Network Security"]
date: 2025-12-02
---

Building technical skills in system administration and security operations requires more than reading documentation, you need a safe environment where you can break things, test configurations, and simulate real attacks without consequences. This home lab creates exactly that: a virtualized enterprise network that mirrors production environments you'll encounter as a sysadmin or security analyst.

## Why build this lab?

The gap between theoretical knowledge and practical ability is wide in IT security and system administration. This lab bridges that gap by providing hands-on experience with technologies that appear in nearly every job description: enterprise firewalls, Windows Active Directory, Linux server administration, intrusion detection systems, and security testing. You'll understand how these pieces fit together, how a firewall rule affects Active Directory authentication, or how Suricata alerts correlate with Kali's scanning activity.

More importantly, you gain **documented, verifiable experience**. The screenshots, configurations, and automation scripts from this project become portfolio pieces that demonstrate practical competency to employers. When you say you've deployed a Domain Controller or configured an IDS/IPS system, you'll have proof and the troubleshooting stories to back it up.

## Lab architecture

The environment simulates a small enterprise with clear network segmentation and role separation, all running on a single host via VirtualBox with an isolated internal network.

### Network topology

```
                             [ Internet ]
                                  |
                     [ pfSense Firewall ] (IDS/IPS)
                           WAN: 10.0.2.x (NAT)
                           LAN: 10.0.0.1/24
                                  |
                                  |
       ┌────────────┬─────────────┬────────────┬─────────────┐
       |            |             |            |             |
   [ Windows    [ Ubuntu       [ Kali       [ Win10       [ Laptop 2 ]
     Server ]     Server ]       Linux ]      Client ]      Client ]
   (AD/DNS)      (Web/SMB)      (Testing)    (Domain)     (Domain)
   10.0.0.10     10.0.0.20      10.0.0.30    DHCP         10.0.0.50
```

**Domain:** `soc.lab`  
**Network:** Internal (`intnet`)  
**Subnet:** `10.0.0.0/24`

This design isolates all virtual machines from your host system, allowing you to safely experiment with network changes, firewall rules, and even simulate attacks.

### Virtual machines

| System            | Role                          | IP Address          | OS                  | Resources        |
|-------------------|-------------------------------|---------------------|---------------------|------------------|
| pfSense           | Firewall, Router, IDS/IPS     | 10.0.0.1            | FreeBSD (pfSense)   | 2 GB RAM, 2 vCPU |
| Windows Server    | Domain Controller, DNS        | 10.0.0.10           | Windows Server 2022 | 4 GB RAM, 2 vCPU |
| Ubuntu Server     | Web server, File server       | 10.0.0.20           | Ubuntu 22.04 LTS    | 2 GB RAM, 2 vCPU |
| Windows 10 Client | Domain-joined workstation     | DHCP (10.0.0.100+)  | Windows 10          | 2 GB RAM, 2 vCPU |
| Kali Linux        | Penetration testing platform  | 10.0.0.30           | Kali Linux          | 2 GB RAM, 2 vCPU |

Total resource requirements: approximately 16 GB RAM, 6+ CPU cores, and 100 GB disk space.

## Core technologies and skills

### Network infrastructure with pfSense

You'll configure a production-grade firewall from scratch, setting up WAN and LAN interfaces, defining firewall rules, configuring DHCP and DNS forwarding, and implementing network segmentation. pfSense serves as your network's perimeter defense and provides the platform for Suricata IDS/IPS integration. The initial interface assignment happens via console, then you manage everything through the web dashboard.

### Windows Server and Active Directory

Installing and promoting a Domain Controller teaches you the foundation of enterprise identity management. The lab emphasizes proper organizational structure, instead of dumping users into the default containers, you create custom Organizational Units like `IT_Department` to mirror real corporate hierarchies.

User provisioning can be done manually through Active Directory Users and Computers, or automated using PowerShell. The repository includes a [bulk user creation script](https://github.com/NaolMengistu/Sysadmin-Home-Lab/blob/main/scripts/create-ad-users.ps1) that checks for existing accounts and creates users in the target OU with error handling, exactly the kind of automation sysadmins write in production environments.

Running `whoami` on a domain-joined Windows 10 client and seeing `soc\username` confirms your entire authentication infrastructure is working: DNS resolution, Kerberos authentication, and domain trust relationships.

### Linux system administration

Configuring Ubuntu Server builds your skills with Netplan for static IP addressing, Apache for web services, and Samba for SMB file sharing. You'll see how Linux services integrate with Windows clients, accessing an Apache web page from Internet Explorer and mapping a Samba share as a network drive demonstrates real cross-platform interoperability.

The repository provides automation scripts for consistent deployment: a [Netplan configuration template](https://github.com/NaolMengistu/Sysadmin-Home-Lab/blob/main/scripts/ubuntu-netplan-config.yaml) and [Samba configuration file](https://github.com/NaolMengistu/Sysadmin-Home-Lab/blob/main/scripts/samba-smb.conf) you can deploy with the included shell scripts.

### Intrusion detection and prevention with Suricata

Deploying Suricata on pfSense teaches you how IDS/IPS systems work in practice. You'll configure rulesets, analyze alerts, and understand the difference between detection (IDS) and prevention (IPS) modes.

Testing with `curl http://testmyids.com` from Kali triggers a `GPL ATTACK_RESPONSE` alert, showing you exactly how signature-based detection identifies suspicious traffic. Switching to IPS mode lets you see automated blocking in action, the firewall drops subsequent packets from the offending source IP.

### Security testing with Kali Linux

Running Nmap scans, service enumeration, and reconnaissance teaches you how attackers gather information about networks. When you scan the Ubuntu server and identify Apache 2.4.58, you're learning both offensive techniques and how to interpret the defensive alerts those techniques generate on the Suricata side.

## Practical scenarios

The lab demonstrates five end-to-end workflows that tie infrastructure and security together:

### 1. Domain authentication and DNS integration

Join the Windows 10 client to the `soc.lab` domain, verifying that DNS resolution against the Domain Controller works correctly. Log in as a standard domain user and confirm authentication with `whoami`, this validates your entire Kerberos and Active Directory infrastructure.

### 2. Cross-platform web access

Configure Ubuntu with a static IP using Netplan, install Apache, and serve a test page. Access the Ubuntu-hosted site from the domain-joined Windows 10 client to validate routing, DNS resolution, and HTTP connectivity across your network.

### 3. File sharing between Linux and Windows

Set up a Samba share on the Ubuntu server with proper permissions. Map the share as a network drive from Windows 10 to demonstrate how Linux file servers support Windows clients in mixed environments.

### 4. IDS alert generation and analysis

Configure Suricata on pfSense and run `curl http://testmyids.com` from Kali to intentionally trigger detection alerts. This controlled test shows you what malicious traffic looks like from both the attacker and defender perspectives.

### 5. IPS automatic blocking

Switch Suricata into IPS mode and repeat suspicious activities from Kali. Watch as the firewall automatically blocks the Kali IP address, demonstrating automated threat response.

## Building the lab step-by-step

### Prerequisites

- **Hardware**: At least 16 GB RAM, 6+ CPU cores, approximately 100 GB free disk space
- **Software**: Oracle VirtualBox (or VMware/Hyper-V), ISO images for Windows Server 2022, Windows 10, Ubuntu Server 22.04, pfSense CE, and Kali Linux

### Quick start

The repository includes [detailed step-by-step documentation](https://github.com/NaolMengistu/Sysadmin-Home-Lab/tree/main/docs) covering every phase:

1. **[VirtualBox networking setup](https://github.com/NaolMengistu/Sysadmin-Home-Lab/blob/main/docs/01-virtualbox-networking.md)**: Create an internal network named `intnet` and attach all LAN interfaces
2. **[pfSense configuration](https://github.com/NaolMengistu/Sysadmin-Home-Lab/blob/main/docs/02-pfsense-setup.md)**: Deploy with one NAT adapter (WAN) and one internal adapter (LAN), set LAN IP to `10.0.0.1`, configure DHCP
3. **[Windows Server deployment](https://github.com/NaolMengistu/Sysadmin-Home-Lab/blob/main/docs/03-windows-server-setup.md)**: Assign static IP `10.0.0.10`, install AD DS and DNS, promote to Domain Controller for `soc.lab`
4. **[Ubuntu Server setup](https://github.com/NaolMengistu/Sysadmin-Home-Lab/blob/main/docs/07-ubuntu-server-setup.md)**: Configure Netplan for static IP `10.0.0.20`, install Apache and Samba
5. **[Client deployment](https://github.com/NaolMengistu/Sysadmin-Home-Lab/blob/main/docs/04-windows10-domain-join.md)**: Join Windows 10 to the domain, configure [Kali with static IP](https://github.com/NaolMengistu/Sysadmin-Home-Lab/blob/main/docs/05-kali-linux-setup.md) `10.0.0.30`
6. **[Suricata IDS/IPS](https://github.com/NaolMengistu/Sysadmin-Home-Lab/blob/main/docs/06-suricata-ids-setup.md)**: Enable on pfSense, configure rulesets, test detection with controlled attacks

Each guide includes command-by-command instructions, configuration screenshots, and troubleshooting tips for common issues.

## Automation and operational tooling

Real sysadmins automate repetitive tasks. The lab includes PowerShell and shell scripts that demonstrate this mindset:

- **[create-ad-users.ps1](https://github.com/NaolMengistu/Sysadmin-Home-Lab/blob/main/scripts/create-ad-users.ps1)**: Bulk user provisioning with duplicate checking
- **[ad-health-check.ps1](https://github.com/NaolMengistu/Sysadmin-Home-Lab/blob/main/scripts/ad-health-check.ps1)**: Domain Controller health monitoring
- **[backup-ad-users.ps1](https://github.com/NaolMengistu/Sysadmin-Home-Lab/blob/main/scripts/backup-ad-users.ps1)**: Export user accounts for disaster recovery
- **[lab-network-test.sh](https://github.com/NaolMengistu/Sysadmin-Home-Lab/blob/main/scripts/lab-network-test.sh)**: Automated connectivity testing across all systems

These aren't just educational examples, they're production-quality scripts with error handling, logging, and idempotent operations.

## Why this matters for your career

This lab gives you verifiable experience with technologies in nearly every IT and security job description. You'll be able to speak confidently about implementing network segmentation, managing domain services, deploying intrusion detection systems, and conducting security assessments, because you've actually done it.

The troubleshooting experience you gain is equally valuable. Fixing DNS issues, debugging firewall rules, resolving authentication problems, and diagnosing network connectivity failures builds the problem-solving skills that separate junior technicians from experienced professionals. When an interviewer asks "Tell me about a time you troubleshooted a complex network issue," you'll have real stories to share.

## Extending the lab

Once the core environment is running, consider these additions:

- Deploy a SIEM (Security Information and Event Management) system like Splunk to centralize logs from all systems
- Add vulnerability scanning with OpenVAS or Nessus
- Implement Group Policy Objects (GPOs) for centralized Windows management
- Configure VLANs to segment the network further (guest network, server VLAN, user VLAN)
- Set up patch management with WSUS for Windows or Landscape for Ubuntu
- Deploy additional Linux services like BIND (DNS), ISC DHCP, or OpenLDAP

The repository also links to a complementary [SOC Analyst Home Lab](https://github.com/naolmengistu/SOC-Lab) focused on SIEM operations with Splunk Enterprise, demonstrating how infrastructure management and security operations connect in real environments.

## Final thoughts

Building this lab takes time, expect to about 10 hours for the initial setup and another 10-20 experimenting with configurations and scenarios. But that investment yields returns far beyond a single project. You'll develop muscle memory for commands, understand how enterprise networks actually work, and build confidence in your ability to deploy and troubleshoot production systems.

Start with the [VirtualBox networking guide](https://github.com/NaolMengistu/Sysadmin-Home-Lab/blob/main/docs/01-virtualbox-networking.md), take it one step at a time, and don't be afraid to break things, that's what snapshots are for. Every error message is a learning opportunity, and every successfully authenticated domain login is a small victory that proves your infrastructure works.

The full documentation, automation scripts, and configuration files are available in the [GitHub repository](https://github.com/NaolMengistu/Sysadmin-Home-Lab). Happy building!