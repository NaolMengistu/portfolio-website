---
title: "DORA Is Coming: 3 AWS Misconfigurations Your FinTech Needs to Fix Now"
description: "A practical guide for FinTechs to address common AWS security flaws before the Digital Operational Resilience Act (DORA) deadline, based on ongoing research."
categories: ["Security", "Compliance"]
tags: ["DORA", "AWS", "FinTech", "CloudSecurity", "ComplianceAsCode"]
date: 2024-12-05
---

The clock is ticking. By January 17, 2025, financial entities across the EU must comply with the Digital Operational Resilience Act (DORA). For many cloud-native FinTechs, there’s a dangerous assumption that running on a major provider like AWS automatically ensures compliance. This is a critical misunderstanding. Research shows that cloud misconfigurations have emerged as a leading cause of security breaches in financial institutions (Guffey and Li, 2023). Under DORA’s shared responsibility model, the resilience of your services depends heavily on *your* configuration choices.

As part of my ongoing Master's thesis in Information Security, I am developing an experimental model to assess these very risks. My literature review and preliminary pilot tests are already revealing a recurring pattern of simple mistakes that create significant regulatory and security risks.

In this article, we’ll break down three of the most critical AWS misconfigurations, highlighted by current research and validated in my initial tests, that your FinTech needs to find and fix before the deadline.

### 1. The Overly-Permissive IAM Role

This is arguably one of the most dangerous yet overlooked cloud security risks (Guffey and Li, 2023). In the rush to get a service working, a developer might assign a broad, powerful IAM role with wildcard permissions (e.g., `“Action”: “*”, “Resource”: “*”`).

**The Risk:** This single point of failure can lead to catastrophic privilege escalation. As seen in the 2019 Capital One data breach, a misconfigured IAM role enabled an attacker to access over 100 million customer records. A compromised resource doesn’t just grant access to one service; it can hand over the keys to your entire AWS kingdom.

**The DORA Connection:** This is a direct violation of **Article 5: ICT Risk Management and Third-Party Oversight**. This article mandates robust access control practices and the enforcement of the principle of least privilege. The literature review for my research reveals that financial institutions often fail to enforce this principle, leaving IAM roles with unnecessary administrative access (Dawodu et al., 2023). An overly-permissive IAM role is a clear failure to manage ICT risk.

**The Fix:**
*   **Audit Your Roles:** Use AWS IAM Access Analyzer to programmatically identify roles with excessive permissions.
*   **Implement Granular Policies:** Create custom, resource-specific IAM policies that grant *only* the permissions required for a service to function. For example, if a service only needs to read from a specific S3 bucket, its policy should only allow `s3:GetObject` on that bucket’s specific ARN.
*   **Practice Just-in-Time Access:** Instead of standing permissions, use services like IAM Identity Center to grant temporary, elevated access for specific tasks.

### 2. The Publicly Accessible & Unlogged S3 Bucket

Horror stories of massive data leaks from misconfigured S3 buckets are common for a reason. This often involves two distinct failures: public access and disabled logging.

**The Risk:** Publicly accessible buckets can expose sensitive customer data, financial records, and intellectual property. The 2020 Twilio breach, for instance, involved a misconfigured S3 bucket that exposed sensitive internal code. Compounding this, disabled server access logging makes it nearly impossible to conduct forensic investigations, hindering incident response.

**The DORA Connection:** This is a multifaceted compliance failure.
1.  **Public Access:** This is a clear violation of **Article 9: Operational Resilience and Secure Cloud Configurations**, which requires financial institutions to maintain secure configurations to prevent unauthorized data access.
2.  **Disabled Logging:** This violates **Article 10: Incident Reporting and Security Governance**, which emphasizes the need for continuous monitoring and audit trails to ensure traceability and support forensic investigations.

**The Fix:**
*   **Enable Block Public Access (BPA):** This setting should be enabled at the account level and on every individual S3 bucket. It’s your most important safety net.
*   **Use Granular Bucket Policies:** If you must grant external access, use a specific, restrictive bucket policy that grants access only to a specific AWS account or IP address. Never use "Public" for sensitive data.
*   **Enable Server Access Logging and AWS CloudTrail:** Ensure all read/write operations on sensitive buckets are logged to a separate, secure logging bucket for a durable audit trail.

### 3. Unrestricted Security Group Ingress Rules

A Security Group acts as a virtual firewall for your EC2 instances. A common and dangerous mistake is to open up administrative ports like SSH (port 22) or RDP (port 3389) to the entire internet (`0.0.0.0/0`) for "easy access."

**The Risk:** Leaving these ports open makes your instances a prime target for automated brute-force attacks and network reconnaissance. Attackers constantly scan the internet for open ports, and once they gain access, they can use the instance as a pivot point to move deeper into your network.

**The DORA Connection:** This represents a fundamental failure in network security, violating **Article 9**’s requirement for secure system configurations designed to prevent unauthorized access. An unrestricted security group is the opposite of resilient; it's a wide-open door that undermines network segmentation controls.

**The Fix:**
*   **Never Use `0.0.0.0/0` for Management Ports:** Restrict SSH/RDP access to specific, known IP addresses, such as your office’s static IP or a corporate VPN range.
*   **Use a Bastion Host (Jump Box):** The best practice is to have no direct administrative access to your application instances from the internet. Instead, route all access through a single, hardened bastion host.
*   **Leverage AWS Systems Manager Session Manager:** This is the modern, preferred method. It allows you to get secure shell access to your instances through the AWS console and API without opening any inbound ports at all.

### From Manual Audits to Empirical Validation

Finding these issues manually is time-consuming and prone to error, which is why traditional, periodic audits often fail to capture the real-time risks in dynamic cloud environments (Van Ede et al., 2022). This is precisely the gap my Master's thesis aims to address.

I am currently developing a custom Python scanner that programmatically queries the AWS API to check for these very misconfigurations. The goal is to build a tool that not only identifies technical flaws but also maps them directly to the relevant DORA articles, creating an automated, evidence-based compliance report. Preliminary results from pilot testing are promising, confirming the tool's ability to detect these critical issues accurately. This “Compliance-as-Code” approach is designed to turn a yearly audit into a continuous, real-time process.

DORA is not just a challenge for your legal and compliance teams; it's a technical, engineering challenge. By finding and fixing these common misconfigurations now, you’re not just ticking a box, you’re building a more resilient, secure, and verifiably compliant FinTech.

---
### References

- Dawodu, S.O., Omotosho, A., Akindote, O.J., Adegbite, A.O. and Ewuga, S.K. (2023). ‘CYBERSECURITY RISK ASSESSMENT IN BANKING: METHODOLOGIES AND BEST PRACTICES’, *Computer Science & IT Research Journal*, 4(3), pp.220–243.
- Guffey, J. and Li, Y. (2023). ‘Cloud Service Misconfigurations: Emerging Threats, Enterprise Data Breaches and Solutions’, *2023 IEEE 13th Annual Computing and Communication Workshop and Conference (CCWC)*.
- Van Ede, T., Khasuntsev, N., Steen, B. and Continella, A. (2022, November). Detecting Anomalous Misconfigurations in AWS Identity and Access Management Policies. *Proceedings of the 2022 on Cloud Computing Security Workshop*.