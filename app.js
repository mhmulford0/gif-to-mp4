const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");

const ffmpeg = require("fluent-ffmpeg")()
  .setFfprobePath(ffprobe.path)
  .setFfmpegPath(ffmpegInstaller.path);

const Queue = require("bee-queue");
const queue = new Queue("convert-gif");

const d = new Date();

function processImage(gifPath, idx) {
  const job = queue.createJob({ gifPath: "./mid.gif", id: d.getSeconds() });
  job.save();
  job.on("succeeded", (result) => {
    console.log(`Completed Job:  ${job.id}`);
  });
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
      .output(`vidgif${idx}.mp4`)
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
  await processImage("./mid.gif", d.getSeconds());
  await processImage("./mid.gif", d.getSeconds() + 10);

  queue.process(2, async (job, done) => {
    console.log(`Processing job ${job.id}`);
    try {
    } catch (error) {
      console.log(error);
    }
    return done(null);
  });
}

main();
