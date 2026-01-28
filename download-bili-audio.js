/**
 * Download Bilibili Video as Audio using bilibili-api-ts
 * Usage: node download-bili-audio.js <video_url_or_bvid>
 */

import { Video } from "bilibili-api-ts/video.js";
import { Credential } from "bilibili-api-ts/models/Credential.js";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Video ID from the URL: BV1Edz6ByEGe
const VIDEO_BVID = process.argv[2] || "BV1Edz6ByEGe";
const OUTPUT_DIR = path.join(__dirname, "downloads");

async function downloadAudio(bvid) {
  console.log(`Starting download for video: ${bvid}`);

  // Create downloads directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    // Create video instance
    const video = new Video({ bvid: bvid });

    // Get video info
    console.log("Fetching video information...");
    const videoInfo = await video.get_info();

    console.log("Video info response:", JSON.stringify(videoInfo, null, 2));

    const title = (videoInfo.title || videoInfo.data?.title || "video").replace(/[<>:"/\\|?*]/g, "_");
    console.log(`Video title: ${title}`);

    // Get download URL (DASH format includes both video and audio)
    console.log("Fetching download URL...");
    const downloadData = await video.get_download_url({ page_index: 0 });

    // Extract audio stream from DASH data
    const audioStreams = downloadData.data.dash?.audio;

    if (!audioStreams || audioStreams.length === 0) {
      throw new Error("No audio streams found in the video");
    }

    // Select the highest quality audio
    const audioStream = audioStreams.reduce((prev, current) => {
      return (current.bandwidth || 0) > (prev.bandwidth || 0) ? current : prev;
    });

    const audioUrl = audioStream.baseUrl || audioStream.base_url;
    const bandwidth = audioStream.bandwidth;
    const codec = audioStream.codecs;

    console.log(`Selected audio stream:`);
    console.log(`  - Bandwidth: ${bandwidth}`);
    console.log(`  - Codec: ${codec}`);
    console.log(`Downloading audio from stream...`);

    // Download audio file
    const response = await axios({
      method: "GET",
      url: audioUrl,
      responseType: "stream",
      headers: {
        "Referer": "https://www.bilibili.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    const outputPath = path.join(OUTPUT_DIR, `${title}.m4a`);
    const writer = fs.createWriteStream(outputPath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        console.log(`\n✅ Download completed successfully!`);
        console.log(`📁 Audio file saved to: ${outputPath}`);
        resolve();
      });
      writer.on("error", (err) => {
        console.error("❌ Write error:", err.message);
        reject(err);
      });

      // Log progress
      response.data.on("data", (chunk) => {
        process.stdout.write(".");
      });
    });

  } catch (error) {
    console.error("❌ Download failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
    }
    console.error("\nFull error:", error);
    process.exit(1);
  }
}

// Run the download
downloadAudio(VIDEO_BVID);
