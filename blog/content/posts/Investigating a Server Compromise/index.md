---
title: "Correlating Network and Host Evidence: Investigating a Server Compromise"
description: "A case study in digital forensics, demonstrating how to correlate network traffic (PCAP) and host-based evidence (disk image) to build a complete picture of a server attack."
categories: ["CaseStudy", "Forensics", "IncidentResponse"]
tags: ["DFIR", "Wireshark", "Autopsy", "BlueTeam", "PCAP"]
date: 2024-03-30
---

In digital forensics and incident response (DFIR), evidence rarely comes in a neat package. An attack leaves traces across multiple systems, from network routers to the hard drive of a compromised server. The true skill of an investigator is not just in analyzing a single piece of evidence, but in correlating these disparate data points to reconstruct the complete attack timeline.

As part of my Master's coursework, I was presented with a classic incident response scenario: an alert from a national CERT about a suspected intrusion on a development server. I was given two pieces of evidence:

1.  A network traffic capture file: `haisy_4000.pcap`
2.  A raw disk image of the compromised Linux server: `haisy.raw`

This article is a walkthrough of that investigation. It demonstrates how, by pivoting between network and host evidence, we can move from initial suspicion to a detailed, evidence-backed narrative of a sophisticated server compromise.

### The Alert: The First Sign of Trouble

The investigation began with an external tip-off, a common starting point for many real-world incidents. The National Computer Emergency Response Team (CERT-SE) had detected unusual activity originating from a test server.

My first task was to validate this alert and understand the initial scope of the incident by looking at the network traffic.

### Phase 1: Network Forensics with Wireshark

The `haisy_4000.pcap` file was my first window into the attack. I loaded it into **Wireshark** to get a view of what was happening on the wire. Almost immediately, several red flags appeared.

**Finding 1: The TCP Flood**
The timeline began with a massive flood of TCP traffic. I saw a significant number of packets from an external IP (`37.120.246.146`) targeting the server's IP (`10.11.8.18`). This was a classic denial-of-service attempt, likely intended to either disrupt the service or create noise to distract from the real intrusion.

**Finding 2: The Reconnaissance Scan**
Shortly after the flood, I observed suspicious GET requests from another attacker IP (`172.17.3.3`). These requests were for common but non-existent files and directories (`/admin.php`, `/backup.zip`, etc.). This is a clear indicator of a web server vulnerability scan, where an attacker is probing for weaknesses.

**Finding 3: The Brute-Force Attack**
The most critical network finding was in the TCP streams. I identified a high volume of login attempts targeting the server's Tomcat service. By following the TCP stream, I could see the attacker (`10.11.2.22`) first attempting credentials like `tomcat:lovely` and failing, before finally succeeding with `tomcat:DSVDmc`.

**The Network Summary:**
The network traffic told a clear, but incomplete, story. We knew the attacker had performed reconnaissance, launched a brute-force attack, and successfully gained credentials. But what did they *do* after they got in? For that, I had to go to the source: the server itself.

### Phase 2: Host Forensics with Autopsy

I loaded the `haisy.raw` disk image into **Autopsy**. This allowed me to explore the server's filesystem, examine log files, and look for artifacts left behind by the attacker. This is where I would correlate the network activity with on-host actions.

**Finding 4: Corroborating the Attack in the Logs**
My first stop was the Tomcat web server logs. The log file (`var/log/tomcat7/localhost_access_log.2023-04-28.txt`) was a goldmine. It contained a chronological record that perfectly matched the network evidence:
-   I saw the flood of GET requests from the reconnaissance phase.
-   Crucially, I saw a log entry for a successful login event for the user `tomcat` immediately following the series of failed attempts I had seen in the PCAP file.

This was my first major correlation: the network evidence and host evidence told the exact same story about the brute-force attack.

**Finding 5: Post-Compromise Activity**
With access confirmed, I dug deeper into the server image to see what the attacker did next. By examining the command history files (`.bash_history`) for the `root` and `erika` users, I uncovered the attacker's post-compromise playbook. The `root` user had executed commands to:
-   Edit the Apache configuration.
-   Manipulate firewall settings.
-   Download files and move scripts.

This showed the attacker was attempting to establish persistence and escalate their privileges.

**Finding 6: The Malicious Payload**
The final piece of the puzzle came from correlating a specific HTTP POST request in the network traffic with a file on the server. The PCAP showed a POST request that was uploading a file. By examining the server's filesystem in Autopsy, I located the uploaded file: a malicious `.war` archive.

Analysis of the `.war` file revealed it contained a Java payload and a Metasploit folder. The attacker had successfully gained access and uploaded their malware.

### Conclusion: Building the Full Timeline

By pivoting between these two sources of evidence, I was able to construct a complete, end-to-end timeline of the attack:

1.  **Denial of Service:** The attacker initiated a TCP flood, likely as a distraction.
2.  **Reconnaissance:** The attacker scanned the server for common web vulnerabilities.
3.  **Initial Access:** A brute-force attack against the Tomcat service was successful, granting the attacker credentials.
4.  **Execution & Persistence:** The attacker logged in, manipulated system configurations, and moved files.
5.  **Payload Delivery:** The attacker uploaded a malicious `.war` file containing a Java payload.

This case study is a powerful reminder that no single piece of evidence tells the whole story. Network traffic shows us the *how*, but host-based artifacts show us the *what* and the *why*. A successful investigation depends on the ability to correlate these different views into a single, coherent narrative that can stand up to scrutiny.