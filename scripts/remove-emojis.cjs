#!/usr/bin/env node
/**
 * Remove all emojis from the HRTC codebase.
 * Replaces emoji icons with text equivalents or empty strings.
 */
const fs = require('fs');
const path = require('path');

const replacements = [
  // Login & Role pages
  ['🏔️', ''],
  ['👤', ''],
  ['🚌', ''],
  ['🎫', ''],
  ['⚙️', ''],
  ['🔒', ''],
  ['🔓', ''],
  ['⚠️', ''],

  // Navigation & Layout
  ['🏠', ''],
  ['💬', ''],
  ['☰', '\u2630'],  // keep hamburger as plain text entity

  // Map & Fleet
  ['🗺️', ''],
  ['🛣️', ''],
  ['📊', ''],
  ['📈', ''],
  ['🔔', ''],
  ['📡', ''],
  ['📍', ''],
  ['📏', ''],
  ['🕐', ''],

  // Driver dashboard
  ['🆘', ''],
  ['🔧', ''],
  ['🚨', ''],

  // Admin
  ['🛑', ''],
  ['⏱️', ''],
  ['👁️', ''],
  ['🌿', ''],

  // Toast & Badges
  ['✅', ''],
  ['ℹ️', ''],
  ['🟢', ''],

  // Misc
  ['📞', ''],
  ['☀️', ''],
  ['📋', ''],
  ['🔍', ''],
  ['📱', ''],

  // Search results type icons
  // (these are in template literals and inline, will be cleaned)

  // Clean up leftover double spaces from removed emojis
];

function walkDir(dir, ext) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file === 'node_modules' || file === 'dist' || file === '.git') continue;
      results = results.concat(walkDir(filePath, ext));
    } else if (ext.some(e => file.endsWith(e))) {
      results.push(filePath);
    }
  }
  return results;
}

const srcDir = path.join(__dirname, '..', 'src');
const files = walkDir(srcDir, ['.jsx', '.js', '.css']);

let totalReplacements = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  for (const [emoji, replacement] of replacements) {
    if (content.includes(emoji)) {
      const count = (content.match(new RegExp(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      content = content.split(emoji).join(replacement);
      totalReplacements += count;
      modified = true;
    }
  }

  // Clean up double/triple spaces left by removed emojis (but keep indentation)
  if (modified) {
    // Remove leading emoji space in text content like "🚌 Track" -> "Track"
    content = content.replace(/^(\s*)  +/gm, '$1');
    // Clean inline double spaces
    content = content.replace(/([^\s])  +/g, '$1 ');

    fs.writeFileSync(file, content, 'utf8');
    console.log(`  Updated: ${path.relative(srcDir, file)}`);
  }
}

console.log(`\nDone. ${totalReplacements} emoji occurrences removed across ${files.length} files.`);
