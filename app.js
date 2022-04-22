const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");

const Queue = require("bee-queue");
const queue = new Queue("convert-gif");
const express = require("express");

function processImage(gifPath) {
  const stats = fs.statSync(gifPath);

  if (stats.size > 27214400) {
    throw new Error("File too Large, must be under 25mb");
  }

  queue.getJobs("waiting").then((jobs) => {
    const jobIds = jobs.map((job) => job.id);
    console.log("Jobs In queue: " + jobIds.length);
  });

  const ffmpeg = require("fluent-ffmpeg")()
    .setFfprobePath(ffprobe.path)
    .setFfmpegPath(ffmpegInstaller.path);
  return new Promise((resolve, reject) => {
    ffmpeg
      .input(gifPath)
      .outputOptions([
        "-pix_fmt yuv420p",
        "-c:v libx264",
        "-movflags +faststart",
        "-filter:v crop='floor(in_w/2)*2:floor(in_h/2)*2'",
      ])
      .noAudio()
      .output(`${uuidv4()}.mp4`)
      .on("end", () => {
        resolve();
      })
      .on("error", (e) => {
        return reject(new Error(e));
      })
      .run();
  });
}

async function main() {
  let fileLocations = [];
  fileLocations = [...Array(10)];

  if (fileLocations.length < 1) {
    throw new Error("No Files provided")
  };

  fileLocations.map(() => {
    const job = queue.createJob({ id: uuidv4() });
    job.save();
    job.on("succeeded", (result) => {
      console.log(`Completed Job:  ${job.id}`);
    });
    job.on("failed", (err) => {
      console.log(`Job failed: ${err}`);
    });
  });

  queue.process(2, async (job, done) => {
    console.log(`Processing Job: ${job.id}`);
    await processImage("./mid.gif");
    try {
    } catch (error) {
      console.log(error);
    }
    return done(null);
  });
}
main();
