#!/usr/bin/env node
/**
 * BiliFM - Enhanced Bilibili Audio Downloader
 * Combines the best approaches from BiliFM and yt-dlp
 *
 * Usage:
 *   node bili-audio-downloader.js BV1Edz6ByEGe
 *   node bili-audio-downloader.js https://www.bilibili.com/video/BV1Edz6ByEGe
 */

import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse BV ID from URL or direct input
function extractBVId(input) {
  if (!input) {
    console.error("❌ Please provide a video URL or BV ID");
    process.exit(1);
  }

  // Extract BV ID from URL or use directly
  const bvMatch = input.match(/(BV[\w]+)/);
  if (bvMatch) {
    return bvMatch[1];
  }

  return input;
}

// Download audio using yt-dlp
function downloadAudio(bvid, options = {}) {
  const {
    outputDir = "downloads",
    audioFormat = "m4a",
    audioQuality = "0", // 0 = best quality
  } = options;

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`🎵 BiliFM - Enhanced Bilibili Audio Downloader`);
  console.log(`📺 Video ID: ${bvid}`);
  console.log(`📁 Output Directory: ${outputDir}`);
  console.log(`🎧 Audio Format: ${audioFormat}`);
  console.log(`\n⏳ Starting download...\n`);

  // Build yt-dlp command
  const args = [
    "-x", // Extract audio
    "--audio-format", audioFormat,
    "--audio-quality", audioQuality,
    "--no-playlist", // Download only the specified video
    "-o", path.join(outputDir, "%(title)s.%(ext)s"),
    `https://www.bilibili.com/video/${bvid}`,
    "--newline", // Use new line for progress updates
    "--no-warnings", // Suppress warnings
  ];

  return new Promise((resolve, reject) => {
    const ytDlp = spawn("yt-dlp", args);

    ytDlp.stdout.on("data", (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(output);
      }
    });

    ytDlp.stderr.on("data", (data) => {
      const error = data.toString().trim();
      if (error && !error.includes("WARNING:")) {
        console.error(error);
      }
    });

    ytDlp.on("close", (code) => {
      if (code === 0) {
        console.log(`\n✅ Download completed successfully!`);
        console.log(`📁 Files saved to: ${outputDir}`);

        // List downloaded files
        const files = fs.readdirSync(outputDir);
        const audioFiles = files.filter(f =>
          f.endsWith(`.${audioFormat}`) || f.endsWith(".mp3") || f.endsWith(".m4a")
        );

        if (audioFiles.length > 0) {
          console.log(`\n🎧 Downloaded audio files:`);
          audioFiles.forEach(f => {
            const filePath = path.join(outputDir, f);
            const stats = fs.statSync(filePath);
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(`   - ${f} (${sizeMB} MB)`);
          });
        }

        resolve();
      } else {
        console.error(`\n❌ Download failed with exit code: ${code}`);
        reject(new Error(`yt-dlp exited with code ${code}`));
      }
    });
  });
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);

  let bvid = null;
  let outputDir = "downloads";
  let audioFormat = "m4a";

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--output=") || arg.startsWith("-o=")) {
      outputDir = arg.split("=")[1];
    } else if (arg.startsWith("--format=") || arg.startsWith("-f=")) {
      audioFormat = arg.split("=")[1];
    } else if (!arg.startsWith("-")) {
      bvid = arg;
    }
  }

  return { bvid, outputDir, audioFormat };
}

// Main execution
async function main() {
  const { bvid, outputDir, audioFormat } = parseArgs();
  const videoId = extractBVId(bvid);

  try {
    await downloadAudio(videoId, { outputDir, audioFormat });
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Show help if no arguments or --help
if (process.argv.length <= 2 || process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
🎵 BiliFM - Enhanced Bilibili Audio Downloader

Usage:
  node bili-audio-downloader.js <BV_ID|URL> [OPTIONS]

Arguments:
  BV_ID    The Bilibili video BV ID (e.g., BV1Edz6ByEGe)
  URL      The full Bilibili video URL

Options:
  -o, --output=<DIR>     Output directory (default: downloads)
  -f, --format=<FORMAT>  Audio format: m4a, mp3, best (default: m4a)
  -h, --help             Show this help message

Examples:
  # Download by BV ID
  node bili-audio-downloader.js BV1Edz6ByEGe

  # Download by URL
  node bili-audio-downloader.js "https://www.bilibili.com/video/BV1Edz6ByEGe"

  # Specify output directory and format
  node bili-audio-downloader.js BV1Edz6ByEGe -o ./music -f mp3
`);
  process.exit(0);
}

main();
