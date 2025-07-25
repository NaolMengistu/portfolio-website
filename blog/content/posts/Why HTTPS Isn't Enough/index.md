---
title: "Why HTTPS Isn't Enough: A Practical Look at Confidentiality and Integrity"
description: "An educational guide explaining the difference between confidentiality (encryption) and integrity (hashing) using a hands-on exercise with SHA256."
categories: ["Tutorial", "Security", "Fundamentals"]
tags: ["Encryption", "Hashing", "CyberSecurity", "Fundamentals", "SHA256"]
date: 2024-04-06
---

We're often told to look for the padlock icon and "https://" in our browser's address bar. It's the universal sign of a secure connection, and for good reason. It means the data flying between you and the website is encrypted. But what does "secure" actually mean? Is encryption the only thing that matters?

The truth is, a truly secure system needs to protect against two very different kinds of threats: **eavesdropping** and **tampering**. While we often lump them together, they are distinct problems that require distinct solutions.

As part of my network security coursework, I performed a series of hands-on exercises that perfectly illustrate this difference. In this article, I'll use those practical examples to break down the two pillars of data security: **Confidentiality** and **Integrity**.

### The First Problem: Eavesdropping (Confidentiality)

Imagine you're sending an email over a public Wi-Fi network. If that email is sent in clear text, anyone on that network with the right tools can intercept and read your message. This is an attack on **confidentiality**.

**The Goal:** To keep your data secret from unauthorized parties.

**The Solution: Encryption**
Encryption is the process of scrambling a message using a secret key, making it unreadable to anyone who doesn't have the key. This is what the 'S' in HTTPS (Hypertext Transfer Protocol Secure) does. It wraps the standard HTTP protocol in a layer of TLS (Transport Layer Security) encryption.

This is the same reason why protocols like **SSH** have replaced **Telnet**, and **FTPS** has replaced **FTP**. The older protocols sent everything, including your username and password, in plain text for anyone to see. The modern, encrypted versions ensure that even if an attacker intercepts the traffic, all they see is a meaningless jumble of characters.

Encryption is brilliant at solving the eavesdropping problem. But it doesn't solve everything.

### The Sneakier Problem: Tampering (Integrity)

Now, imagine a different scenario. An attacker intercepts your encrypted message, but instead of trying to read it, they try to *change* it. Even without knowing the content, they could potentially alter the encrypted data in a way that changes the underlying message when it's decrypted.

This is an attack on **integrity**.

**The Goal:** To ensure that the data you receive is the exact same data that was sent, with no modifications along the way.

**The Solution: Cryptographic Hashing**
The primary tool for ensuring integrity is a cryptographic hash function. You can think of a hash as a unique, fixed-length "digital fingerprint" for any piece of data.

Hash functions have a critical property known as the **avalanche effect**: changing even a single bit in the input data will produce a completely different and unpredictable hash. This makes them perfect for detecting tampering.

#### A Hands-On Example with SHA256

Let's demonstrate this with a practical exercise from my lab. We'll use the **SHA256** hash algorithm.

**Step 1: Create a Message**
First, create a simple text file named `message.txt` with the following content:
```
This is a secret message.
```

**Step 2: Calculate the Fingerprint**
Now, let's calculate the SHA256 hash of this file. In a Linux or macOS terminal, you can use `sha256sum`. In Windows PowerShell, you can use `Get-FileHash`.

```bash
# On Linux/macOS
sha256sum message.txt

# On Windows PowerShell
Get-FileHash -Algorithm SHA256 message.txt
```
The output will be a long string of characters, the digital fingerprint of our file:
`c113b632...` (your exact hash will be this if the file is identical)

**Step 3: Make a Tiny Change**
Now, let's edit `message.txt` and make the smallest possible change. We'll simply change the period at the end to an exclamation mark.
```
This is a secret message!
```

**Step 4: Recalculate the Fingerprint**
Let's run the exact same hash command again on our modified file.

```bash
# On Linux/macOS
sha256sum message.txt
```
The new output is completely different:
`a3f5a1a1...`

This is the avalanche effect in action. A tiny, almost invisible change to the input created a drastically different fingerprint.

### Putting It All Together: A Secure System Needs Both

This simple exercise demonstrates why a secure system needs more than just encryption.

-   **Encryption (like HTTPS) provides Confidentiality:** It's like putting your message in a locked box. No one can see inside.
-   **Hashing provides Integrity:** It's like putting a tamper-evident seal on that locked box. You can instantly tell if someone has opened it and changed the contents.

Modern secure protocols like TLS do both. They encrypt the data to protect its confidentiality, and they use a mechanism called a Hash-based Message Authentication Code (HMAC) to create a cryptographic signature that guarantees its integrity.

So, the next time you see that padlock in your browser, remember that it represents more than just a secret. It represents a promise, a promise that your data is not only private but also authentic and unchanged. Understanding the difference between these two principles is the first step toward building and trusting our digital world.