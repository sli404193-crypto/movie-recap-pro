import ffmpeg from "fluent-ffmpeg";
import ytdl from "ytdl-core";
import { Readable } from "stream";
import path from "path";
import fs from "fs";
import os from "os";

/**
 * Extract audio from a video file or stream
 * Returns a readable stream of audio data
 */
export async function extractAudioFromFile(
  filePath: string,
  outputFormat: "mp3" | "wav" = "mp3"
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const tempDir = os.tmpdir();
    const outputPath = path.join(tempDir, `audio-${Date.now()}.${outputFormat}`);

    ffmpeg(filePath)
      .toFormat(outputFormat)
      .audioCodec("libmp3lame")
      .audioBitrate("128k")
      .audioFrequency(16000)
      .audioChannels(1)
      .on("error", (err: any) => {
        // Clean up temp file
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        reject(new Error(`FFmpeg error: ${err.message}`));
      })
      .on("end", () => {
        try {
          const audioBuffer = fs.readFileSync(outputPath);
          // Clean up temp file
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          resolve(audioBuffer);
        } catch (err) {
          reject(new Error(`Failed to read audio file: ${err}`));
        }
      })
      .save(outputPath);
  });
}

/**
 * Extract audio from a YouTube or social media URL
 * Supports: YouTube, TikTok, Instagram, Douyin, etc.
 */
export async function extractAudioFromUrl(
  videoUrl: string,
  outputFormat: "mp3" | "wav" = "mp3"
): Promise<Buffer> {
  try {
    // Check if it's a YouTube URL
    if (ytdl.validateURL(videoUrl)) {
      return await extractAudioFromYouTube(videoUrl, outputFormat);
    }

    // For other URLs, try direct download
    return await extractAudioFromDirectUrl(videoUrl, outputFormat);
  } catch (error) {
    throw new Error(`Failed to extract audio from URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Extract audio from YouTube video
 */
async function extractAudioFromYouTube(
  youtubeUrl: string,
  outputFormat: "mp3" | "wav" = "mp3"
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const tempDir = os.tmpdir();
    const outputPath = path.join(tempDir, `audio-${Date.now()}.${outputFormat}`);

    try {
      const stream = ytdl(youtubeUrl, {
        quality: "lowest", // Get lowest quality for faster download
        filter: "audioonly",
      });

      ffmpeg(stream)
        .toFormat(outputFormat)
        .audioCodec("libmp3lame")
        .audioBitrate("128k")
        .audioFrequency(16000)
        .audioChannels(1)
        .on("error", (err: any) => {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          reject(new Error(`FFmpeg error: ${err.message}`));
        })
        .on("end", () => {
          try {
            const audioBuffer = fs.readFileSync(outputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            resolve(audioBuffer);
          } catch (err) {
            reject(new Error(`Failed to read audio file: ${err}`));
          }
        })
        .save(outputPath);
    } catch (error) {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      reject(new Error(`YouTube extraction failed: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
}

/**
 * Extract audio from direct video URL (MP4, WebM, etc.)
 */
async function extractAudioFromDirectUrl(
  videoUrl: string,
  outputFormat: "mp3" | "wav" = "mp3"
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const tempDir = os.tmpdir();
    const outputPath = path.join(tempDir, `audio-${Date.now()}.${outputFormat}`);

    try {
      ffmpeg(videoUrl)
        .toFormat(outputFormat)
        .audioCodec("libmp3lame")
        .audioBitrate("128k")
        .audioFrequency(16000)
        .audioChannels(1)
        .on("error", (err: any) => {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          reject(new Error(`FFmpeg error: ${err.message}`));
        })
        .on("end", () => {
          try {
            const audioBuffer = fs.readFileSync(outputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            resolve(audioBuffer);
          } catch (err) {
            reject(new Error(`Failed to read audio file: ${err}`));
          }
        })
        .save(outputPath);
    } catch (error) {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      reject(new Error(`Direct URL extraction failed: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
}

/**
 * Validate if a URL is a supported video platform
 */
export function isSupportedVideoUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Supported platforms
    const supportedPlatforms = [
      "youtube.com",
      "youtu.be",
      "tiktok.com",
      "vm.tiktok.com",
      "vt.tiktok.com",
      "instagram.com",
      "douyin.com",
      "v.douyin.com",
      "facebook.com",
      "fb.watch",
      "vimeo.com",
      "dailymotion.com",
      "twitch.tv",
    ];

    return supportedPlatforms.some((platform) => hostname.includes(platform));
  } catch {
    return false;
  }
}

/**
 * Get platform name from URL
 */
export function getPlatformName(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return "YouTube";
    if (hostname.includes("tiktok.com")) return "TikTok";
    if (hostname.includes("instagram.com")) return "Instagram";
    if (hostname.includes("douyin.com")) return "Douyin";
    if (hostname.includes("facebook.com") || hostname.includes("fb.watch")) return "Facebook";
    if (hostname.includes("vimeo.com")) return "Vimeo";
    if (hostname.includes("dailymotion.com")) return "Dailymotion";
    if (hostname.includes("twitch.tv")) return "Twitch";

    return "Video";
  } catch {
    return "Video";
  }
}
