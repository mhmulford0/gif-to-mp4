const Queue = require("bull");

const { v4: uuidv4 } = require("uuid");

const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");

const videoQueue = new Queue("video transcoding", "redis://localhost:6379");

videoQueue.process((job) => {
  const ffmpeg = require("fluent-ffmpeg")()
    .setFfprobePath(ffprobe.path)
    .setFfmpegPath(ffmpegInstaller.path);
  return new Promise((resolve, reject) => {
    ffmpeg
      .input(job.data.video)
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
});

videoQueue.on("completed", function (job) {
  console.log("--- Job ---");
  console.log("ID: " + job.id);
  console.table(job.data);
  console.log("Completed At: " + job.finishedOn);
});

videoQueue.on("error", function (job) {
  console.log("--- Job ---");
  console.log("Job ID: " + job.message);
});

async function main() {
  const numberOfRuns = [...Array(3)];
  numberOfRuns.map(() => videoQueue.add({ video: "./mid.gif" }));
}

main()
  .then()
  .catch(() => {
    console.log(e)
  });
