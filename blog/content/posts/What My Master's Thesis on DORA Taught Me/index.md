---
title: "What My Master's Thesis on DORA Taught Me About the Gap Between Developers and Lawyers"
description: "A personal reflection on building a DORA compliance scanner and learning to translate the abstract language of regulation into the concrete world of code."
categories: ["Strategy", "Security", "Culture"]
tags: ["DORA", "GRC", "CloudSecurity", "DevSecOps"]
date: 2025-06-13
---

Picture two tables in a corporate meeting room.

At one table sit the lawyers and compliance officers. They speak the language of risk, liability, and regulation. They're discussing the Digital Operational Resilience Act (DORA), using terms like "Article 9," "ICT risk management framework," and "operational resilience." Their world is one of principles and legal text designed to protect the organization.

At the other table sit the developers and DevOps engineers. They speak the language of code, APIs, and infrastructure. They're talking about `boto3` SDKs, CI/CD pipelines, and IAM roles. Their world is one of practical implementation and tangible outcomes.

These two groups are essential for the success of any modern FinTech. They must collaborate perfectly. But often, they speak entirely different languages. This isn't just an anecdotal observation; it's a critical research gap. Existing work often focuses on theoretical models or high-level governance, offering limited insight into direct DORA compliance mapping (Martseniuk et al., 2024). My Master's thesis forced me to become the translator, and in doing so, it taught me that bridging this gap is the most critical challenge in achieving operational resilience.

### The Challenge: From Abstract Law to Concrete Code

My thesis goal was to answer the question: "How can an experimental security scanning model be utilized to identify common AWS misconfigurations and report their alignment with DORA compliance requirements?"

I started by reading DORA. It’s a brilliant but abstract piece of legislation. It speaks in principles. For instance, **Article 9** mandates "secure configurations," but it doesn't provide a technical implementation guide for AWS. It doesn't say, "Thou shalt not use `0.0.0.0/0` in thy security group ingress rules."

My first task was translation. I had to systematically convert legal principles into programmable, verifiable questions that code could answer.

-   The lawyer says: "We must adhere to sound access management as per **Article 5**."
-   The developer asks: "Does that mean I need to check for IAM roles with wildcard permissions and users without MFA?"

For my project, I built an experimental model, a Python scanner that did exactly that. It translated the abstract requirements of DORA into a series of concrete, automated checks:

-   The mandate for **"Secure Cloud Configurations" (Article 9)** became `check_public_s3_buckets()` and `check_exposed_ec2_ports()`.
-   The principles of **"ICT Risk Management" (Article 5)** became `check_iam_overly_permissive_roles()` and `check_iam_mfa_status()`.
-   The need for **"Incident Reporting & Security Governance" (Article 10)** became `check_s3_logging_enabled()` and `check_vpc_flow_logs()`.

I deliberately introduced these vulnerabilities into a controlled AWS testbed to simulate the common shortcuts and oversights found in real-world environments. The scanner worked, successfully identifying the technical flaws. But that was only half the journey.

### The Bridge: From Concrete Findings to Compliance Impact

A developer sees a finding like `"RDP_PORT_OPEN_TO_WORLD": "FAILED"` and thinks, "Okay, I need to fix that security group rule." It's a technical task on a to-do list.

But to be valuable to the other table, that finding needs to be translated *back* into the language of risk and compliance. The true power of my project wasn't just in *finding* the misconfiguration; it was in *automatically mapping* it back to the specific DORA articles it violated.

The output wasn't just a technical report; it was a compliance report. The interactive dashboard and PDF exports were designed to speak both languages simultaneously:

| Technical Finding | Mapped DORA Impact |
| :--- | :--- |
| IAM Role `EC2-S3-ReadOnly-Role` uses wildcard permissions. | **Violation of Article 5 (ICT Risk Management)**, which mandates least-privilege access controls. |
| S3 Bucket `bucket-misconfigured` has public access enabled. | **Violation of Article 9 (Secure Cloud Configurations)**, a failure to prevent unauthorized data access. |
| VPC `vpc-035e9a523f34825b4` has Flow Logs disabled. | **Violation of Article 10 (Security Governance)**, which requires monitoring for incident investigations. |

Suddenly, a technical issue becomes a quantifiable business risk. A line of code becomes a direct, auditable compliance breach. This is the bridge where the two tables can finally have a meaningful, data-driven conversation.

### What I Learned

Building this experimental model taught me crucial lessons about the socio-technical nature of compliance:

1.  **Empathy is a Technical Skill:** You cannot build effective compliance tools without understanding the pressures developers face. They use `“Resource”: “*”` not because they are malicious, but to meet a deadline. An effective tool doesn't just flag a flaw; it explains the specific regulatory risk and offers a clear, actionable path to remediation.

2.  **Abstraction is the Enemy of Action:** A policy that just says "be secure" is unactionable. For a policy to be effective in a cloud environment, it must be testable. If you can't write a script to validate compliance with a rule, that rule is too vague to be consistently enforced.

3.  **The "Translator" is the Most Valuable Player:** The future of GRC belongs to people who can inhabit both worlds. We need security professionals who can read regulations and write Python scripts. As my research highlights, a lack of empirical, data-driven approaches has hindered actionable solutions for DORA compliance (Scott, 2021). The translator provides that data-driven link.

My thesis started as a technical project, but it ended as a human one. It was about building an empirical model that could serve as a common language, allowing two different, essential parts of an organization to work together to achieve a shared goal: operational resilience. And in today's world, that's a language every company needs to learn.

---
### References

- Martseniuk, Y., Partyka, A., Harasymchuk, O., & Korshun, N. (2024). *Automated Conformity Verification Concept for Cloud Security*. Available at: https://www.semanticscholar.org/paper/Automated-Conformity-Verification-Concept-for-Cloud-Martseniuk-Partyka/a68b8fa696a84a29f2d52586654f079ae58066a6.
- Scott, H.S. (2021). *The E.U.'s Digital Operational Resilience Act: Cloud Services & Financial Companies*. [online] papers.ssrn.com. Available at: http://dx.doi.org/10.2139/ssrn.3904113.