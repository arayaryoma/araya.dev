#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import readline from "node:readline";

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to get user input
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Main async function to create draft
async function createDraft() {
  // Get title from user input
  console.log("📝 新しいブログドラフトを作成します");
  const title = await askQuestion("タイトルを入力してください: ");

  if (!title) {
    console.log("❌ タイトルが入力されませんでした。処理を終了します。");
    process.exit(1);
  }

  // Get current date and time
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;

  // Generate filename based on title + timestamp
  const slugTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Keep only alphanumeric, spaces, and hyphens
    .replace(/\s+/g, "-") // Convert spaces to hyphens
    .replace(/-+/g, "-") // Convert consecutive hyphens to single hyphen
    .slice(0, 50); // Max 50 characters

  const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const filename = slugTitle
    ? `${dateString}-${slugTitle}.md`
    : `${dateString}-new-draft-${timestamp}.md`;

  // Draft directory path
  const draftsDir = path.join(__dirname, "../../src/_drafts");
  const filePath = path.join(draftsDir, filename);

  // Markdown file frontmatter template
  const template = `---
title: ${title}
tags:
date: "${dateString}"
description: 
---

`;

  try {
    // Create draft directory if it doesn't exist
    if (!fs.existsSync(draftsDir)) {
      fs.mkdirSync(draftsDir, { recursive: true });
    }

    // Create the file
    fs.writeFileSync(filePath, template, "utf8");

    console.log(`✅ Draft file created: ${filename}`);
    console.log(`📁 Path: ${filePath}`);

    // Open file in VS Code
    exec(`code "${filePath}"`, (error) => {
      if (error) {
        console.log(`ℹ️  File created at: ${filePath}`);
        console.log("Please open the file manually in VS Code.");
      } else {
        console.log("🎉 File opened in VS Code!");
      }
    });
  } catch (error) {
    console.error("❌ Error creating draft file:", error.message);
    process.exit(1);
  }
}

// Execute main function
createDraft();
