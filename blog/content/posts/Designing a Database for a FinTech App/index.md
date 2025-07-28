---
title: "Designing a Database for a FinTech App: A Bachelor's Thesis Case Study"
description: "An overview of designing and implementing a relational database for a mobile payment app, from initial requirements to a fully normalized schema."
categories: ["Case Study", "Databases"]
tags: ["MySQL", "DatabaseDesign", "FinTech", "Normalization", "SQL"]
date: 2022-11-23
---

Ever wondered what powers popular FinTech apps like Venmo or Cash App? Beneath the slick user interface lies the most critical component: a robust, reliable, and scalable database. The success of any financial platform hinges on its ability to manage user data, process transactions securely, and maintain absolute data integrity. Get the database design wrong, and the entire system is built on a foundation of sand.

As part of my bachelor thesis in Computer Science, I undertook the challenge of designing and implementing a complete database for a mobile payment service from the ground up. This article is a case study of that journey, walking through the entire process from foundational principles and data modeling to the final, normalized schema.

### Step 1: Laying the Groundwork - Why Relational is best for FinTech

Before writing a single line of SQL, the most important step is to choose the right technology and define the non-negotiable principles. While NoSQL databases offer flexibility, for a financial application, the strict guarantees of a relational database management system (RDBMS) are paramount. I chose MySQL for this project precisely because it excels at the core principles required for financial transactions.

**The Mandate for ACID Compliance**
When money is involved, there is no room for error. Relational databases are built around the **ACID** properties, which are essential for reliable transactions:

*   **Atomicity:** A transaction either completes entirely or fails entirely. You can't have money leave one account without it arriving in another.
*   **Consistency:** The data must always be in a valid state. A transaction cannot violate the database's integrity rules (like data types, constraints, and relationships).
*   **Isolation:** Concurrent transactions cannot interfere with each other. Two people trying to pay from the same account at the exact same moment won't cause a race condition that corrupts the balance.
*   **Durability:** Once a transaction is committed, it is permanently written to disk and will survive any subsequent system failure or power outage.

For any FinTech application, ACID compliance isn't just a feature; it's the fundamental requirement for building user trust and ensuring reliability.

### Step 2: The Art of Normalization - A Practical Example

A common mistake in database design is to create large, flat tables that cram too much information together. This leads to data redundancy and creates "anomalies" where updating one piece of information requires changing multiple rows, risking inconsistency. The solution is **Normalization**.

Normalization is a systematic process of organizing tables to minimize redundancy by breaking them down into smaller, logical, and interconnected parts. For this project, I normalized the schema up to the **Third Normal Form (3NF)**.

Let's look at a real example from my thesis. An early, unnormalized table for tracking user purchases might look like this:

**Denormalized "Purchases" Table**

| ID  | Name       | Email             | Service name            | Price | Transaction date | Quantity |
| :-- | :--------- | :---------------- | :---------------------- | :---: | :--------------: | :------: |
| 1   | Janet Mela | email1@domain.com | Cinema ticket           |  50   |    2022-01-03    |    2     |
| 1   | Janet Mela | email1@domain.com | 10 min Transport ticket |   5   |    2022-02-01    |    1     |
| 2   | Abel Lem   | email2@domain.com | Birr 30 Phone top up    |  30   |    2022-02-14    |    1     |

Notice the problems?
1.  **Redundancy:** The user's name and email are repeated for every single purchase they make.
2.  **Update Anomaly:** If Janet updates her email address, we have to find and change it in every row she appears in. Missing one would lead to inconsistent data.
3.  **Partial Dependencies:** The `Price` of a service depends only on the `Service name`, not on the `ID` of the user who bought it.

Through normalization, we decompose this into three clean, efficient tables:

**`User` Table (3NF)**

| ID  | First Name | Last Name | Email             |
| --- | ---------- | --------- | ----------------- |
| 1   | Janet      | Mela      | email1@domain.com |
| 2   | Abel       | Lem       | email2@domain.com |

 **`Service` Table (3NF)**

| Service_ID | Service Name            | Price |
| ---------- | ----------------------- | ----- |
| 1          | Cinema ticket           | 50    |
| 2          | 10 min Transport ticket | 5     |
| 3          | Birr 30 Phone top up    | 30    |

 **`Transaction` Table (3NF)**

| Transaction_ID | User_ID | Service_ID | Transaction Date | Quantity |
| -------------- | ------- | ---------- | ---------------- | -------- |
| 101            | 1       | 1          | 2022-01-03       | 2        |
| 102            | 1       | 2          | 2022-02-01       | 1        |
| 103            | 2       | 3          | 2022-02-14       | 1        |

This structure is far more robust. A user's email exists in only one place, and a service's price is defined once, eliminating anomalies and ensuring data integrity.

### Step 3: The Final Blueprint - A Guided Tour of the Schema

After applying these principles across all business requirements, the result is a comprehensive and resilient database schema. This Entity-Relationship Diagram (ERD) shows the final structure, including all tables, columns, and the relationships between them.

![Database Schema for Mobile Payment Service](https://github.com/NaolMengistu/iPay_database_design/raw/main/images/database-schema.png)

<p align="center"><strong>Figure: Database schema</strong></p>

#### Key Design Decisions & Highlights:

*   **Identity vs. Application User (`person` vs. `user`):** The schema separates a person's core identity (`person` table) from their application-specific data (`user` table). This allows a single person to potentially have multiple user profiles in the system, a flexible and scalable design choice.
*   **Centralized Transaction Hub:** The `transaction` table is the heart of the system. It doesn't store redundant details; instead, it uses foreign keys to link to `user` (sender/receiver), `currency`, `fee`, `status`, and `transaction_type`. This makes querying powerful and efficient.
*   **Flexibility through Lookup Tables:** Instead of hardcoding values like "pending" or "completed," I created separate tables for `status`, `currency`, `fee`, and `transaction_type`. This allows the business to easily add new currencies or fee structures in the future without changing the database schema itself.
*   **A Dedicated Audit Trail (`tracker`):** One unique feature is the `tracker` table. Its sole purpose is to act as an immutable log for every change made to any other table. It answers the critical questions for any audit or forensic investigation: **What** was changed, **who** changed it, **when**, and what was the **previous value**? This provides a powerful layer of transparency crucial for a financial platform.

### Conclusion & Exploring the Code

Designing a database is a journey from abstract business needs to a concrete, logical, and efficient structure. By prioritizing foundational principles like ACID compliance and systematically applying normalization, it's possible to build a backend that is not only functional but also secure, maintainable, and ready to scale.

This project was a deep dive into the practical realities of database engineering. If you're interested in exploring the complete, normalized schema, I encourage you to check out the full project on my GitHub repository. The repository includes the MySQL Workbench (`.mwb`) file for a visual model and the final `.sql` script to create the entire database yourself.

**Explore the full project on GitHub: [https://github.com/NaolMengistu/iPay_database_design](https://github.com/NaolMengistu/iPay_database_design)**