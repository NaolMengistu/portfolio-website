---
title: "A Practical Guide: Building a Simple Compliance Scanner for AWS with Python"
description: "A step-by-step tutorial to build a foundational AWS security scanner using Python and Boto3, helping you automate your compliance checks."
categories: ["Tutorial", "Security", "DevOps"]
tags: ["Python", "AWS", "Boto3", "Automation", "ComplianceAsCode"]
date: 2025-03-20
---

In the world of cloud computing, the traditional, manual security audit is struggling to keep pace. Infrastructure is too vast, and it changes too quickly. To effectively manage risk, we must turn to automation. This is the core idea behind "Compliance-as-Code" using code to define, check, and enforce our security policies in a continuous, automated fashion.

As part of my Master's thesis on DORA compliance, I built a comprehensive AWS security scanner to bridge the gap between technical misconfigurations and regulatory requirements. While that tool has many features, its foundation is a set of simple, powerful checks.

In this tutorial, I'll walk you through building a simplified version of that scanner. We'll use Python and the AWS SDK (`boto3`) to create a script that automatically checks for two of the most common and critical AWS misconfigurations. Let's get started!

### Prerequisites

Before we begin, make sure you have the following set up:

1.  **Python 3.8+** installed on your machine.
2.  **An AWS Account.**
3.  **AWS CLI installed and configured.** This is crucial. You'll need to run `aws configure` in your terminal and provide your AWS Access Key ID and Secret Access Key. This allows our script to securely interact with your AWS account.

### Step 1: Setting Up Your Project

First, let's create a clean project environment. Open your terminal and run the following commands:

```bash
# Create a new directory for our project
mkdir aws-compliance-scanner
cd aws-compliance-scanner

# Create and activate a Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install the AWS SDK for Python
pip install boto3
```
Now we have a dedicated environment with `boto3` installed. Let's create our main script file.

```bash
touch scanner.py
```

### Step 2: Our First Check - Finding Public S3 Buckets

Let's write our first compliance check. We'll find any S3 buckets in your account that are publicly accessible. Open `scanner.py` in your favorite code editor and add the following function:

```python
import boto3
from botocore.exceptions import ClientError

def check_public_s3_buckets():
    """
    Identifies S3 buckets that may have public access enabled.
    This check focuses on the Public Access Block configuration.
    """
    print("--- [S3] Checking S3 Bucket Public Access ---")
    s3_client = boto3.client('s3')
    found_issues = []

    try:
        # Get a list of all buckets in the account
        response = s3_client.list_buckets()
        buckets = response.get('Buckets', [])
        
        for bucket in buckets:
            bucket_name = bucket['Name']
            try:
                # The primary and most reliable way to check for public access
                pab_config = s3_client.get_public_access_block(Bucket=bucket_name).get('PublicAccessBlockConfiguration', {})
                
                # If any of these are False, the bucket is not fully private
                if not all([pab_config.get('BlockPublicAcls', False),
                            pab_config.get('IgnorePublicAcls', False),
                            pab_config.get('BlockPublicPolicy', False),
                            pab_config.get('RestrictPublicBuckets', False)]):
                    issue = f"Bucket '{bucket_name}' has an insecure Public Access Block configuration."
                    found_issues.append(issue)
                    print(f"[FAIL] {issue}")

            except ClientError as e:
                # If this error occurs, it means no PAB configuration exists, which is a major security risk.
                if e.response['Error']['Code'] == 'NoSuchPublicAccessBlockConfiguration':
                    issue = f"Bucket '{bucket_name}' has NO Public Access Block configured. It is highly vulnerable to public exposure."
                    found_issues.append(issue)
                    print(f"[FAIL] {issue}")
                else:
                    # Handle other potential AWS errors gracefully
                    print(f"[ERROR] Could not check bucket {bucket_name}: {e}")

    except ClientError as e:
        print(f"[ERROR] Could not list S3 buckets: {e}")
        return

    if not found_issues:
        print("[PASS] No S3 buckets with insecure Public Access Block settings found.")

```
**How it works:**
1.  We initialize the `boto3` S3 client.
2.  We get a list of all buckets in the account using `list_buckets()`.
3.  We loop through each bucket and call `get_public_access_block()`. This AWS feature is the most important defense against accidental public exposure.
4.  If the block configuration doesn't exist (`NoSuchPublicAccessBlockConfiguration`) or if any of its four key settings are `False`, we flag it as a finding. A secure bucket should have all four settings set to `True`.

### Step 3: Our Second Check - Finding Exposed EC2 Ports

