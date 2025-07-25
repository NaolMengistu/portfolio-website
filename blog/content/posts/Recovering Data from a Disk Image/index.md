---
title: "An Introduction to File Carving: Recovering Data from a Disk Image"
description: "A practical, tutorial-style guide to the basics of file carving, using command-line tools like file, strings, and scalpel to recover data from a raw disk image."
categories: ["Tutorial", "Forensics"]
tags: ["DigitalForensics", "FileCarving", "Linux", "CommandLine"]
date: 2023-10-20
---

In digital forensics, we often work with a raw disk image, a bit-for-bit copy of a storage device. This image contains everything: allocated files, deleted files, and fragments of data hidden in unallocated space. One of the most fundamental techniques for recovering information from this sea of data is **file carving**.

File carving is the process of extracting files from a larger data set based on their structure and content, rather than relying on the filesystem's metadata. It's how we can recover a deleted photo even if the file's name and location have been wiped.

As part of my digital forensics coursework, I worked extensively with these techniques. In this tutorial, I'll walk you through the core concepts and show you how to use powerful command-line tools in a Linux environment to start carving files yourself.

### The Core Concept: "Magic Numbers"

How does a computer know that a `.jpg` is a picture and a `.pdf` is a document? It's not just the file extension, which can be easily changed. The real answer lies in **"magic numbers"**, a sequence of bytes at the very beginning of a file (the header) that identifies its type.

For example:
-   A **PNG image** file always begins with the hex bytes `89 50 4E 47 0D 0A 1A 0A`.
-   A **JPEG image** file often starts with `FF D8 FF`.
-   A **PDF document** starts with `%PDF-` (hex: `25 50 44 46 2D`).

Forensic tools use these unique signatures to identify and "carve out" files from a raw data stream, even when the filesystem provides no information about where the file begins or ends.

### Our Toolkit: Simple, Powerful Command-Line Tools

For this walkthrough, we'll be using a Kali Linux environment and a hypothetical raw disk image named `evidence.dd`. These three command-line tools are the bread and butter of initial file analysis.

#### 1. `file`: Identifying File Types

The `file` command is the simplest way to see magic numbers in action. It reads the header of a file and tells you what type of file it thinks it is. When run on a directory of recovered, extension-less files, it's invaluable.

Let's imagine we have a folder of recovered `.bin` files from a disk image. We can quickly identify the images:

```bash
# Run the file command on all .bin files in the current directory
file *.bin
```

The output would look something like this:
```
001.bin: data
002.bin: PNG image data, 1024 x 768, 8-bit/color RGB, non-interlaced
003.bin: SVG Scalable Vector Graphics image
004.bin: data
...
```
In seconds, we've identified which of the hundreds of files are likely images, just by checking their magic numbers.

#### 2. `strings`: Finding Human-Readable Text

A disk image is mostly binary data, unreadable to a human. The `strings` command is a simple utility that scans through a file (or an entire disk image) and extracts any sequence of printable characters. It's an incredibly effective way to quickly find text fragments, passwords, emails, or configuration settings.

Let's search our entire disk image for a specific keyword, like "password":

```bash
# Run strings on the disk image and pipe the output to grep to search for 'password'
strings evidence.dd | grep -i "password"
```

This might reveal lines like:
```
config.txt:user_password=12345
website_login_password
Error: Incorrect password.
```
This gives us immediate clues about user activity and potential credentials without needing to parse the entire filesystem.

#### 3. `scalpel`: The Automatic File Carver

While `file` and `strings` are great for analysis, **`scalpel`** is our primary carving tool. It reads through a disk image, looks for predefined file headers and footers (magic numbers), and carves out the data between them into new files.

Using `scalpel` is a two-step process:

**Step A: Configure the Rules**
First, we need to tell `scalpel` what to look for. Its configuration file is located at `/etc/scalpel/scalpel.conf`. By default, all file types are commented out. You need to open this file as a superuser and uncomment the lines for the file types you want to recover.

For example, to recover JPEGs and PDFs, you would find and uncomment these lines:
```conf
# Uncomment the line for jpg files
jpg     y       155000000       \xff\xd8\xff\xe0\x00\x10\x4a\x46       \xff\xd9

# Uncomment the line for pdf files
pdf     y       50000000        %PDF-                 %%EOF
```

**Step B: Run the Carver**
Once your configuration is saved, you can run `scalpel` on your disk image. It's best practice to always create a dedicated output directory for the recovered files.

```bash
# Create an output directory
mkdir recovered_files

# Run scalpel on the disk image
# scalpel [disk_image] -o [output_directory]
sudo scalpel evidence.dd -o recovered_files
```

`scalpel` will then scan the entire image. When it's done, the `recovered_files` directory will contain new subdirectories for each file type (`jpg`, `pdf`, etc.), filled with all the files it was able to carve.

### Conclusion: A Foundation for Deeper Investigation

File carving with tools like `file`, `strings`, and `scalpel` is a fundamental first step in many digital forensics investigations. It allows an analyst to quickly get a sense of the data on a device, identify key file types, and recover evidence that might otherwise be lost.

While these tools are powerful, they are just the beginning. The files recovered through carving often lack their original names, timestamps, and filesystem locations. The next phase of an investigation involves analyzing these recovered files to piece together the full story. But without this foundational step of carving the data from the raw image, that deeper analysis would be impossible.