Next, let's check for a classic vulnerability: security groups that leave dangerous ports like SSH (22) or RDP (3389) open to the entire internet (`0.0.0.0/0`). Add this function to your `scanner.py` file:

```python
def check_exposed_ec2_ports():
    """
    Identifies EC2 security groups with inbound rules that expose sensitive ports to the world.
    """
    print("\n--- [EC2] Checking Security Group Ingress Rules ---")
    ec2_client = boto3.client('ec2')
    found_issues = []
    
    # Ports we consider dangerous to be open to the entire internet
    DANGEROUS_PORTS = [22, 3389, 3306, 5432] 

    try:
        # Use a paginator for accounts with many security groups
        paginator = ec2_client.get_paginator('describe_security_groups')
        pages = paginator.paginate()
        
        for page in pages:
            for sg in page['SecurityGroups']:
                for permission in sg.get('IpPermissions', []):
                    # Check for rules that allow access from any IPv4 address
                    for ip_range in permission.get('IpRanges', []):
                        if ip_range.get('CidrIp') == '0.0.0.0/0':
                            # Check if the rule is for a specific port or a range
                            from_port = permission.get('FromPort')
                            to_port = permission.get('ToPort')
                            
                            # If a port range is defined, check if any dangerous port falls within it
                            if from_port is not None and to_port is not None:
                                for port in DANGEROUS_PORTS:
                                    if from_port <= port <= to_port:
                                        issue = f"Security Group '{sg['GroupName']}' ({sg['GroupId']}) exposes port {port} to the world (0.0.0.0/0)."
                                        if issue not in found_issues:
                                            found_issues.append(issue)
                                            print(f"[FAIL] {issue}")

    except ClientError as e:
        print(f"[ERROR] Could not check security groups: {e}")
        return
        
    if not found_issues:
        print("[PASS] No security groups found exposing dangerous ports to the world.")
```
**How it works:**
1.  We define a list of `DANGEROUS_PORTS` we want to check.
2.  We use `describe_security_groups()` to get all security groups. Using a `paginator` makes the code robust, even for accounts with hundreds of groups.
3.  We iterate through each group's `IpPermissions` (its inbound rules).
4.  If a rule's source is `0.0.0.0/0` (any IPv4 address), we then check if any of our dangerous ports fall within the port range defined by that rule. If so, we flag it.

### Step 4: Putting It All Together

Now, let's create a main execution block to run our checks. Add this to the very end of your `scanner.py` file:

```python
if __name__ == "__main__":
    print("Starting AWS Compliance Scan...")
    check_public_s3_buckets()
    check_exposed_ec2_ports()
    print("\nScan complete.")
```

Your final `scanner.py` file should now contain both check functions and this `main` block. To run it, simply go to your terminal (make sure your virtual environment is still active) and execute the script:

```bash
python scanner.py
```

You'll see a report printed directly to your console, telling you if it found any issues! For example:

```
Starting AWS Compliance Scan...
--- [S3] Checking S3 Bucket Public Access ---
[FAIL] Bucket 'my-insecure-test-bucket' has NO Public Access Block configured. It is highly vulnerable to public exposure.

--- [EC2] Checking Security Group Ingress Rules ---
[FAIL] Security Group 'launch-wizard-1' (sg-0123456789abcdef) exposes port 22 to the world (0.0.0.0/0).

Scan complete.
```

### Next Steps: From a Simple Script to a Powerful Tool

Congratulations! You've just built the foundation of a real Compliance-as-Code tool. This is a powerful start, but it's just the beginning. The real power comes from expanding on this base.

The full version of my thesis project builds on this by:
-   **Adding more checks:** Covering IAM (overly-permissive roles, no MFA), VPCs (logging, ACLs), and more.
-   **Mapping findings to regulations:** Explicitly linking a technical finding like an open port to a specific DORA or ISO 27001 article.
-   **Creating better outputs:** My project uses **Streamlit** to display results in a beautiful, interactive web dashboard and generates a formal **PDF summary** for management.
-   **Integrating into CI/CD:** Running these checks automatically every time new infrastructure code is deployed to prevent misconfigurations before they happen.

If you're interested in seeing how these concepts are implemented in a more complete project, I highly encourage you to check it out:

-   **View the live interactive dashboard:** [**AWS Security Scanner on Streamlit Cloud**](https://aws-security-scanner.streamlit.app/)
-   **Explore the full source code on GitHub:** [**NaolMengistu/AWS-security-scanner**](https://github.com/NaolMengistu/AWS-security-scanner)

By starting with a simple script like this, you're taking the first and most important step toward automating your security and compliance, moving from manual checklists to real-time, actionable code.
